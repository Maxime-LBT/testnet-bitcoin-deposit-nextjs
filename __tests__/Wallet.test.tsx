import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Wallet from '@/components/Wallet';
import { useWallet } from '@/context/walletContext';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Mock the wallet context
jest.mock('@/context/walletContext', () => ({
  useWallet: jest.fn(),
}));

// Mock global fetch
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
          balance: 3,
          transactions: [
            { txid: 'abcd1234', direction: 'Received', amount: 1 },
            { txid: 'efgh5678', direction: 'Received', amount: 2 },
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

  test('renders correctly', async () => {
    render(<Wallet />);

    const infoButton = screen.getByTitle('Display wallet information');
    const transactionsButton = screen.getByTitle('Display wallet transactions');

    expect(infoButton).toBeInTheDocument();
    expect(transactionsButton).toBeInTheDocument();
  });

  test('shows wallet modal when button is clicked', async () => {
    render(<Wallet />);

    await act(async () => {
      const infoButton = screen.getByTitle(/display wallet information/i);
      fireEvent.click(infoButton);
    });

    const modalTitle = await screen.findByText('Wallet');
    expect(modalTitle).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: 'address' })).toHaveValue('test-address');
    expect(screen.getByRole('textbox', { name: 'privateKey' })).toHaveValue('test-private-key');
    expect(screen.getByRole('textbox', { name: 'mnemonic' })).toHaveValue('test-mnemonic');
  });

  test('opens and closes the transactions drawer', async () => {
    render(<Wallet />);

    // Open the transactions drawer
    await act(async () => {
      const transactionsButton = screen.getByTitle(/display wallet transactions/i);
      fireEvent.click(transactionsButton);
    });

    // Check that the drawer is opened and transactions are displayed
    const drawerTitle = await screen.findByText('2 Transactions');
    expect(drawerTitle).toBeInTheDocument();

    // Verify that each transaction item is displayed
    const firstTransaction = screen.getByText(/transaction id: abcd...1234/i);
    const secondTransaction = screen.getByText(/transaction id: efgh...5678/i);
    expect(firstTransaction).toBeInTheDocument();
    expect(secondTransaction).toBeInTheDocument();

    // Close the transactions drawer
    await act(async () => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
    });

    // Ensure the drawer is closed
    expect(screen.queryByText('2 Transactions')).not.toBeInTheDocument();
  });

  test('fetches and displays balance and transactions correctly', async () => {
    render(<Wallet />);

    await waitFor(() => expect(screen.getByText('3 tBTC')).toBeInTheDocument());

    await act(async () => {
      const transactionsButton = screen.getByTitle(/display wallet transactions/i);
      fireEvent.click(transactionsButton);
    });

    const receivedTransaction = await screen.findByText('Transaction ID: abcd...1234');
    const sentTransaction = await screen.findByText('Transaction ID: efgh...5678');
    expect(receivedTransaction).toBeInTheDocument();
    expect(sentTransaction).toBeInTheDocument();
  });

  test('inputs are read-only and cannot be changed', async () => {
    render(<Wallet />);

    await act(async () => {
      const infoButton = screen.getByTitle(/display wallet information/i);
      fireEvent.click(infoButton);
    });

    const addressInput = screen.getByRole('textbox', { name: 'address' });
    const privateKeyInput = screen.getByRole('textbox', { name: 'privateKey' });
    const mnemonicInput = screen.getByRole('textbox', { name: 'mnemonic' });

    fireEvent.change(addressInput, { target: { value: 'new-address' } });
    fireEvent.change(privateKeyInput, { target: { value: 'new-private-key' } });
    fireEvent.change(mnemonicInput, { target: { value: 'new-mnemonic' } });

    expect(addressInput).toHaveValue('test-address');
    expect(privateKeyInput).toHaveValue('test-private-key');
    expect(mnemonicInput).toHaveValue('test-mnemonic');
  });

  test('fetches balance periodically and updates state', async () => {
    jest.useFakeTimers();

    render(<Wallet />);

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/wallet/test-address'));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
