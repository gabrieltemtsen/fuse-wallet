/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Wallet as WalletIcon, Copy, } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface WalletCardProps {
  wallet: any;
  onClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick }) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success("Address copied to clipboard!", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        {/* Wallet Icon */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-all">
            <WalletIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-800" />
          </div>
          {/* Wallet Info */}
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-gray-900">{wallet.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 truncate w-40">{wallet.address}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  handleCopyAddress();
                }}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        {/* Wallet Balance */}
        <div className="text-right">
          <p className="font-bold text-gray-800 group-hover:text-gray-900">
            {wallet.balance} {wallet.currency}
          </p>
        </div>
      </div>
    </div>
  );
};
