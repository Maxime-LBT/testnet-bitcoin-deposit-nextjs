# TBDA - Testnet Bitcoin Deposit App

This is a simple Next.js application that allows users to generate testnet Bitcoin payment requests, display a QR code for the payment, and check the payment status in real-time.

## Key Features

- **Generate HD Wallet**: Automatically creates a new HD (Hierarchical Deterministic) wallet every time the server is restarted or the page is reloaded.
- **Payment Form**: Allows users to specify the desired amount of Bitcoin (BTC) for the payment.
- **QR Code Display**: Generates and displays a QR code for the payment request, enabling users to easily scan and make payments.
- **Payment Status Monitoring**: Continuously polls for the payment status to detect when the payment has been received, providing real-time feedback to the user.
- **Error Handling**: Robust handling of various error cases, such as invalid input or network issues, with clear feedback to enhance user experience.
- **Responsive Design**: Ensures that the app is user-friendly across different devices and screen sizes.

## Tech Stack

This application is built with the following technologies:

- **Next.js**: For server-side rendering, routing, and API management.
- **React**: To create a dynamic and responsive user interface.
- **Styled Components**: For modular and maintainable component styling.
- **TypeScript**: To enhance code quality through type safety.
- **Ant Design**: Provides a set of rich UI components.
- **Framer Motion**: For smooth transitions and animations.

## Getting Started

### Prerequisites

Before running the application, ensure you have:

- **Node.js and npm**: The latest versions installed.
- **A Testnet Bitcoin Wallet**: Set up for testing purposes.

### Installation

Follow these steps to set up the project:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/qr-payment-app.git
   cd qr-payment-app
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following configuration:

   ```env
   # Environment for logging behavior
   NODE_ENV=development || production

   # Bitcoin Testnet API URL
   EXPLORER_API_URL=https://blockstream.info/testnet/api

   # Polling interval in milliseconds
   POLLING_INTERVAL=5000
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open the application:
   Access the app at `http://localhost:3000` in your browser.

## How to Use

- **Generate a New Wallet**: The app automatically generates a new HD wallet upon startup.
- **Enter Payment Amount**: Use the provided form to specify the amount of BTC you wish to pay.
- **Get the QR Code**: A QR code is generated for the payment request.
- **Monitor Payment Status**: The app will automatically check for payment status and notify you once the payment is received.

## Contributing

We welcome contributions! If you'd like to contribute, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or feedback, please feel free to open an issue or contact the maintainer.
