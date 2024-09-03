import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import RequestForm from '@/components/RequestForm';

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

describe('RequestForm Component', () => {
  test('renders correctly', () => {
    render(<RequestForm onSubmit={jest.fn()} />);

    // Check if the input and button are present in the document
    const inputElement = screen.getByPlaceholderText('0.0001');
    const buttonElement = screen.getByText(/Generate Payment QR Code/i);

    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onSubmit with the correct amount', async () => {
    const handleSubmit = jest.fn();
    render(<RequestForm onSubmit={handleSubmit} />);

    // Simulate user input
    const inputElement = screen.getByPlaceholderText('0.0001');

    // Use act to wrap the state update
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '0.005' } });
    });

    // Simulate form submission
    const buttonElement = screen.getByText(/Generate Payment QR Code/i);

    await act(async () => {
      fireEvent.click(buttonElement);
    });

    // Check if handleSubmit was called with the correct amount
    expect(handleSubmit).toHaveBeenCalledWith('0.005');
  });

  test('displays validation error when input is empty', async () => {
    render(<RequestForm onSubmit={jest.fn()} />);

    const buttonElement = screen.getByText(/Generate Payment QR Code/i);
    await act(async () => {
      fireEvent.click(buttonElement);
    });

    const errorMessage = await screen.findByText(/Please input the amount!/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('updates amount state on input change', async () => {
    render(<RequestForm onSubmit={jest.fn()} />);

    const inputElement = screen.getByPlaceholderText('0.0001');

    // Change to a valid value
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '0.01' } });
    });
    expect((inputElement as HTMLInputElement).value).toBe('0.01');

    // Change to an invalid value
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: 'invalid' } });
    });
    expect((inputElement as HTMLInputElement).value).toBe(''); // Expect the fallback value of 0
  });
});
