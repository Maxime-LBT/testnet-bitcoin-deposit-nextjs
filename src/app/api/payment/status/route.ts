import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { address, amount } = await request.json();

    // Validate input parameters
    if (!address || typeof address !== 'string' || !amount || isNaN(Number(amount))) {
      logger.error('Invalid input parameters:', { address, amount });
      return NextResponse.json({ status: 'error', success: false, data: null }, { status: 400 });
    }

    // Convert the provided amount in BTC to satoshis
    const amountInSatoshis = Math.round(Number(amount) * 1e8); // 1e8 is 100000000

    // Fetch transactions for the given address
    const { data: transactions } = await axios.get(`${process.env.EXPLORER_API_URL}/api/address/${address}/txs`);

    if (transactions.length) {
      // Check last transaction is the exact amount
      const lastTransaction: Transaction = transactions[0];
      const isAmountAndAddressMatch = lastTransaction.vout.some((output: Vout) => output.scriptpubkey_address === address && output.value === amountInSatoshis);
      if (isAmountAndAddressMatch) {
        const transactionId = lastTransaction.txid;
        const tBTCAmount = (amountInSatoshis / 1e8).toFixed(8); // Convert satoshis to tBTC

        return NextResponse.json(
          {
            status: lastTransaction.status.confirmed ? 'confirmed' : 'unconfirmed',
            success: true,
            data: { address, amount: tBTCAmount, transactionId },
          },
          { status: 200 },
        );
      }
    }

    // No matching transactions found
    return NextResponse.json({ status: 'showQRCode', success: true, data: null }, { status: 200 });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    return NextResponse.json({ success: false, data: null }, { status: 500 });
  }
}

interface Prevout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

interface Vin {
  txid: string;
  vout: number;
  prevout: Prevout;
  scriptsig: string;
  scriptsig_asm: string;
  witness: string[];
  is_coinbase: boolean;
  sequence: number;
}

interface Vout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

interface Status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: Status;
}
