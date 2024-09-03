'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import RequestForm from '@/components/RequestForm';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Button, Col, notification, Result, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion for animations
import { useWallet } from '@/context/walletContext';
import Link from 'next/link';

const Container = styled.div`
    display: flex;
    flex-direction: column; /* Change to column for vertical alignment */
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 0 auto;
`;

const QRCodeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0px;
    width: 100%; // Ensure QR code wrapper is responsive

    @media (max-width: 768px) {
        margin-top: 0px;
    }
`;

const LoadingIcon = styled(LoadingOutlined)`
    font-size: 64px;
    color: #1677ff !important;
    margin-top: 50px;
`;

const MotionDiv = styled(motion.div)`
    position: relative;
    z-index: 1;
`;

const CenteredRow = styled(Row)`
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: auto;
    text-align: center;
`;

const Home: React.FC = () => {
    const { wallet } = useWallet();
    const [currentStep, setCurrentStep] = useState<'enterAmount' | 'showQRCode' | 'unconfirmed' | 'confirmed' | 'error'>('enterAmount');
    const [paymentRequest, setPaymentRequest] = useState<string>('');
    const [btcAmount, setBtcAmount] = useState<number>(0);
    const [transaction, setTransaction] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleFormSubmit = (amount: number) => {
        if (!wallet.address) {
            notification.error({
                message: 'Wallet Not Available',
                description: 'Your wallet is not available currently, please try again later.',
                placement: 'top',
            });
            return;
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            notification.error({
                message: 'Invalid Amount',
                description: 'Please enter a valid BTC amount.',
                placement: 'top',
            });
            return;
        }

        setBtcAmount(amount); // Store the BTC amount
        setPaymentRequest(`bitcoin:${wallet.address}?amount=${amount}`);
        setCurrentStep('showQRCode'); // Move to the next step to show the QR code
        pollPaymentStatus(wallet.address, amount, new Date().getTime());
    };

    const pollPaymentStatus = (address: string, amount: number, qrGeneratedTime: number) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`/api/payment/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address, amount, qrGeneratedTime }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to check payment status: ${response.statusText}`);
                }

                const data = await response.json();

                if (data && data.success) {
                    // Switch steps based on payment status
                    switch (data.status) {
                        case 'awaiting':
                            setCurrentStep('showQRCode');
                            break;
                        case 'unconfirmed':
                            setTransaction(data.data.transactionId);
                            setCurrentStep('unconfirmed');
                            break;
                        case 'confirmed':
                            setTransaction(data.data.transactionId);
                            setCurrentStep('confirmed');
                            clearInterval(intervalRef.current!);
                            break;
                        case 'error':
                            setCurrentStep('error');
                            clearInterval(intervalRef.current!);
                            break;
                        default:
                            setCurrentStep('error');
                            clearInterval(intervalRef.current!);
                            break;
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                setCurrentStep('error');
                clearInterval(intervalRef.current!);
            }
        }, Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL)); // Use environment variable for polling interval
    };

    // Function to handle going back to the previous step
    const handleBack = () => {
        setCurrentStep('enterAmount');
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
    const renderContent = () => {
        if (!wallet.address) {
            return <LoadingIcon />;
        } else if (currentStep === 'enterAmount') {
            return <RequestForm onSubmit={handleFormSubmit} />;
        } else {
            return (
                <MotionDiv key={currentStep} initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1, exit: { duration: 0.0 } }}>
                    {currentStep === 'showQRCode' && (
                        <QRCodeWrapper>
                            <QRCodeDisplay value={paymentRequest} amount={btcAmount} />
                            <Button key="go-back" type="primary" onClick={handleBack} style={{ marginTop: '10px' }}>
                                Go back
                            </Button>
                        </QRCodeWrapper>
                    )}
                    {currentStep === 'unconfirmed' && (
                        <CenteredRow>
                            <Col span={24}>
                                <Result
                                    icon={<LoadingOutlined />}
                                    title="Payment detected"
                                    subTitle="Waiting for confirmation, please wait..."
                                    extra={[
                                        <Button type="primary" key="console">
                                            <Link href={`https://blockstream.info/tx/${transaction}`} target="_blank">
                                                See transaction
                                            </Link>
                                        </Button>,
                                        <Button key="deposit" onClick={handleBack}>
                                            Deposit Again
                                        </Button>,
                                    ]}
                                />
                            </Col>
                        </CenteredRow>
                    )}
                    {currentStep === 'confirmed' && (
                        <CenteredRow>
                            <Col span={24}>
                                <Result
                                    status="success"
                                    title="Payment Confirmed!"
                                    subTitle={`Your payment of ${btcAmount} tBTC has been successfully confirmed.`}
                                    extra={[
                                        <Button type="primary" key="console">
                                            <Link href={`https://blockstream.info/tx/${transaction}`} target="_blank">
                                                See transaction
                                            </Link>
                                        </Button>,
                                        <Button key="deposit" onClick={handleBack}>
                                            Deposit Again
                                        </Button>,
                                    ]}
                                />
                            </Col>
                        </CenteredRow>
                    )}
                    {currentStep === 'error' && (
                        <CenteredRow>
                            <Col span={24}>
                                <Result status="error" title="Transaction Error" subTitle="A problem was encountered while processing your payment. Please try again later." />
                            </Col>
                        </CenteredRow>
                    )}
                </MotionDiv>
            );
        }
    };

    return (
        <Container>
            <AnimatePresence>{renderContent()}</AnimatePresence>
        </Container>
    );
};

export default Home;
