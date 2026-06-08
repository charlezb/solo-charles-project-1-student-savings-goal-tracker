'use client';
import { useState } from 'react';
import type { WalletState } from '@/hooks/useWallet';

export default function ConnectWallet({
  publicKey,
  connecting,
  error,
  connect,
  disconnect,
}: WalletState) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={copy}
          title="Copy full address"
          className="rounded-full border border-gray-200 bg-white px-3 py-2 font-mono text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
        >
          {copied ? 'Copied' : `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`}
        </button>
        <button
          onClick={disconnect}
          className="rounded-full px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="text-right">
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded-full bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {connecting ? 'Connecting...' : 'Connect Freighter'}
      </button>
      {error && <p className="mt-2 max-w-xs text-sm text-red-600">{error}</p>}
    </div>
  );
}
