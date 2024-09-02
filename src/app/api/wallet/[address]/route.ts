import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import logger from "@/lib/logger";

type Params = {
  address: string;
};

export async function GET(_request: NextRequest, context: { params: Params }) {
  //   const address = context.params.address;
  const address = "mzE3QR8QjTNwzfQQ7Af85RmQ6mFhwvbQQb";

  // Validate the address parameter
  if (!address || typeof address !== "string") {
    return NextResponse.json({ message: "Invalid address provided", data: null }, { status: 400 });
  }

  try {
    // Fetch current balance and transactions for the given address
    const [balanceResponse, transactionsResponse] = await Promise.all([
      axios.get(`${process.env.EXPLORER_API_URL}/address/${address}`),
      axios.get(`${process.env.EXPLORER_API_URL}/address/${address}/txs`),
    ]);

    const { chain_stats } = balanceResponse.data;

    // Validate the response from the balance API
    if (!chain_stats) {
      return NextResponse.json({ message: "Invalid response from API", data: null }, { status: 500 });
    }

    const fundedSum = chain_stats.funded_txo_sum || 0;
    const spentSum = chain_stats.spent_txo_sum || 0;
    const balanceSatoshis = fundedSum - spentSum;

    // Convert balance to BTC and format to 8 decimal places
    const formattedBalance = (balanceSatoshis / 1e8).toFixed(8);

    // Filter and map confirmed transactions
    const transactions = transactionsResponse.data
      .filter((tx: any) => tx.status?.confirmed)
      .map((tx: any) => {
        const isSender = tx.vin.some((input: any) => input.prevout.scriptpubkey_address === address);
        const isReceiver = tx.vout.some((output: any) => output.scriptpubkey_address === address);

        const receivedAmountBTC = tx.vout.filter((output: any) => output.scriptpubkey_address === address).reduce((sum: number, output: any) => sum + output.value, 0) / 1e8;

        const sentAmountBTC = tx.vin.filter((input: any) => input.prevout.scriptpubkey_address === address).reduce((sum: number, input: any) => sum + input.prevout.value, 0) / 1e8;

        return {
          txid: tx.txid,
          direction: isSender ? "Sent" : isReceiver ? "Received" : "Unknown",
          amount: isSender ? -sentAmountBTC : receivedAmountBTC,
        };
      });

    return NextResponse.json({ message: "OK", data: { balance: formattedBalance, transactions } }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching balance or transactions:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
