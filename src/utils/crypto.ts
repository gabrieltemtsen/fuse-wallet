/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction, } from "@/types/wallet";

// Mock data and functions for demo purposes
export const generateWallet = (): any => {
  const id = Math.random().toString(36).substring(7);
  return {
    id,
    name: `Wallet ${id.toUpperCase()}`,
    address: `0x${Math.random().toString(36).substring(2, 38)}`,
    balance: parseFloat((Math.random() * 10).toFixed(4)),
    currency: 'ETH'
  };
};

export const generateTransaction = (wallet: any): Transaction => {
  const types: ['send', 'receive'] = ['send', 'receive'];
  return {
    id: Math.random().toString(36).substring(7),
    type: types[Math.floor(Math.random() * types.length)],
    amount: parseFloat((Math.random() * 2).toFixed(4)),
    currency: wallet.currency,
    timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    address: `0x${Math.random().toString(36).substring(2, 38)}`,
    status: 'completed'
  };
};