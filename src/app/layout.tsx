"use client";

import React from "react";
import styled from "styled-components";
import { Card, Row, Col, Space } from "antd";
import { Ubuntu } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
// import { Metadata } from "next";
import Title from "antd/es/typography/Title";
import { DownloadOutlined, GithubFilled, QuestionCircleFilled } from "@ant-design/icons";
import Wallet from "@/components/Wallet";
import { WalletProvider } from "@/context/walletContext";
import StyledJsxRegistry from "./registry";

const ubuntu = Ubuntu({ subsets: ["latin"], weight: "300" });

const Body = styled.body`
  background-color: #0a192f;
  height: 100vh;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledCol = styled(Col)`
  width: 100%;
`;

const TitleCol = styled(Col)`
  text-align: right;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  height: 500px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const IconSpace = styled(Space)`
  margin-top: 16px;
  text-align: right;
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ubuntu.className}>
      <Body>
      <StyledJsxRegistry>
        <AntdRegistry>
          <WalletProvider>
            <Row style={{ width: "100%" }}>
              <StyledCol
                xs={{ span: 22, offset: 1 }}
                sm={{ span: 20, offset: 2 }}
                md={{ span: 16, offset: 4 }}
                lg={{ span: 12, offset: 6 }}
                xl={{ span: 8, offset: 8 }}
              >
                <Row>
                  <Col xs={24} sm={12}>
                    <span style={{color:"white", fontSize:"24px", fontWeight : "bold"}}>
                      TBDA
                    </span>
                  </Col>
                  <TitleCol xs={24} sm={12}>
                    <Wallet />
                  </TitleCol>
                </Row>
                <Row style={{marginTop : "16px"}}>
                  <Col span={24}>
                    <StyledCard
                      bordered={false}
                      title={
                        <Space align="baseline">
                          <DownloadOutlined style={{ fontSize: "20px" }} />
                          <Title level={4}> Deposit</Title>
                        </Space>
                      }
                    >
                      {children}
                    </StyledCard>
                  </Col>
                </Row>
                <Row>
                  <IconSpace>
                    <QuestionCircleFilled style={{ color: "white", fontSize: "24px" }} />
                    <GithubFilled style={{ color: "white", fontSize: "24px" }} />
                  </IconSpace>
                </Row>
              </StyledCol>
            </Row>
          </WalletProvider>
        </AntdRegistry>
        </StyledJsxRegistry>
      </Body>
    </html>
  );
}
