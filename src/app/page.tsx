'use client';

import React, { useState, useEffect, useRef, FC } from 'react';
import styled from 'styled-components';
import { notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AnimatePresence } from 'framer-motion';
import { useWallet } from '@/context/walletContext';
import RequestForm from '@/components/RequestStep';
import QRCodeStep from '@/components/QRCodeStep';
import UnconfirmedStep from '@/components/UnconfirmedStep';
import ConfirmedStep from '@/components/ConfirmedStep';
import ErrorStep from '@/components/ErrorStep';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 0 auto;
`;

const LoadingIcon = styled(LoadingOutlined)`
  font-size: 64px;
  color: #1677ff !important;
  margin-top: 50px;
`;

// Types for components
type StepType = 'enterAmount' | 'showQRCode' | 'unconfirmed' | 'confirmed' | 'error';

interface PaymentStatusResponse {
  success: boolean;
  status: StepType;
  data?: {
    transactionId: string;
  };
}

// Main component
const Home: FC = () => {
  const { wallet } = useWallet();
  const [currentStep, setCurrentStep] = useState<StepType>('enterAmount');
  const [paymentRequest, setPaymentRequest] = useState<string>('');
  const [btcAmount, setBtcAmount] = useState<number>(0);
  const [transaction, setTransaction] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFormSubmit = (amount: number) => {
    if (!wallet.address) {
      notifyError('Wallet Not Available', 'Your wallet is currently unavailable. Please try again later.');
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      notifyError('Invalid Amount', 'Please enter a valid BTC amount.');
      return;
    }

    setBtcAmount(amount);
    setPaymentRequest(`bitcoin:${wallet.address}?amount=${amount}`);
    setCurrentStep('showQRCode');
    pollPaymentStatus(wallet.address, amount);
  };

  const pollPaymentStatus = (address: string, amount: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, amount }),
        });

        if (!response.ok) {
          throw new Error(`Failed to check payment status: ${response.statusText}`);
        }

        const data: PaymentStatusResponse = await response.json();
        handlePaymentStatus(data);
      } catch (error) {
        setCurrentStep('error');
        clearInterval(intervalRef.current!);
      }
    }, Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL)); // Use environment variable for polling interval
  };

  const handlePaymentStatus = (data: PaymentStatusResponse) => {
    if (data && data.success) {
      setCurrentStep(data.status);

      // Add transaction link or stop polling
      switch (data.status) {
        case 'unconfirmed':
          setTransaction(data.data?.transactionId || null);
          break;
        case 'confirmed':
          setTransaction(data.data?.transactionId || null);
          clearInterval(intervalRef.current!);
          break;
        default:
          clearInterval(intervalRef.current!);
          break;
      }
    } else {
      setCurrentStep('error');
      clearInterval(intervalRef.current!);
    }
  };

  const notifyError = (message: string, description: string) => {
    notification.error({ message, description, placement: 'top' });
  };

  const handleBack = () => {
    setCurrentStep('enterAmount');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const renderContent = () => {
    switch (wallet.address && currentStep) {
      case 'enterAmount':
        return <RequestForm onSubmit={handleFormSubmit} />;
      case 'showQRCode':
        return <QRCodeStep paymentRequest={paymentRequest} btcAmount={btcAmount} onCancel={handleBack} />;
      case 'unconfirmed':
        return <UnconfirmedStep transaction={transaction} onBack={handleBack} />;
      case 'confirmed':
        return <ConfirmedStep transaction={transaction} btcAmount={btcAmount} onBack={handleBack} />;
      case 'error':
        return <ErrorStep onBack={handleBack} />;
      default:
        return <LoadingIcon />;
    }
  };

  return (
    <Container>
      <AnimatePresence>{renderContent()}</AnimatePresence>
    </Container>
  );
};

export default Home;
