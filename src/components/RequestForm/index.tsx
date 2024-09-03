import React, { useState } from 'react';
import { Button, Input, Row, Col, Form } from 'antd';
import styled from 'styled-components';

interface RequestFormProps {
    onSubmit: (btcAmount: number) => void;
}

const StyledRow = styled(Row)`
    width: 100%;
    margin: auto;
    text-align: center;
`;

const StyledCol = styled(Col)`
    text-align: left;
`;

const StyledButton = styled(Button)`
    width: 100%;
`;

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit }) => {
    const [amount, setAmount] = useState<number>(0.0001);

    const handleSubmit = (values: { amount: number }) => {
        onSubmit(values.amount);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(parseFloat(e.target.value) || 0);
    };

    return (
        <StyledRow align="middle" justify="center">
            <StyledCol span={24}>
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Enter the amount you want to deposit:" name="amount" rules={[{ required: true, message: 'Please input the amount!' }]}>
                        <Input suffix="tBTC" type="number" step="0.0001" min="0.0001" size="middle" value={amount} onChange={handleAmountChange} placeholder="0.0001" />
                    </Form.Item>
                    <Form.Item>
                        <StyledButton type="primary" htmlType="submit" size="middle">
                            Generate Payment QR Code
                        </StyledButton>
                    </Form.Item>
                </Form>
            </StyledCol>
        </StyledRow>
    );
};

export default RequestForm;
