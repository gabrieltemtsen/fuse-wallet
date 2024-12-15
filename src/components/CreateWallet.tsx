/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { generateWallet } from '@/utils/crypto';

interface CreateWalletProps {
  onWalletCreate: (wallet: any) => void;
}

export const CreateWallet: React.FC<CreateWalletProps> = ({ onWalletCreate }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newWallet = generateWallet();
      onWalletCreate(newWallet);
      setIsCreating(false);
    }, 1000);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isCreating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>Create New Wallet</span>
          </>
        )}
      </button>
    </div>
  );
};