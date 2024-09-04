import React, { FC } from 'react';
import { Button, Col, Result, Row } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

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
  <CenteredRow>
    <Col span={24}>
      <Result
        status="success"
        title="Payment Confirmed!"
        subTitle={`Your payment of ${btcAmount} tBTC has been successfully confirmed.`}
        extra={[
          transaction ? (
            <Button type="primary" key="console">
              <Link href={`https://blockstream.info/tx/${transaction}`} target="_blank">
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
);

export default ConfirmedStep;
