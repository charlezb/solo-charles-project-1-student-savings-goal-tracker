'use client';
import { useState } from 'react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
  type AssetCode,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

type Status =
  | 'idle'
  | 'building'
  | 'signing'
  | 'submitting'
  | 'polling'
  | 'success'
  | 'error';

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Send payment',
  building: 'Building...',
  signing: 'Waiting for Freighter...',
  submitting: 'Submitting...',
  polling: 'Confirming...',
  success: 'Send payment',
  error: 'Send payment',
};

export default function SendPayment({
  publicKey,
  onSent,
}: {
  publicKey: string;
  onSent: () => void;
}) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<AssetCode>('XLM');
  const [status, setStatus] = useState<Status>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const busy = ['building', 'signing', 'submitting', 'polling'].includes(status);

  const handleSend = async () => {
    setStatus('building');
    setErrorMsg('');
    setTxHash('');
    try {
      const xdr = await buildPaymentXDR(publicKey, destination.trim(), amount, asset);

      setStatus('signing');
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(
          typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
        );
      }

      setStatus('submitting');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      setTxHash(hash);

      setStatus('polling');
      await pollTransaction(hash);
      setStatus('success');
      onSent();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Optional demo
        </p>
        <h2 className="mt-1 text-xl font-semibold text-gray-950">Send Payment</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="payment-asset" className="mb-2 block text-sm font-medium text-gray-700">
            Asset
          </label>
          <select
            id="payment-asset"
            value={asset}
            onChange={(e) => setAsset(e.target.value as AssetCode)}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-950 shadow-sm transition hover:border-gray-400 focus:border-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            <option value="XLM">XLM</option>
            <option value="USDC">USDC (needs a trustline)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="payment-destination"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Destination address
          </label>
          <input
            id="payment-destination"
            type="text"
            placeholder="G... funded testnet account"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 font-mono text-sm text-gray-950 shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
          />
        </div>

        <div>
          <label htmlFor="payment-amount" className="mb-2 block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            id="payment-amount"
            type="number"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-950 shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={busy || !destination || !amount}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {STATUS_LABEL[status]}
        </button>
      </div>

      {status === 'success' && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-medium text-emerald-700">Payment confirmed.</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-sm text-gray-700 underline decoration-emerald-300 underline-offset-4 hover:text-gray-950"
          >
            View on Stellar Expert
          </a>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
