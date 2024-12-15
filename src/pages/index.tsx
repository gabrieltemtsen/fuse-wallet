/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { CreateWallet } from "@/components/CreateWallet";
import { Navigation } from "@/components/Navigation";
import { TransactionList } from "@/components/TransactionList";
import { WalletCard } from "@/components/WalletCard";
import { generateWallet, generateTransaction } from "@/utils/crypto";
import useStoreUserEffect from "@/hooks/useStoreUserEffect";
import { useAuth0 } from "@auth0/auth0-react";
import { useTurnkey } from "@turnkey/sdk-react";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const { passkeyClient, turnkey } = useTurnkey();
  const [activeTab, setActiveTab] = useState("portfolio");
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {isAuthenticated, logout, user, loginWithRedirect} = useAuth0()
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);

  const { userId, userInfo } = useStoreUserEffect();

  const createWallet = async () => {
    if (!passkeyClient || !turnkey) {
      alert("Turnkey not initialized");
      return;
    }

    try {
      // Create a new sub-org and wallet
      const subOrgName = `FuseGo Wallet - ${new Date().toISOString()}`;
      const credential = await passkeyClient.createUserPasskey({
        publicKey: {
          rp: { id: "development", name: "FuseGo" },
          user: { name: subOrgName, displayName: subOrgName },
        },
      });

      if (!credential?.encodedChallenge || !credential?.attestation) {
        alert("Passkey creation failed.");
        return;
      }

      const res = await fetch("/api/createSuborg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subOrgName,
          userName: user?.name,
          challenge: credential.encodedChallenge,
          attestation: credential.attestation,
        }),
      });

      const { walletId, address, subOrgId } = await res.json();

      const newWallet: any = {
        id: walletId,
        name: subOrgName,
        address,
        balance: 0,
        currency: "ETH",
      };

      setWallets((prev) => [...prev, newWallet]);
    } catch (error) {
      console.error("Error creating wallet:", error);
    }
  };

  const handleWalletCreate = (wallet: any) => {
    setWallets((prev) => [...prev, wallet]);
  };

  const getTotalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0).toFixed(4);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 text-white text-center px-6 relative">
          <h1 className="text-5xl font-extrabold mb-4 animate-pulse">Welcome to FuseGo</h1>
          <p className="text-lg mb-8">Your one-stop solution for seamless wallet transactions.</p>
          <button
            onClick={()=>(loginWithRedirect())}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg">
            Login to Get Started
          </button>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="w-16 h-16 bg-yellow-400 rounded-full absolute top-10 left-10 animate-bounce"></div>
            <div className="w-16 h-16 bg-pink-400 rounded-full absolute bottom-20 right-20 animate-ping"></div>
            <div className="w-16 h-16 bg-blue-400 rounded-full absolute bottom-10 left-20 animate-spin"></div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "portfolio":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-2">
                Hi {userInfo?.name || "there"}, welcome to FuseGo!
              </h2>
              <p className="text-lg">
                Your total balance is:
                <span className="text-4xl font-bold block">0 ETH</span>
              </p>
            </div>
            <div className="px-4">
         <h3 className="text-2xl font-semibold mb-4 text-black">Your Wallets</h3>
          {wallets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onClick={() => setActiveTab("wallets")}
            />
          ))}
        </div>
       ) : (
      <div className="text-gray-500">No wallets found. Please add a wallet to get started.</div>
    )}
</div>
          </div>
        );

        case "wallets":
          return (
            <div className="p-4 space-y-4">
              <button
                onClick={createWallet}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg w-full"
              >
                Create New Wallet
              </button>
              <div className="grid grid-cols-1 gap-4">
                {wallets.map((wallet) => (
                  <WalletCard key={wallet.id} wallet={wallet} onClick={() => setSelectedWallet(wallet)} />
                ))}
              </div>
            </div>
          )

      case "transfer":
        return (
          <div className="p-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-black">Transfer Crypto</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Wallet</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.balance} {wallet.currency})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Address</label>
                  <input
                    type="text"
                    placeholder="Enter recipient address"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        );

      case "history":
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4 text-black">Transaction History</h2>
            <TransactionList transactions={transactions} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">FuseGo</h1>
        {
          isAuthenticated ? <button className="rounded-lg bg-red-600 p-2" onClick={()=>{logout()}}>Logout</button> :  <span>Your gateway to crypto</span>
        }
        </div>
      </header>
      <main className="max-w-md mx-auto pb-20">{renderContent()}</main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
