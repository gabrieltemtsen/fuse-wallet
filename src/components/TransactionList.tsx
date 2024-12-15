import React from "react";
import { Transaction } from "../types/wallet";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[]; // Ensure `Transaction` is properly defined in `../types/wallet`
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  // Fallback for empty transactions
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>No transactions available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id} // Ensure `id` exists in the `Transaction` type
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-3">
            {/* Transaction Type Icon */}
            <div
              className={`p-2 rounded-full ${
                tx.type === "send" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {tx.type === "send" ? (
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800 capitalize">{tx.type}</p>
              <p className="text-sm text-gray-500 truncate w-32">{tx.address}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-semibold ${
                tx.type === "send" ? "text-red-600" : "text-green-600"
              }`}
            >
              {tx.type === "send" ? "-" : "+"}
              {tx.amount} {tx.currency}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(tx.timestamp).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
