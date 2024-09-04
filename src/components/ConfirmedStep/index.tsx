import React, { FC } from 'react';
import { Button, Col, Result, Row } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CenteredRow = styled(Row)`
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: auto;
  text-align: center;
`;

interface ConfirmedStepProps {
  transaction: string | null;
  btcAmount: number;
  onBack: () => void;
}

const ConfirmedStep: FC<ConfirmedStepProps> = ({ transaction, btcAmount, onBack }) => (
  <motion.div key="confirmedStep" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
    <CenteredRow>
      <Col span={24}>
        <Result
          status="success"
          title="Payment Confirmed!"
          subTitle={`Your payment of ${btcAmount} tBTC has been successfully confirmed.`}
          extra={[
            transaction ? (
              <Button type="primary" key="console">
                <Link href={`${process.env.NEXT_PUBLIC_EXPLORER_API_URL}/tx/${transaction}`} target="_blank">
                  View Transaction
                </Link>
              </Button>
            ) : null,
            <Button key="deposit" onClick={onBack}>
              Deposit Again
            </Button>,
          ]}
        />
      </Col>
    </CenteredRow>
  </motion.div>
);

export default ConfirmedStep;
