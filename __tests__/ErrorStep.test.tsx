import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorStep from '@/components/ErrorStep';

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

describe('ErrorStep Component', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with error message and button', () => {
    render(<ErrorStep onBack={mockOnBack} />);

    // Check if the error message is rendered
    const titleElement = screen.getByText('Transaction Error');
    expect(titleElement).toBeInTheDocument();

    // Check if the subtitle is rendered
    const subtitleElement = screen.getByText('An issue was encountered while processing your payment. Please try again later.');
    expect(subtitleElement).toBeInTheDocument();

    // Check if the button is rendered
    const buttonElement = screen.getByRole('button', { name: /try again/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onBack when the "Try Again" button is clicked', () => {
    render(<ErrorStep onBack={mockOnBack} />);

    const buttonElement = screen.getByRole('button', { name: /try again/i });

    // Simulate clicking the button
    fireEvent.click(buttonElement);

    // Check if onBack callback is called
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
