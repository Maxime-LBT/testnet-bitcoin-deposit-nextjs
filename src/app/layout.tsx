'use client';

import React from 'react';
import styled from 'styled-components';
import { Card, Row, Col, Space } from 'antd';
import { Ubuntu } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
// import { Metadata } from "next";
import Title from 'antd/es/typography/Title';
import { DownloadOutlined, GithubFilled } from '@ant-design/icons';
import Wallet from '@/components/Wallet';
import { WalletProvider } from '@/context/walletContext';
import StyledJsxRegistry from './registry';
import Link from 'next/link';

const ubuntu = Ubuntu({ subsets: ['latin'], weight: '300' });

const StyledCol = styled(Col)`
    width: 100%;
`;

const TitleCol = styled(Col)`
    text-align: right;
`;

const StyledCard = styled(Card)`
    border-radius: 12px;
    background-color: #ffffff;
    height: 500px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const SpaceRow = styled(Row)`
    margin-top: 16px;
    width: 100%;
`;

const StyledTitle = styled.span`
    color: white;
    font-size: 24px;
    font-weight: bold;
`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={ubuntu.className}>
            <body style={{ backgroundColor: '#0a192f', height: '100vh', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StyledJsxRegistry>
                    <AntdRegistry>
                        <WalletProvider>
                            <SpaceRow>
                                <StyledCol xs={{ span: 22, offset: 1 }} sm={{ span: 20, offset: 2 }} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }} xl={{ span: 8, offset: 8 }}>
                                    <Row>
                                        <Col xs={24} sm={12}>
                                            <StyledTitle>TBDA</StyledTitle>
                                        </Col>
                                        <TitleCol xs={24} sm={12}>
                                            <Wallet />
                                        </TitleCol>
                                    </Row>
                                    <SpaceRow>
                                        <Col span={24}>
                                            <StyledCard
                                                bordered
                                                title={
                                                    <Space align="baseline">
                                                        <DownloadOutlined style={{ fontSize: '24px' }} />
                                                        <Title level={4}> Deposit</Title>
                                                    </Space>
                                                }
                                            >
                                                {children}
                                            </StyledCard>
                                        </Col>
                                    </SpaceRow>
                                    <SpaceRow>
                                        <Space>
                                            <Link href={'https://github.com/Maxime-LBT/testnet-bitcoin-deposit-nextjs'}>
                                                <GithubFilled style={{ color: 'white', fontSize: '24px' }} />
                                            </Link>
                                        </Space>
                                    </SpaceRow>
                                </StyledCol>
                            </SpaceRow>
                        </WalletProvider>
                    </AntdRegistry>
                </StyledJsxRegistry>
            </body>
        </html>
    );
}
