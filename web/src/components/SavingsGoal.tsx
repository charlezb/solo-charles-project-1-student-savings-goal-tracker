'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  contractConfigured,
  readSavingsState,
  buildInitGoalXDR,
  buildContributeXDR,
  type SavingsState,
} from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function SavingsGoal({ publicKey }: { publicKey: string | null }) {
  const configured = contractConfigured();
  const [state, setState] = useState<SavingsState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError('');
    try {
      setState(await readSavingsState());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read contract');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    readSavingsState()
      .then((nextState) => {
        if (!active) return;
        setState(nextState);
        setError('');
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to read contract');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [configured]);

  const contribute = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const xdr = await buildContributeXDR(publicKey, Number(amount));
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
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg('Contribution recorded on-chain.');
      setAmount('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Contribution failed');
    } finally {
      setBusy(false);
    }
  };

  const createGoal = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const xdr = await buildInitGoalXDR(
        publicKey,
        goalName.trim(),
        Number(targetAmount),
      );
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
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg('Savings goal created on-chain.');
      setGoalName('');
      setTargetAmount('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Goal creation failed');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Contract setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-950">
            Deploy the Soroban contract
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            After deployment, this dashboard will read the goal state and enable
            signed updates through Freighter.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-gray-950 p-4 text-sm text-gray-100">
            .\scripts\deploy.ps1
          </pre>
        </div>
      </div>
    );
  }

  const pct =
    state && state.target > 0
      ? Math.min(100, Math.round((state.saved / state.target) * 100))
      : 0;
  const complete = pct >= 100;
  const remaining =
    state && state.target > 0 ? Math.max(0, state.target - state.saved) : 0;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/70">
      <div className="border-b border-gray-100 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Savings dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-950 sm:text-3xl">
              Your student goal
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Soroban state
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {loading && (
          <div className="space-y-5" aria-live="polite">
            <div className="h-8 w-48 animate-pulse rounded-full bg-gray-100" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            </div>
            <div className="h-5 animate-pulse rounded-full bg-gray-100" />
          </div>
        )}

        {!loading && state && state.target === 0 && (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Create your first goal
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-gray-950">
                Start with one clear savings target.
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Give your goal a name, set a target amount, and save it to the
                contract with your Freighter wallet.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="goal-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Goal name
                  </label>
                  <input
                    id="goal-name"
                    type="text"
                    placeholder="Laptop fund"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-950 shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="target-amount"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Target amount
                  </label>
                  <input
                    id="target-amount"
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-950 shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>

                <button
                  onClick={createGoal}
                  disabled={busy || !publicKey || !goalName.trim() || !targetAmount}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? 'Creating goal...' : 'Create goal'}
                </button>

                {!publicKey && (
                  <p className="text-center text-sm text-gray-500">
                    Connect your wallet to create a savings goal.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && state && state.target > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-semibold text-gray-950 sm:text-4xl">
                    {state.name}
                  </h3>
                  {complete && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Goal complete
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {remaining > 0
                    ? `${remaining} remaining to reach your target.`
                    : 'Target reached. Nice work.'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-950 px-5 py-4 text-white">
                <p className="text-sm text-gray-300">Progress</p>
                <p className="mt-1 text-4xl font-semibold">{pct}%</p>
              </div>
            </div>

            <div>
              <div
                className="h-5 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label="Savings goal progress"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-gray-950 transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Saved</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-950">
                    {state.saved}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Target</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-950">
                    {state.target}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Remaining</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-950">
                    {remaining}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="contribution-amount"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Contribution amount
                  </label>
                  <input
                    id="contribution-amount"
                    type="number"
                    min="1"
                    placeholder="250"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-950 shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-950 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  />
                </div>
                <button
                  onClick={contribute}
                  disabled={busy || !publicKey || !amount}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gray-950 px-6 text-sm font-semibold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-40"
                >
                  {busy ? 'Updating...' : 'Contribute'}
                </button>
              </div>
              {!publicKey && (
                <p className="mt-3 text-sm text-gray-500">
                  Connect your wallet to sign the Soroban transaction.
                </p>
              )}
            </div>
          </div>
        )}

        {(msg || error) && (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm ${
              msg
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
            role="status"
            aria-live="polite"
          >
            {msg || error}
          </div>
        )}
      </div>
    </div>
  );
}
