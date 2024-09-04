import React, { FC } from 'react';
import { Button, Col, Result, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styled from 'styled-components';

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
  <CenteredRow>
    <Col span={24}>
      <Result
        icon={<LoadingOutlined data-testid="loading-outlined" />}
        title="Payment Detected"
        subTitle="Waiting for confirmation. Please wait..."
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

export default UnconfirmedStep;
