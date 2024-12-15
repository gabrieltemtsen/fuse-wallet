export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  timestamp: number;
  address: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  balance: number;
  currency: string;
}

export interface Portfolio {
  totalBalance: number;
  wallets: Wallet[];
}