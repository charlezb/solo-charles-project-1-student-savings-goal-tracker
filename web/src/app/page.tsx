'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import SavingsGoal from '@/components/SavingsGoal';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <main className="min-h-screen w-full bg-[#f7f8fb] text-gray-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/80 bg-white/85 px-4 py-3 shadow-sm shadow-gray-200/60 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">
              SG
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950">
                Student Savings Goal Tracker
              </p>
              <p className="hidden text-xs text-gray-500 sm:block">
                Stellar Soroban testnet
              </p>
            </div>
          </div>
          <ConnectWallet {...wallet} />
        </header>

        <section className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-16">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              On-chain goal tracking for students
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
              Student Savings Goal Tracker
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Track your savings goals on-chain using Stellar Soroban smart
              contracts.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              {!publicKey ? (
                <button
                  onClick={wallet.connect}
                  disabled={connecting}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-gray-950 px-6 text-sm font-semibold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {connecting ? 'Connecting...' : 'Connect Freighter'}
                </button>
              ) : (
                <a
                  href="#savings-dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-gray-950 px-6 text-sm font-semibold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  View Dashboard
                </a>
              )}
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Get Freighter
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/80 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Workshop status</p>
                <p className="mt-1 text-2xl font-semibold text-gray-950">
                  {publicKey ? 'Wallet connected' : 'Ready to start'}
                </p>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                Testnet
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xl font-semibold text-gray-950">1</p>
                <p className="mt-1 text-xs text-gray-500">Goal</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xl font-semibold text-gray-950">Live</p>
                <p className="mt-1 text-xs text-gray-500">Soroban</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xl font-semibold text-gray-950">0</p>
                <p className="mt-1 text-xs text-gray-500">Transfers</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-gray-500">
              Built for goal tracking, not banking. Contributions update smart
              contract state only.
            </p>
          </div>
        </section>

        <section id="savings-dashboard" className="pb-10">
          <SavingsGoal publicKey={publicKey} />
        </section>

        <section className="pb-14">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Workshop utilities
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-950">
                Testnet tools
              </h2>
            </div>
            {publicKey && (
              <button
                onClick={refresh}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Refresh balances
              </button>
            )}
          </div>

          {!publicKey && !connecting && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
              <p className="font-medium text-gray-800">
                Connect your Freighter wallet to use testnet utilities.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                These tools stay secondary so the savings tracker remains the
                focus of the demo.
              </p>
            </div>
          )}

          {publicKey && (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <FundAccount publicKey={publicKey} onFunded={refresh} />
                  <AddTrustline publicKey={publicKey} onDone={refresh} />
                </div>
                <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
              </div>
              <SendPayment publicKey={publicKey} onSent={refresh} />
            </div>
          )}
        </section>

        <footer className="mt-4 pb-8 text-center text-xs text-gray-400">
          Built for the StellarX PH workshop @ PUP QC.
        </footer>
      </div>
    </main>
  );
}
