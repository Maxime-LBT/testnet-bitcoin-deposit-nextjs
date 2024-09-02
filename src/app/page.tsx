"use client";

import React, { useState } from "react";
import styled from "styled-components";
import RequestForm from "@/components/RequestForm";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Button, Col, notification, Result, Row } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { useWallet } from "@/context/walletContext";
import Link from "next/link";

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
  color: #1677ff;
  margin-top: 100px;
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
  const [currentStep, setCurrentStep] = useState<"enterAmount" | "showQRCode" | "unconfirmed" | "confirmed" | "error">("enterAmount");
  const [paymentRequest, setPaymentRequest] = useState<string>("");
  const [btcAmount, setBtcAmount] = useState<number>(0);
  const [transaction, setTransaction] = useState<string | null>(null);

  const handleFormSubmit = (amount: number) => {
    if (!wallet.address) {
      notification.error({
        message: "Wallet Not Available",
        description: "Your wallet is not available currently, please try again later.",
        placement: "top",
      });
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      notification.error({
        message: "Invalid Amount",
        description: "Please enter a valid BTC amount.",
        placement: "top",
      });
      return;
    }

    setBtcAmount(amount); // Store the BTC amount
    setPaymentRequest(`bitcoin:${wallet.address}?amount=${amount}`);
    setCurrentStep("showQRCode"); // Move to the next step to show the QR code
    pollPaymentStatus(wallet.address, amount);
  };

  const pollPaymentStatus = (address: string, amount: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, amount: amount }),
        });

        if (!response.ok) {
          throw new Error(`Failed to check payment status: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.success) {
          // Switch steps based on payment status
          switch (data.status) {
            case "awaiting":
              setCurrentStep("showQRCode");
              break;
            case "unconfirmed":
              setTransaction(data.data.transactionId);
              setCurrentStep("unconfirmed");
              break;
            case "confirmed":
              setTransaction(data.data.transactionId);
              setCurrentStep("confirmed");
              clearInterval(interval);
              break;
            case "error":
              setCurrentStep("error");
              clearInterval(interval);
              break;
            default:
              setCurrentStep("error");
              clearInterval(interval);
              break;
          }
        }
      } catch (error) {
        setCurrentStep("error");
        console.error("Error checking payment status:", error);
        clearInterval(interval);
      }
    }, Number(process.env.NEXT_PUBLIC_POLLING_INTERVAL)); // Use environment variable for polling interval
  };

  // Function to handle going back to the previous step
  const handleBack = () => {
    setCurrentStep("enterAmount");
  };

  const renderContent = () => {
    if (!wallet.address) {
      return <LoadingIcon />;
    } else if (currentStep === "enterAmount") {
      return <RequestForm onSubmit={handleFormSubmit} />;
    } else {
      return (
        <MotionDiv
          key={currentStep}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {currentStep === "showQRCode" && (
            <QRCodeWrapper>
              <QRCodeDisplay value={paymentRequest} amount={btcAmount} />
            </QRCodeWrapper>
          )}
          {currentStep === "unconfirmed" && (
            <CenteredRow>
              <Col span={24}>
                <Result
                  icon={<LoadingOutlined />}
                  title="Payment detected"
                  subTitle="Waiting for confirmation, please wait..."
                  extra={[
                    <Button type="primary" key="console">
                      <Link href={`https://blockstream.info/testnet/tx/${transaction}`} target="_blank">
                        See transaction
                      </Link>
                    </Button>,
                  ]}
                />
              </Col>
            </CenteredRow>
          )}
          {currentStep === "confirmed" && (
            <CenteredRow>
              <Col span={24}>
                <Result
                  status="success"
                  title="Payment Confirmed!"
                  subTitle={`Your payment of ${btcAmount} tBTC has been successfully confirmed.`}
                  extra={[
                    <Button type="primary" key="console">
                      <Link href={`https://blockstream.info/testnet/tx/${transaction}`} target="_blank">
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
          {currentStep === "error" && (
            <CenteredRow>
              <Col span={24}>
                <Result status="error" title="Error" subTitle="An error occurred while processing your payment." />
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
