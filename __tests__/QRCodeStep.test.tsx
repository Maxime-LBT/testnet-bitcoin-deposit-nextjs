import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QRCodeStep from '@/components/QRCodeStep';
import { notification } from 'antd';

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

jest.mock('antd', () => {
  const originalModule = jest.requireActual('antd');
  return {
    ...originalModule,
    notification: {
      success: jest.fn(),
    },
  };
});

describe('QRCodeStep Component', () => {
  const testValue = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
  const testAmount = 0.1;
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  test('renders correctly', () => {
    render(<QRCodeStep paymentRequest={testValue} btcAmount={testAmount} onCancel={mockOnCancel} />);

    // Check if the QR code SVG is rendered with the correct attributes
    const qrCodeElement = screen.getByTestId('qr-code-display'); // Use getByTestId
    expect(qrCodeElement).toBeInTheDocument();
    expect(qrCodeElement).toHaveAttribute('id', 'qr-code-display');
    expect(qrCodeElement).toHaveAttribute('name', 'qr-code-display');
    expect(qrCodeElement).toHaveAttribute('width', '256');
    expect(qrCodeElement).toHaveAttribute('height', '256');

    // Check if the input field and button are present
    const inputElement = screen.getByDisplayValue(testValue);
    const buttonElement = screen.getByLabelText('Copy Address');
    const amountText = screen.getByText(`Scan and send ${testAmount} BTC`);

    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
    expect(amountText).toBeInTheDocument();
  });

  test('copies address to clipboard and shows notification', async () => {
    render(<QRCodeStep paymentRequest={testValue} btcAmount={testAmount} onCancel={mockOnCancel} />);

    // Simulate clicking the copy button
    const buttonElement = screen.getByLabelText('Copy Address');
    fireEvent.click(buttonElement);

    // Check if the clipboard writeText method was called with the correct value
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue);

    // Check if the notification was called
    expect(notification.success).toHaveBeenCalledWith({
      message: 'Address copied to clipboard!',
      placement: 'top',
    });
  });

  test('calls onCancel when the cancel button is clicked', () => {
    render(<QRCodeStep paymentRequest={testValue} btcAmount={testAmount} onCancel={mockOnCancel} />);

    // Simulate clicking the cancel button
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    // Check if the onCancel callback is called
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
