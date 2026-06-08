'use client';
import { useState } from 'react';
import { buildAddUsdcTrustlineXDR } from '@/lib/trustline';
import { signAndSubmit } from '@/lib/sign';

type Status = 'idle' | 'working' | 'done' | 'error';

export default function AddTrustline({
  publicKey,
  onDone,
}: {
  publicKey: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const add = async () => {
    setStatus('working');
    setError('');
    try {
      const xdr = await buildAddUsdcTrustlineXDR(publicKey);
      await signAndSubmit(xdr, publicKey);
      setStatus('done');
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add trustline');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        USDC trustline added.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={add}
        disabled={status === 'working'}
        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'working' ? 'Adding trustline...' : 'Add USDC trustline'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
