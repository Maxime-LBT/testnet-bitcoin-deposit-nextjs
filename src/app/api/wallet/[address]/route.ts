import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import logger from '@/lib/logger';

type Params = {
    address: string;
};

interface Transaction {
    txid: string;
    version: number;
    locktime: number;
    vin: {
        txid: string;
        vout: number;
        prevout: {
            scriptpubkey: string;
            scriptpubkey_asm: string;
            scriptpubkey_type: string;
            scriptpubkey_address: string;
            value: number;
        };
        scriptsig: string;
        scriptsig_asm: string;
        witness: string[];
        is_coinbase: boolean;
        sequence: number;
    }[];
    vout: {
        scriptpubkey: string;
        scriptpubkey_asm: string;
        scriptpubkey_type: string;
        scriptpubkey_address: string;
        value: number;
    }[];
    size: number;
    weight: number;
    fee: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
}

export async function GET(_request: NextRequest, context: { params: Params }) {
    const address = context.params.address;

    // Validate the address parameter
    if (!address || typeof address !== 'string') {
        return NextResponse.json({ message: 'Invalid address provided', data: null }, { status: 400 });
    }

    try {
        // Fetch current balance and transactions for the given address
        const [balanceResponse, transactionsResponse] = await Promise.all([
            axios.get(`${process.env.EXPLORER_API_URL}/address/${address}`),
            axios.get<Transaction[]>(`${process.env.EXPLORER_API_URL}/address/${address}/txs`),
        ]);

        const { chain_stats } = balanceResponse.data;

        // Validate the response from the balance API
        if (!chain_stats) {
            return NextResponse.json({ message: 'Invalid response from API', data: null }, { status: 500 });
        }

        const fundedSum = chain_stats.funded_txo_sum || 0;
        const spentSum = chain_stats.spent_txo_sum || 0;
        const balanceSatoshis = fundedSum - spentSum;

        // Convert balance to BTC and format to 8 decimal places
        const formattedBalance = (balanceSatoshis / 1e8).toFixed(8);

        // Map transactions and include confirmed status
        const transactions = transactionsResponse.data.map((tx: Transaction) => {
            const isSender = tx.vin.some((input) => input.prevout.scriptpubkey_address === address);
            const isReceiver = tx.vout.some((output) => output.scriptpubkey_address === address);
            const receivedAmountBTC = tx.vout.filter((output) => output.scriptpubkey_address === address).reduce((sum, output) => sum + output.value, 0) / 1e8;
            const sentAmountBTC = tx.vin.filter((input) => input.prevout.scriptpubkey_address === address).reduce((sum, input) => sum + input.prevout.value, 0) / 1e8;

            return {
                txid: tx.txid,
                direction: isSender ? 'Sent' : isReceiver ? 'Received' : 'Unknown',
                amount: isSender ? -sentAmountBTC : receivedAmountBTC,
                confirmed: tx.status.confirmed,
            };
        });

        return NextResponse.json({ message: 'OK', data: { balance: formattedBalance, transactions } }, { status: 200 });
    } catch (error) {
        logger.error('Error fetching balance or transactions:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
