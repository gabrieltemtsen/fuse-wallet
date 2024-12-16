/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { CreateWallet } from "@/components/CreateWallet";
import { Navigation } from "@/components/Navigation";
import { TransactionList } from "@/components/TransactionList";
import { WalletCard } from "@/components/WalletCard";
import { useAuth0 } from "@auth0/auth0-react";
import { useTurnkey } from "@turnkey/sdk-react";
import { ToastContainer, toast } from "react-toastify";
import useStoreUserEffect from "@/hooks/useStoreUserEffect";

export default function Home() {
  const { passkeyClient, turnkey } = useTurnkey();
  const { isAuthenticated, logout, user, loginWithRedirect } = useAuth0();

  const [activeTab, setActiveTab] = useState("portfolio");
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const {userId, userInfo} = useStoreUserEffect();



  const initializeUserSession = async () => {
    try {
      setLoading(true);
      if (!turnkey) {
        toast.error("Turnkey not initialized. Please try again later.");
        return;
      }

      const session = await turnkey.currentUserSession();
      if (!session) {
        toast.error("Failed to fetch user session.");
        return;
      }

      const fetchedWallets = await fetchWallets(session);
      setWallets(fetchedWallets);
    } catch (error) {
      console.error("Error initializing user session:", error);
      toast.error("Error initializing session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async (session: any) => {
    const walletsResponse = await session.getWallets();
    const walletDetails = await Promise.all(
      walletsResponse.wallets.map(async (wallet: any) => {
        const walletAccounts = await session.getWalletAccounts({
          organizationId: wallet.organizationId,
          walletId: wallet.walletId,
        });
        return {
          id: wallet.walletId,
          name: wallet.name,
          address: walletAccounts.accounts[0].address,
          balance: 0, // Placeholder; integrate actual balance fetching if needed
          currency: "ETH",
        };
      })
    );
    return walletDetails;
  };

  const createWallet = async () => {
    if (!passkeyClient || !turnkey) {
      toast.error("Turnkey is not initialized.");
      return;
    }

    try {
      setLoading(true);

      // Create a new sub-org and wallet
      const subOrgName = `FuseGo Wallet - ${new Date().toISOString()}`;
      const credential = await passkeyClient.createUserPasskey({
        publicKey: {
          rp: { id: "fusego.xyz", name: "FuseGo" },
          user: { name: subOrgName, displayName: subOrgName },
        },
      });

      if (!credential?.encodedChallenge || !credential?.attestation) {
        toast.error("Passkey creation failed.");
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
      toast.success("Wallet created successfully!");
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
    }
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
            onClick={() => loginWithRedirect()}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg"
          >
            Login to Get Started
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "portfolio":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-2">
                Hi {user?.name || "there"}, welcome to FuseGo!
              </h2>
              <p className="text-lg">
                Your total balance is:
                <span className="text-4xl font-bold block">{getTotalBalance()} ETH</span>
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
        );

      case "transfer":
        return (
          <div className="p-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-black">Transfer Crypto</h2>
              <TransactionList transactions={transactions} />
            </div>
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
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="max-w-md mx-auto pb-20">{loading ? <p>Loading...</p> : renderContent()}</main>
      {isAuthenticated && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
