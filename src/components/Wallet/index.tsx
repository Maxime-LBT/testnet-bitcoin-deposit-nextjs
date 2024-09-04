import React, { useEffect, useState } from 'react';
import { Space, Tooltip, Button, Modal, Form, Input, Divider, Skeleton, Drawer, List, Avatar, Badge } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, UnorderedListOutlined, WalletOutlined } from '@ant-design/icons';
import { useWallet } from '@/context/walletContext';
import Link from 'next/link';
import styled from 'styled-components';

const BalanceText = styled.span`
  color: white;
  font-size: 14px;
`;

const WalletTitle = styled.span`
  font-weight: 600;
  font-size: 20px;
`;

interface Transaction {
  txid: string;
  confirmed: boolean;
  direction: 'Sent' | 'Received' | 'Unknown';
  amount: number;
}

const Wallet: React.FC = () => {
  const { wallet } = useWallet();
  const [isPrivateKeyVisible, setPrivateKeyVisibility] = useState<boolean>(false);
  const [isTransactionsVisible, setTransactionsVisibility] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(-1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
    setBalance(data.data ? data.data.balance : -1);
    setTransactions(data.data ? data.data.transactions : []);
  };

  return wallet.address ? (
    <Space align="baseline">
      <BalanceText>{balance !== -1 ? `${balance} tBTC` : <Skeleton.Input active={true} size={'small'} />}</BalanceText>
      <Tooltip title="Display wallet information">
        <Button size="small" title="Display wallet information" name="Display wallet information" onClick={() => setPrivateKeyVisibility(true)}>
          <WalletOutlined style={{ fontSize: '12px' }} />
        </Button>
      </Tooltip>
      <Modal
        title={
          <Space align="baseline">
            <WalletOutlined style={{ fontSize: '20px' }} />
            <WalletTitle>Wallet</WalletTitle>
          </Space>
        }
        open={isPrivateKeyVisible}
        onCancel={() => setPrivateKeyVisibility(false)}
        footer={null}
      >
        <Divider />
        <Form layout="vertical">
          <Form.Item htmlFor="address" label={<strong>Address</strong>}>
            <Input.TextArea name="address" aria-label="address" value={wallet.address || 'No wallet address available'} readOnly />
          </Form.Item>
          <Form.Item htmlFor="privateKey" label={<strong>Private Key</strong>}>
            <Input.TextArea name="privateKey" aria-label="privateKey" value={wallet.privateKey || 'No private key available'} readOnly />
          </Form.Item>
          <Form.Item htmlFor="mnemonic" label={<strong>Mnemonic</strong>}>
            <Input.TextArea name="mnemonic" aria-label="mnemonic" value={wallet.mnemonic || 'No mnemonic available'} readOnly />
          </Form.Item>
        </Form>
      </Modal>
      <Tooltip title="Display wallet transactions">
        <Badge color="green" count={transactions.length}>
          <Button type="dashed" title="Display wallet transactions" name="Display wallet transactions" size="small" onClick={() => setTransactionsVisibility(true)}>
            <UnorderedListOutlined />
          </Button>
        </Badge>
      </Tooltip>
      <Drawer title={`${transactions.length} Transaction${transactions.length !== 1 ? 's' : ''}`} onClose={() => setTransactionsVisibility(false)} open={isTransactionsVisible} destroyOnClose>
        <List
          dataSource={transactions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: item.direction === 'Received' ? 'green' : 'red' }}>{item.direction === 'Received' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</Avatar>}
                title={
                  <Link href={`${process.env.NEXT_PUBLIC_EXPLORER_API_URL}/tx/${item.txid}`} target="_blank">
                    Transaction ID: {item.txid.slice(0, 4)}...{item.txid.slice(-4)} <br />
                    <span style={{ color: item.confirmed ? 'green' : 'red' }}>{item.confirmed ? 'Confirmed' : 'Unconfirmed'}</span>
                  </Link>
                }
                description={`Amount: ${item.amount} tBTC `}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </Space>
  ) : null;
};

export default Wallet;
