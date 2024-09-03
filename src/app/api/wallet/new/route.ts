import { NextResponse } from 'next/server';
import { payments, Network, networks } from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { ECPair } from 'ecpair';
import logger from '@/lib/logger';

// Initialize BIP32 with the secp256k1 elliptic curve for Testnet
const bip32 = BIP32Factory(ecc);
const network: Network = networks.testnet;

// Generate a new HD wallet with a secure mnemonic
export async function GET() {
    try {
        const mnemonic = generateMnemonic(256); // Generate a secure 24-word mnemonic
        const seed = mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed, network);

        // Derive a path compatible with BIP44 for Bitcoin Testnet
        const node = root.derivePath("m/44'/1'/0'/0/0");
        const { address } = payments.p2pkh({ pubkey: node.publicKey, network });

        // Convert the private key to WIF format
        const keyPair = ECPair.fromPrivateKey(node.privateKey as Buffer, { network });
        const wif = keyPair.toWIF();

        // Return a JSON response with wallet details
        return NextResponse.json(
            {
                data: {
                    address,
                    privateKey: wif,
                    mnemonic,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        logger.error('Error generating wallet:', error);
        return NextResponse.json({ message: 'Internal Server Error', data: null }, { status: 500 });
    }
}
