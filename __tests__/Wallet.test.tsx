import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Wallet from '@/components/Wallet';
import { useWallet } from '@/context/walletContext';

// Setup mocks for wallet context and fetch
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
  }),
);

// Setup mock for window.matchMedia to avoid warnings in the tests
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

// Group related tests for the Wallet component
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

  // Test rendering with wallet address present
  test('renders correctly when wallet address is present', async () => {
    render(<Wallet />);

    // Verify elements are displayed
    expect(screen.getByTitle('Display wallet information')).toBeInTheDocument();
    expect(screen.getByTitle('Display wallet transactions')).toBeInTheDocument();
  });

  // Test wallet modal opens on button click
  test('opens wallet modal when "Display wallet information" button is clicked', async () => {
    render(<Wallet />);

    // Click the button to display wallet information
    await act(async () => {
      fireEvent.click(screen.getByTitle(/display wallet information/i));
    });

    // Verify modal elements are displayed
    expect(await screen.findByText('Wallet')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'address' })).toHaveValue('test-address');
    expect(screen.getByRole('textbox', { name: 'privateKey' })).toHaveValue('test-private-key');
    expect(screen.getByRole('textbox', { name: 'mnemonic' })).toHaveValue('test-mnemonic');
  });

  // Test opening and closing the transactions drawer
  test('opens and closes the transactions drawer', async () => {
    render(<Wallet />);

    // Open the transactions drawer
    await act(async () => {
      fireEvent.click(screen.getByTitle(/display wallet transactions/i));
    });

    // Verify drawer opens and displays transactions
    expect(await screen.findByText('2 Transactions')).toBeInTheDocument();
    expect(screen.getByText(/transaction id: abcd...1234/i)).toBeInTheDocument();
    expect(screen.getByText(/transaction id: efgh...5678/i)).toBeInTheDocument();

    // Close the transactions drawer
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
    });

    // Verify drawer is closed
    expect(screen.queryByText('2 Transactions')).not.toBeInTheDocument();
  });

  // Test fetching and displaying balance and transactions
  test('fetches and displays balance and transactions correctly', async () => {
    render(<Wallet />);

    // Verify balance is displayed correctly
    await waitFor(() => expect(screen.getByText('3 tBTC')).toBeInTheDocument());

    // Open the transactions drawer
    await act(async () => {
      fireEvent.click(screen.getByTitle(/display wallet transactions/i));
    });

    // Verify transactions are displayed
    expect(await screen.findByText('Transaction ID: abcd...1234')).toBeInTheDocument();
    expect(await screen.findByText('Transaction ID: efgh...5678')).toBeInTheDocument();
  });

  // Test that inputs are read-only and cannot be changed
  test('inputs are read-only and cannot be changed', async () => {
    render(<Wallet />);

    // Open the wallet information modal
    await act(async () => {
      fireEvent.click(screen.getByTitle(/display wallet information/i));
    });

    const addressInput = screen.getByRole('textbox', { name: 'address' });
    const privateKeyInput = screen.getByRole('textbox', { name: 'privateKey' });
    const mnemonicInput = screen.getByRole('textbox', { name: 'mnemonic' });

    // Attempt to change input values
    fireEvent.change(addressInput, { target: { value: 'new-address' } });
    fireEvent.change(privateKeyInput, { target: { value: 'new-private-key' } });
    fireEvent.change(mnemonicInput, { target: { value: 'new-mnemonic' } });

    // Verify inputs remain unchanged
    expect(addressInput).toHaveValue('test-address');
    expect(privateKeyInput).toHaveValue('test-private-key');
    expect(mnemonicInput).toHaveValue('test-mnemonic');
  });

  // Test periodic fetching of balance updates
  test('fetches balance periodically and updates state', async () => {
    jest.useFakeTimers();

    render(<Wallet />);

    // Run pending timers to trigger fetch
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    // Verify fetch is called with correct parameters
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/wallet/test-address', { cache: 'no-store' }));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  // Test cleanup of interval on component unmount
  test('cleans up the interval on unmount', async () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = render(<Wallet />);

    // Run pending timers before unmounting
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    unmount();

    // Verify interval is cleared
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

    clearIntervalSpy.mockRestore();
    jest.useRealTimers();
  });

  // Test component does not render without wallet address
  test('does not render when wallet address is absent', async () => {
    (useWallet as jest.Mock).mockReturnValue({ wallet: {} });

    const { container } = render(<Wallet />);

    // Verify component does not render any content
    expect(container.firstChild).toBeNull();
  });

  // Test handling of no transactions scenario
  test('displays no transactions message when there are no transactions', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { balance: 0, transactions: [] } }),
      } as unknown as Response),
    );

    render(<Wallet />);

    // Open the transactions drawer
    await act(async () => {
      fireEvent.click(screen.getByTitle(/display wallet transactions/i));
    });

    // Verify "no transactions" message is displayed
    expect(screen.getByText('0 Transactions')).toBeInTheDocument();
  });
});
