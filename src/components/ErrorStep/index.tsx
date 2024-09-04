import React, { FC } from 'react';
import { Button, Col, Result, Row } from 'antd';
import styled from 'styled-components';

const CenteredRow = styled(Row)`
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: auto;
  text-align: center;
`;

const ErrorStep: FC<{ onBack: () => void }> = ({ onBack }) => (
  <CenteredRow>
    <Col span={24}>
      <Result
        status="error"
        title="Transaction Error"
        subTitle="An issue was encountered while processing your payment. Please try again later."
        extra={[
          <Button key="deposit" type="primary" onClick={onBack}>
            Try Again
          </Button>,
        ]}
      />
    </Col>
  </CenteredRow>
);

export default ErrorStep;
