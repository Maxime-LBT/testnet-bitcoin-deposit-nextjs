import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const { address, amount, qrGeneratedTime } = await request.json();

        // Validate input parameters
        if (!address || typeof address !== 'string' || !amount || isNaN(Number(amount)) || !qrGeneratedTime || isNaN(Number(qrGeneratedTime))) {
            logger.error('Invalid input parameters:', { address, amount, qrGeneratedTime });
            return NextResponse.json({ status: 'error', success: false, data: null }, { status: 400 });
        }

        // Convert the provided amount in BTC to satoshis
        const amountInSatoshis = Math.round(Number(amount) * 1e8); // 1e8 is 100000000

        // Fetch transactions for the given address
        const { data: transactions } = await axios.get(`${process.env.EXPLORER_API_URL}/address/${address}/txs`);

        // Find the transaction with the exact amount and address, and ensure block_time is after qrGeneratedTime
        const matchingTransaction = transactions.find((tx: Transaction) => {
            const isAmountAndAddressMatch = tx.vout.some((output: Vout) => output.scriptpubkey_address === address && output.value === amountInSatoshis);
            const isAfterQrTime = tx.status.block_time * 1000 > qrGeneratedTime; // Convert block_time to milliseconds
            return isAmountAndAddressMatch && isAfterQrTime;
        });

        if (matchingTransaction) {
            const transactionId = matchingTransaction.txid;
            const tBTCAmount = (amountInSatoshis / 1e8).toFixed(8); // Convert satoshis to tBTC

            return NextResponse.json(
                {
                    status: matchingTransaction.status.confirmed ? 'confirmed' : 'unconfirmed',
                    success: true,
                    data: { address, amount: tBTCAmount, transactionId },
                },
                { status: 200 },
            );
        }

        // No matching transactions found
        return NextResponse.json({ status: 'awaiting', success: true, data: null }, { status: 200 });
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
