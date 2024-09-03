import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the Wallet context type
interface WalletContextType {
    wallet: Wallet;
    setWallet: (wallet: Wallet) => void;
}

// Create a Context for the Wallet
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wallet, setWallet] = useState<Wallet>({ address: null, privateKey: null, mnemonic: null });

    // Fetch wallet information on component mount
    useEffect(() => {
        const fetchWalletAddress = async () => {
            try {
                const response = await fetch('/api/wallet/new');
                if (!response.ok) {
                    throw new Error(`Failed to fetch wallet address: ${response.statusText}`);
                }

                const data = await response.json();
                if (data?.data) {
                    setWallet(data.data);
                } else {
                    throw new Error(`Failed to generate wallet address: ${data.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error fetching wallet address:', error);
            }
        };

        fetchWalletAddress();
    }, []);

    return <WalletContext.Provider value={{ wallet, setWallet }}>{children}</WalletContext.Provider>;
};

// Custom hook to use the Wallet context
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

// Define the Wallet interface
export interface Wallet {
    address: string | null;
    privateKey: string | null;
    mnemonic: string | null;
}
