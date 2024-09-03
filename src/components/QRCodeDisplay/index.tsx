import React from 'react';
import QRCode from 'react-qr-code';
import { Button, Tooltip, Row, Col, Input, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';

interface QRCodeDisplayProps {
    value: string;
    amount: number;
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

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, amount }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        notification.success({ message: 'Address copied to clipboard!', placement: 'top' });
    };

    return (
        <StyledRow gutter={[16, 16]}>
            <StyledCol span={12} offset={6}>
                <FullWidthRow>
                    <Col span={20}>
                        <FullWidthInput value={value} readOnly />
                    </Col>
                    <RightAlignedCol span={4}>
                        <Tooltip title="Copy Address">
                            <Button size="middle" icon={<CopyOutlined />} onClick={copyToClipboard} aria-label="Copy Address" />
                        </Tooltip>
                    </RightAlignedCol>
                </FullWidthRow>
            </StyledCol>
            <QRCodeWrapper span={12} offset={6}>
                <StyledQRCode id="qr-code-display" name="qr-code-display" value={value} />
                <span>Scan and send {amount} BTC</span>
            </QRCodeWrapper>
        </StyledRow>
    );
};

export default QRCodeDisplay;
