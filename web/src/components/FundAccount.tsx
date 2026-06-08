'use client';
import { useState } from 'react';
import { fundTestnetAccount } from '@/lib/stellar';

export default function FundAccount({
  publicKey,
  onFunded,
}: {
  publicKey: string;
  onFunded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fund = async () => {
    setLoading(true);
    setError('');
    try {
      await fundTestnetAccount(publicKey);
      onFunded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Funding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={fund}
        disabled={loading}
        className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:-translate-y-0.5 hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-100 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Funding...' : 'Fund with Friendbot'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
