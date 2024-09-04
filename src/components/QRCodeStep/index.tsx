import React, { FC } from 'react';
import QRCode from 'react-qr-code';
import { Button, Tooltip, Row, Col, Input, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface QRCodeStepProps {
  paymentRequest: string;
  btcAmount: number;
  onCancel: () => void;
}

const StyledRow = styled(Row)`
  width: 100%;
  margin: auto;
`;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
  text-align: right;
`;

const FullWidthRow = styled(Row)`
  width: 100%;
`;

const FullWidthInput = styled(Input)`
  width: 100%;
`;

const RightAlignedCol = styled(Col)`
  text-align: right;
`;

const StyledQRCode = styled(QRCode)`
  width: 100%;
  height: auto;
`;

const QRCodeWrapper = styled(Col)`
  span {
    display: block;
    margin-top: 10px;
    text-align: center;
  }
`;

const QRCodeStep: FC<QRCodeStepProps> = ({ paymentRequest, btcAmount, onCancel }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentRequest);
    notification.success({ message: 'Address copied to clipboard!', placement: 'top' });
  };

  return (
    <motion.div key="showQRCode" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
      <QRCodeWrapper>
        <StyledRow gutter={[16, 16]}>
          <StyledCol xs={{ span: 16, offset: 4 }} sm={{ span: 14, offset: 5 }} md={{ span: 14, offset: 5 }} lg={{ span: 14, offset: 5 }} xl={{ span: 14, offset: 5 }}>
            <FullWidthRow>
              <Col span={20}>
                <FullWidthInput value={paymentRequest} readOnly />
              </Col>
              <RightAlignedCol span={4}>
                <Tooltip title="Copy Address">
                  <Button size="middle" icon={<CopyOutlined />} onClick={copyToClipboard} aria-label="Copy Address" />
                </Tooltip>
              </RightAlignedCol>
            </FullWidthRow>
          </StyledCol>
          <QRCodeWrapper xs={{ span: 16, offset: 4 }} sm={{ span: 14, offset: 5 }} md={{ span: 14, offset: 5 }} lg={{ span: 14, offset: 5 }} xl={{ span: 14, offset: 5 }}>
            <StyledQRCode data-testid="qr-code-display" id="qr-code-display" name="qr-code-display" value={paymentRequest} />
            <span>Scan and send {btcAmount} BTC</span>
          </QRCodeWrapper>
        </StyledRow>
        <Button type="primary" style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }} onClick={onCancel}>
          Cancel
        </Button>
      </QRCodeWrapper>
    </motion.div>
  );
};

export default QRCodeStep;
