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
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
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

    // Use act to wrap the button click event
    await act(async () => {
      const infoButton = screen.getByTitle(/display wallet information/i);
      fireEvent.click(infoButton);
    });

    const modalTitle = await screen.findByText('Wallet');
    expect(modalTitle).toBeInTheDocument();

    // Verify form fields
    expect(screen.getByRole('textbox', { name: 'address' })).toHaveValue('test-address');
    expect(screen.getByRole('textbox', { name: 'privateKey' })).toHaveValue('test-private-key');
    expect(screen.getByRole('textbox', { name: 'mnemonic' })).toHaveValue('test-mnemonic');
  });

  test('shows transactions drawer when button is clicked', async () => {
    render(<Wallet />);

    const transactionsButton = screen.getByTitle(/display wallet transactions/i);
    fireEvent.click(transactionsButton);

    const drawerTitle = await screen.findByText('2 Transactions');
    expect(drawerTitle).toBeInTheDocument();

    // Verify transactions in drawer
    expect(screen.getByText(/transaction id: abcd...1234/i)).toBeInTheDocument();
    expect(screen.getByText(/transaction id: efgh...5678/i)).toBeInTheDocument();
  });

  test('fetches and displays balance and transactions correctly', async () => {
    render(<Wallet />);

    await waitFor(() => expect(screen.getByText('3 tBTC')).toBeInTheDocument());

    const transactionsButton = screen.getByTitle(/display wallet transactions/i);
    fireEvent.click(transactionsButton);

    const receivedTransaction = await screen.findByText('Transaction ID: abcd...1234');
    const sentTransaction = await screen.findByText('Transaction ID: efgh...5678');
    expect(receivedTransaction).toBeInTheDocument();
    expect(sentTransaction).toBeInTheDocument();
  });

  test('inputs are read-only and cannot be changed', async () => {
    render(<Wallet />);

    // Open the wallet modal
    const infoButton = screen.getByTitle(/display wallet information/i);
    fireEvent.click(infoButton);

    // Verify form fields are read-only
    const addressInput = screen.getByRole('textbox', { name: 'address' });
    const privateKeyInput = screen.getByRole('textbox', { name: 'privateKey' });
    const mnemonicInput = screen.getByRole('textbox', { name: 'mnemonic' });

    // Attempt to change the values
    fireEvent.change(addressInput, { target: { value: 'new-address' } });
    fireEvent.change(privateKeyInput, { target: { value: 'new-private-key' } });
    fireEvent.change(mnemonicInput, { target: { value: 'new-mnemonic' } });

    // Verify that the values did not change
    expect(addressInput).toHaveValue('test-address');
    expect(privateKeyInput).toHaveValue('test-private-key');
    expect(mnemonicInput).toHaveValue('test-mnemonic');
  });

  test('fetches balance periodically and updates state', async () => {
    jest.useFakeTimers(); // Use fake timers to control the setInterval

    render(<Wallet />);

    // Run all pending timers (to simulate the initial interval)
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // Assert that the fetch is called with the correct URL after the first interval
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/wallet/test-address'));

    // Run all pending timers again to simulate another interval
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // Assert that fetch has been called twice (initial call and after one interval)
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Clean up timers
    jest.useRealTimers();
  });
});
