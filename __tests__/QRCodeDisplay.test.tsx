import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QRCodeDisplay from '../src/components/QRCodeDisplay';
import { notification } from 'antd';

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

jest.mock('antd', () => {
  const originalModule = jest.requireActual('antd');
  return {
    ...originalModule,
    notification: {
      success: jest.fn(),
    },
  };
});

describe('QRCodeDisplay Component', () => {
  const testValue = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
  const testAmount = 0.1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<QRCodeDisplay value={testValue} amount={testAmount} />);

    // Check if the QR code is rendered
    const qrCodeElement = screen.getByRole('img');
    expect(qrCodeElement).toBeInTheDocument();

    // Check if the input field and button are present
    const inputElement = screen.getByDisplayValue(testValue);
    const buttonElement = screen.getByLabelText('Copy Address');
    const amountText = screen.getByText(`Scan and send ${testAmount} BTC`);

    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
    expect(amountText).toBeInTheDocument();
  });

  test('copies address to clipboard and shows notification', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });

    render(<QRCodeDisplay value={testValue} amount={testAmount} />);

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
});
