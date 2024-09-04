import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RequestForm from '@/components/RequestStep';

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

describe('RequestForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<RequestForm onSubmit={mockOnSubmit} />);

    // Check if the input field and button are rendered
    const inputElement = screen.getByPlaceholderText('0.00001');
    const buttonElement = screen.getByRole('button', { name: /generate payment qr code/i });

    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onSubmit with correct amount when form is submitted', async () => {
    render(<RequestForm onSubmit={mockOnSubmit} />);

    const inputElement = screen.getByPlaceholderText('0.00001');
    const buttonElement = screen.getByRole('button', { name: /generate payment qr code/i });

    // Simulate entering an amount
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '0.005' } });
    });

    // Simulate form submission
    await act(async () => {
      fireEvent.click(buttonElement);
    });

    // Check if onSubmit was called with the correct value
    expect(mockOnSubmit).toHaveBeenCalledWith('0.005');
  });

  test('displays validation error if amount is not provided', async () => {
    render(<RequestForm onSubmit={mockOnSubmit} />);

    const buttonElement = screen.getByRole('button', { name: /generate payment qr code/i });

    // Simulate form submission without entering an amount
    await act(async () => {
      fireEvent.click(buttonElement);
    });

    // Check if validation error is displayed
    const errorMessage = await screen.findByText(/please input the amount!/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('updates amount state correctly when input changes', async () => {
    render(<RequestForm onSubmit={mockOnSubmit} />);

    const inputElement = screen.getByPlaceholderText('0.00001');

    // Simulate entering an amount
    await act(async () => {
      fireEvent.change(inputElement, { target: { value: '0.01' } });
    });

    // Check if the input field value has updated
    expect(inputElement).toHaveValue(0.01);
  });
});
