import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UnconfirmedStep from '@/components/UnconfirmedStep';

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

describe('UnconfirmedStep Component', () => {
  const mockOnBack = jest.fn();
  const transactionId = '123456abcdef';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with icon, title, subtitle, and buttons', () => {
    render(<UnconfirmedStep transaction={transactionId} onBack={mockOnBack} />);

    // Check if the icon is rendered
    const iconElement = screen.getByTestId('loading-outlined');
    expect(iconElement).toBeInTheDocument();

    // Check if the title is rendered
    const titleElement = screen.getByText('Payment Detected');
    expect(titleElement).toBeInTheDocument();

    // Check if the subtitle is rendered
    const subtitleElement = screen.getByText('Waiting for confirmation. Please wait...');
    expect(subtitleElement).toBeInTheDocument();

    // Check if the "View Transaction" button is rendered with the correct link
    const linkElement = screen.getByRole('link', { name: /view transaction/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', `https://blockstream.info/tx/${transactionId}`);
    expect(linkElement).toHaveAttribute('target', '_blank');

    // Check if the "Deposit Again" button is rendered
    const buttonElement = screen.getByRole('button', { name: /deposit again/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onBack when the "Deposit Again" button is clicked', () => {
    render(<UnconfirmedStep transaction={transactionId} onBack={mockOnBack} />);

    const buttonElement = screen.getByRole('button', { name: /deposit again/i });

    // Simulate clicking the "Deposit Again" button
    fireEvent.click(buttonElement);

    // Check if onBack callback is called
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  test('renders correctly without transaction link if transaction is null', () => {
    render(<UnconfirmedStep transaction={null} onBack={mockOnBack} />);

    // Check that the "View Transaction" button is not rendered
    const linkElement = screen.queryByRole('link', { name: /view transaction/i });
    expect(linkElement).not.toBeInTheDocument();

    // Check if the "Deposit Again" button is still rendered
    const buttonElement = screen.getByRole('button', { name: /deposit again/i });
    expect(buttonElement).toBeInTheDocument();
  });
});
