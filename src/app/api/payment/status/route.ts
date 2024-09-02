import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { address, amount } = await request.json();

    // Validate input parameters
    if (!address || typeof address !== "string" || !amount || isNaN(Number(amount))) {
      return NextResponse.json({ message: "Invalid address or amount provided", status: "error", success: false, data: null }, { status: 400 });
    }

    // Convert the provided amount in BTC to satoshis
    const amountInSatoshis = Math.round(Number(amount) * 1e8); // 1e8 is 100000000

    // Fetch transactions for the given address
    const { data: transactions } = await axios.get(`${process.env.EXPLORER_API_URL}/address/${address}/txs`);

    if (transactions.length > 0) {
      const lastTransaction = transactions[0]; // Most recent transaction
      const transactionAmountMatches = lastTransaction.vout.some((output: Vout) => output.scriptpubkey_address === address && output.value === amountInSatoshis);

      if (!transactionAmountMatches) {
        return NextResponse.json({ message: "Last transaction amount does not match", status: "awaiting", success: true, data: null }, { status: 200 });
      }

      // Check confirmation status
      const transactionId = lastTransaction.txid; // Get the transaction ID
      const tBTCAmount = (amountInSatoshis / 1e8).toFixed(8); // Convert satoshis to tBTC

      return NextResponse.json(
        {
          message: lastTransaction.status.confirmed ? "Transaction confirmed" : "Transaction detected but not confirmed",
          status: lastTransaction.status.confirmed ? "confirmed" : "unconfirmed",
          success: true,
          data: { address, amount: tBTCAmount, transactionId },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "No relevant transactions found", status: "awaiting", success: true, data: null }, { status: 200 });
  } catch (error) {
    logger.error("Error checking payment status:", error);
    return NextResponse.json({ message: "Internal Server Error", success: false, data: null }, { status: 500 });
  }
}

// TypeScript Interfaces
interface Vout {
  scriptpubkey: string;
  scriptpubkey_address: string;
  value: number;
}
