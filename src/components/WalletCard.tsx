import React from 'react';
import { Wallet as WalletIcon } from 'lucide-react';
import { Wallet } from '@/types/wallet';

interface WalletCardProps {
  wallet: Wallet;
  onClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <WalletIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{wallet.name}</h3>
            <p className="text-sm text-gray-500 truncate w-32">{wallet.address}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">{wallet.balance} {wallet.currency}</p>
        </div>
      </div>
    </div>
  );
};