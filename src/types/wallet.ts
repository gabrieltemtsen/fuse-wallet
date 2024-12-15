export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  timestamp: number;
  address: string;
  status: 'pending' | 'completed' | 'failed';
}

