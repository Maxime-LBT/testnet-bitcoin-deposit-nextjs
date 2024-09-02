import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Wallet from '@/components/Wallet';
import { useWallet } from '@/context/walletContext';

// Mock the wallet context
jest.mock('@/context/walletContext', () => ({
  useWallet: jest.fn(),
}));

// Corrected mock for global.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    json: () =>
      Promise.resolve({
        data: {
          balance: 5,
          transactions: [
            { txid: 'abcd1234', direction: 'Received', amount: 1 },
            { txid: 'efgh5678', direction: 'Sent', amount: 2 },
          ],
        },
      }),
  })
);

describe('Wallet Component', () => {
  const mockWallet = {
    address: 'test-address',
    privateKey: 'test-private-key',
    mnemonic: 'test-mnemonic',
  };

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({ wallet: mockWallet });
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<Wallet />);

 

    // Check if the buttons are present
    const infoButton = screen.getByRole('button', { name: "Display wallet information" });
    const transactionsButton = screen.getByRole('button', { name: "Display wallet transactions" });
    expect(infoButton).toBeInTheDocument();
    expect(transactionsButton).toBeInTheDocument();
  });

  test('shows wallet modal when button is clicked', async () => {
    render(<Wallet />);

    const infoButton = screen.getByRole('button', { name: "Display wallet information" });
    fireEvent.click(infoButton);

    const modalTitle = await screen.findByText('Wallet');
    expect(modalTitle).toBeInTheDocument();
  });

  test('shows transactions drawer when button is clicked', async () => {
    render(<Wallet />);

    const transactionsButton = screen.getByRole('button', { name: /display wallet transactions/i });
    fireEvent.click(transactionsButton);

    const drawerTitle = await screen.findByText('2 Transactions');
    expect(drawerTitle).toBeInTheDocument();
  });

  test('fetches and displays balance and transactions correctly', async () => {
    render(<Wallet />);

    // Wait for the balance to be fetched and displayed
    await waitFor(() => expect(screen.getByText('5 tBTC')).toBeInTheDocument());

    // Check if the transactions are displayed correctly in the drawer
    const transactionsButton = screen.getByRole('button', { name: /display wallet transactions/i });
    fireEvent.click(transactionsButton);

    const receivedTransaction = await screen.findByText('Transaction ID: abcd...1234');
    const sentTransaction = await screen.findByText('Transaction ID: efgh...5678');
    expect(receivedTransaction).toBeInTheDocument();
    expect(sentTransaction).toBeInTheDocument();
  });
});
