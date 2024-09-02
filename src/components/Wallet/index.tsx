import React, { useEffect, useState } from "react";
import { Space, Tooltip, Button, Modal, Form, Input, Divider, Skeleton, Drawer, List, Avatar } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, UnorderedListOutlined, WalletOutlined } from "@ant-design/icons";
import { useWallet } from "@/context/walletContext"; 
import Link from "next/link";
import styled from "styled-components";

const BalanceText = styled.span`
  color: white;
  font-size: 14px;
`;

const WalletTitle = styled.span`
  font-weight: 600;
  font-size: 20px;
`;

const Wallet: React.FC = () => {
  const [isPrivateKeyVisible, setPrivateKeyVisibility] = useState<boolean>(false);
  const [isTransactionsVisible, setTransactionsVisibility] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(-1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { wallet } = useWallet();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (wallet.address) {
        fetchBalance(wallet.address);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [wallet.address]);

  const fetchBalance = async (address: string) => {
    const response = await fetch(`/api/wallet/${address}`);
    const data = await response.json();
    setBalance(data.data.balance);
    setTransactions(data.data.transactions);
  };

  return (
    <Space align="baseline">
      <BalanceText>
        {balance !== -1 ? `${balance} tBTC` : <Skeleton.Input active={true} size={"small"} />}
      </BalanceText>
      <Tooltip title="Display wallet information">
        <Button size="small" name="Display wallet information" onClick={() => setPrivateKeyVisibility(true)}>
          <WalletOutlined style={{ fontSize: "12px" }} />
        </Button>
      </Tooltip>
      <Modal
        title={
          <Space align="baseline">
            <WalletOutlined style={{ fontSize: "20px" }} />
            <WalletTitle>Wallet</WalletTitle>
          </Space>
        }
        open={isPrivateKeyVisible}
        onCancel={() => setPrivateKeyVisibility(false)}
        footer={null}
      >
        <Divider />
        <Form layout="vertical">
          <Form.Item label={<strong>Address</strong>}>
            <Input.TextArea value={wallet.address || "No wallet address available"} readOnly />
          </Form.Item>
          <Form.Item label={<strong>Private Key</strong>}>
            <Input.TextArea value={wallet.privateKey || "No private key available"} readOnly />
          </Form.Item>
          <Form.Item label={<strong>Mnemonic</strong>}>
            <Input.TextArea value={wallet.mnemonic || "No mnemonic available"} readOnly />
          </Form.Item>
        </Form>
      </Modal>
      <Tooltip title="Display wallet transactions">
        <Button type="dashed" name="Display wallet transactions" size="small" onClick={() => setTransactionsVisibility(true)}>
          <UnorderedListOutlined />
        </Button>
      </Tooltip>
      <Drawer title={`${transactions.length} Transaction${transactions.length !== 1 ? "s" : ""}`} onClose={() => setTransactionsVisibility(false)} open={isTransactionsVisible}>
        <List
          dataSource={transactions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: item.direction === "Received" ? "green" : "red" }}>{item.direction === "Received" ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</Avatar>}
                title={
                  <Link href={`https://blockstream.info/testnet/tx/${item.txid}`} target="_blank">
                    Transaction ID: {item.txid.slice(0, 4)}...{item.txid.slice(-4)}
                  </Link>
                }
                description={`Amount: ${item.amount} tBTC`}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </Space>
  );
};

export default Wallet;
