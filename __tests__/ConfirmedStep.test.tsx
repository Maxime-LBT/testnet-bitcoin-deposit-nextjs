import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmedStep from '@/components/ConfirmedStep';

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

describe('ConfirmedStep Component', () => {
  const mockOnBack = jest.fn();
  const transactionId = '123456abcdef';
  const btcAmount = 0.05;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with success message, amount, and buttons', () => {
    render(<ConfirmedStep transaction={transactionId} btcAmount={btcAmount} onBack={mockOnBack} />);

    // Check if the success message is rendered
    const titleElement = screen.getByText('Payment Confirmed!');
    expect(titleElement).toBeInTheDocument();

    // Check if the subtitle is rendered with the correct amount
    const subtitleElement = screen.getByText(`Your payment of ${btcAmount} tBTC has been successfully confirmed.`);
    expect(subtitleElement).toBeInTheDocument();

    // Check if the "View Transaction" button is rendered with the correct link
    const linkElement = screen.getByRole('link', { name: /view transaction/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', `${process.env.NEXT_PUBLIC_EXPLORER_API_URL}/tx/${transactionId}`);
    expect(linkElement).toHaveAttribute('target', '_blank');

    // Check if the "Deposit Again" button is rendered
    const buttonElement = screen.getByRole('button', { name: /deposit again/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onBack when the "Deposit Again" button is clicked', () => {
    render(<ConfirmedStep transaction={transactionId} btcAmount={btcAmount} onBack={mockOnBack} />);

    const buttonElement = screen.getByRole('button', { name: /deposit again/i });

    // Simulate clicking the "Deposit Again" button
    fireEvent.click(buttonElement);

    // Check if onBack callback is called
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  test('renders correctly without transaction link if transaction is null', () => {
    render(<ConfirmedStep transaction={null} btcAmount={btcAmount} onBack={mockOnBack} />);

    // Check that the "View Transaction" button is not rendered
    const linkElement = screen.queryByRole('link', { name: /view transaction/i });
    expect(linkElement).not.toBeInTheDocument();
  });
});
