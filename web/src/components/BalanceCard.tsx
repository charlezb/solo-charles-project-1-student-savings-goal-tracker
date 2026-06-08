'use client';
import { useState, useEffect } from 'react';
import { fetchBalances, type Balances } from '@/lib/balances';

export default function BalanceCard({
  publicKey,
  refreshKey,
}: {
  publicKey: string;
  refreshKey: number;
}) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchBalances(publicKey)
      .then((b) => {
        if (!active) return;
        setBalances(b);
      })
      .catch(() => {
        if (!active) return;
        setBalances(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [publicKey, refreshKey]);

  if (loading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-gray-100" />
        <div className="h-24 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (balances && !balances.funded) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This account is not funded yet. Use Friendbot to add testnet XLM.
      </p>
    );
  }

  if (!balances) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load balances.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:-translate-y-0.5 hover:border-gray-300">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          XLM
        </p>
        <p className="mt-2 text-2xl font-semibold text-gray-950">{balances.xlm}</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:-translate-y-0.5 hover:border-gray-300">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          USDC
        </p>
        <p className="mt-2 text-2xl font-semibold text-gray-950">{balances.usdc}</p>
      </div>
    </div>
  );
}
