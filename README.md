# TBDA - Testnet Bitcoin Deposit App

This is a simple Next.js application that allows users to generate testnet Bitcoin payment requests, display a QR code for the payment, and check the payment status in real-time.

## Demo

You can try out the live demo of the application at: https://bitcoin-request-nise955cq-autoraz.vercel.app/

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

## Testing

To ensure the application functions correctly, follow these steps to run the tests:

1. Make sure you have all dependencies installed:

   ```bash
   npm install
   ```

2. Run the test suite:

   ```bash
   npm test
   npm run cypress:run
   ```

This will execute all the unit, integration and e2e tests for the application. The test results will be displayed in your terminal, showing which tests passed or failed.

## Deployment

To deploy the application, follow these steps:

1. Fork this repository to your GitHub account.

2. Set up a Vercel account if you haven't already.

3. Connect your GitHub account to Vercel.

4. Fill the Vercel token on Github Secrets

The GitHub Action will automatically deploy your application to Vercel whenever changes are pushed to the `main` branch.

## How to Use

- **Enter Payment Amount**: Use the provided form to specify the amount of BTC you wish to pay.
- **Get the QR Code**: A QR code is generated for the payment request.
- **Get back your testnet BTC**: The private key / mnemonic is generated on the server and will be displayed.

## Improvements

- Add env setting for the number of block confirmations to wait for before validating payment (current is 1)
- Payment will be confirmed if the last transaction is the same amout : create a new wallet for each payment request or use memo/label
- Add frontend logging with Sentry

## Contributing

We welcome contributions! If you'd like to contribute, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or feedback, please feel free to open an issue or contact the maintainer.
