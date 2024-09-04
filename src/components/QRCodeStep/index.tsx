import React, { FC } from 'react';
import QRCode from 'react-qr-code';
import { Button, Tooltip, Row, Col, Input, notification, Space } from 'antd';
import { CopyOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface QRCodeStepProps {
  paymentRequest: string;
  btcAmount: number;
  onCancel: () => void;
}

const FullWidthInput = styled(Input)`
  width: 100%;
`;

const StyledQRCode = styled(QRCode)`
  width: 100%;
  height: auto;
`;

const QRCodeWrapper = styled(Col)`
  span {
    display: block;
    text-align: center;
  }
`;

const LeftAlignedCol = styled(Col)`
  align-items: left;
`;

const CancelButton = styled(Button)`
  background-color: #f5222d !important;
  border-color: #f5222d !important;
`;

const InfoText = styled.span`
  font-size: 16px;
  font-weight: 300;
`;

const ExclamationIcon = styled(ExclamationCircleFilled)`
  color: #1677ff !important;
  font-size: 20px;
`;

const QRCodeStep: FC<QRCodeStepProps> = ({ paymentRequest, btcAmount, onCancel }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentRequest);
    notification.success({ message: 'Address copied to clipboard!', placement: 'top' });
  };

  return (
    <motion.div key="showQRCode" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
      <QRCodeWrapper>
        <Row gutter={[16, 8]}>
          <LeftAlignedCol span={24}>
            <Space align="center">
              <Tooltip title="The payment will be automatically detected.">
                <ExclamationIcon />
              </Tooltip>
              <InfoText>Scan and send {btcAmount} BTC</InfoText>
            </Space>
          </LeftAlignedCol>
          <QRCodeWrapper xs={{ span: 14, offset: 5 }} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 10, offset: 7 }}>
            <StyledQRCode data-testid="qr-code-display" id="qr-code-display" name="qr-code-display" value={paymentRequest} />
          </QRCodeWrapper>
          <Col xs={{ span: 12, offset: 6 }} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 12, offset: 6 }}>
            <Space>
              <FullWidthInput size="small" value={paymentRequest} readOnly />
              <Tooltip title="Copy Address">
                <Button size="small" icon={<CopyOutlined />} onClick={copyToClipboard} aria-label="Copy Address" />
              </Tooltip>
            </Space>
          </Col>
          <Col xs={{ span: 16, offset: 4 }} sm={{ span: 14, offset: 5 }} md={{ span: 14, offset: 5 }} lg={{ span: 14, offset: 5 }} xl={{ span: 14, offset: 5 }}>
            <CancelButton type="primary" onClick={onCancel}>
              Cancel
            </CancelButton>
          </Col>
        </Row>
      </QRCodeWrapper>
    </motion.div>
  );
};

export default QRCodeStep;
