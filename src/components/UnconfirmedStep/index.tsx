import React, { FC } from 'react';
import { Button, Col, Result, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
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

interface UnconfirmedStepProps {
  transaction: string | null;
  onBack: () => void;
}

const UnconfirmedStep: FC<UnconfirmedStepProps> = ({ transaction, onBack }) => (
  <motion.div key="confirmedStep" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
    <CenteredRow>
      <Col span={24}>
        <Result
          icon={<LoadingOutlined data-testid="loading-outlined" />}
          title="Payment Detected"
          subTitle="Waiting for confirmation. Please wait..."
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

export default UnconfirmedStep;
