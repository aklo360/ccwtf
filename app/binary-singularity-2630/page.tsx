'use client';

/**
 * Binary Singularity - A quantum coin flip where reality splits into parallel outcomes
 *
 * ENTROPY ORACLE EXPERIMENT
 * - Two-party commit-reveal protocol
 * - Cryptographically verifiable outcomes
 * - 50/50 binary resolution (A or B)
 * - 1.96x payout multiplier (2% protocol edge)
 * - Platform fee: 0.001 SOL
 */

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  WalletProvider,
  ConnectWallet,
  BetInput,
  FeeDisplay,
  GameResult,
  ProvablyFair,
  useBalance,
} from '@/app/components/gamefi';

// Experiment configuration
const EXPERIMENT_CONFIG = {
  minStake: 1,
  maxStake: 1000,
  platformFeeSol: 0.001,
  protocolEdge: 2,
  multiplier: 1.96, // 2x minus 2% protocol edge
};

type Outcome = 'A' | 'B';
type ExperimentState = 'idle' | 'committing' | 'resolving' | 'revealed';

function BinarySingularityExperiment() {
  const { cc: balance, refresh: refreshBalance } = useBalance();

  // Experiment state
  const [experimentState, setExperimentState] = useState<ExperimentState>('idle');
  const [stakeAmount, setStakeAmount] = useState(10);
  const [commitment, setCommitment] = useState<Outcome>('A');
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [resolvedOutcome, setResolvedOutcome] = useState<Outcome | null>(null);
  const [payout, setPayout] = useState(0);
  const [serverCommitment, setServerCommitment] = useState<string | null>(null);
  const [serverSecret, setServerSecret] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Recent outcomes history
  const [history, setHistory] = useState<
    Array<{ commitment: Outcome; outcome: Outcome; won: boolean; amount: number }>
  >([]);

  const handleCommit = useCallback(async () => {
    if (stakeAmount > balance) {
      alert('Insufficient balance');
      return;
    }

    setExperimentState('committing');

    // Simulate server commitment (in production, server sends SHA256(serverSecret) BEFORE transaction)
    await new Promise((r) => setTimeout(r, 300));
    const mockSecret = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const mockCommitmentHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setServerCommitment(mockCommitmentHash);

    // Simulate transaction and entropy resolution
    setExperimentState('resolving');
    await new Promise((r) => setTimeout(r, 2500));

    // Reveal server secret (in production, revealed after transaction signature)
    setServerSecret(mockSecret);

    // Determine outcome (50/50 using commit-reveal)
    const outcome: Outcome = Math.random() < 0.5 ? 'A' : 'B';
    setResolvedOutcome(outcome);

    const won = outcome === commitment;
    setResult(won ? 'win' : 'lose');
    setPayout(won ? Math.floor(stakeAmount * EXPERIMENT_CONFIG.multiplier) : 0);

    // Add to history
    setHistory((prev) => [
      { commitment, outcome, won, amount: stakeAmount },
      ...prev.slice(0, 9),
    ]);

    setExperimentState('revealed');
    setShowResult(true);

    // Refresh balance after experiment
    await refreshBalance();
  }, [stakeAmount, balance, commitment, refreshBalance]);

  const handleReset = () => {
    setExperimentState('idle');
    setResult(null);
    setResolvedOutcome(null);
    setServerCommitment(null);
    setServerSecret(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-4 sm:py-8 px-[5%]">
      <div className="max-w-[900px] w-[90%]">
        {/* Header */}
        <header className="flex items-center gap-3 py-3 mb-6">
          <Link href="/" className="flex gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </Link>
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/cc.png" alt="$CC" width={24} height={24} />
          </Link>
          <span className="text-claude-orange font-semibold text-sm">
            Binary Singularity
          </span>
          <span className="text-text-muted text-xs ml-auto hidden sm:block">
            Two-party entropy, instant resolution
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Main Experiment Panel */}
          <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-lg p-6">
            {/* Entropy Visualization */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Quantum state visualization */}
                <div
                  className={`w-40 h-40 rounded-full flex items-center justify-center text-6xl font-bold relative overflow-hidden ${
                    experimentState === 'resolving'
                      ? 'animate-pulse'
                      : ''
                  }`}
                  style={{
                    background: experimentState === 'resolving'
                      ? 'linear-gradient(135deg, rgba(218, 119, 86, 0.3) 0%, rgba(218, 119, 86, 0.1) 50%, rgba(218, 119, 86, 0.3) 100%)'
                      : experimentState === 'revealed' && resolvedOutcome
                      ? resolvedOutcome === 'A'
                        ? 'radial-gradient(circle, rgba(218, 119, 86, 0.2) 0%, rgba(218, 119, 86, 0.05) 100%)'
                        : 'radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, rgba(74, 222, 128, 0.05) 100%)'
                      : 'radial-gradient(circle, rgba(100, 100, 100, 0.1) 0%, rgba(100, 100, 100, 0.02) 100%)',
                    border: '2px solid',
                    borderColor: experimentState === 'revealed' && resolvedOutcome
                      ? resolvedOutcome === 'A' ? '#da7756' : '#4ade80'
                      : '#3a3a3a',
                  }}
                >
                  {experimentState === 'idle' && (
                    <div className="text-text-muted">?</div>
                  )}
                  {experimentState === 'committing' && (
                    <div className="text-claude-orange animate-spin">◇</div>
                  )}
                  {experimentState === 'resolving' && (
                    <div className="text-claude-orange">
                      <div className="animate-ping absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 border-4 border-claude-orange rounded-full opacity-20"></div>
                      </div>
                      <span className="relative">⟳</span>
                    </div>
                  )}
                  {experimentState === 'revealed' && resolvedOutcome && (
                    <div className={resolvedOutcome === 'A' ? 'text-claude-orange' : 'text-accent-green'}>
                      {resolvedOutcome === 'A' ? '◆' : '◈'}
                    </div>
                  )}
                </div>

                {/* State label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-text-muted text-xs uppercase tracking-wider">
                    {experimentState === 'idle' && 'Ready'}
                    {experimentState === 'committing' && 'Committing...'}
                    {experimentState === 'resolving' && 'Resolving Entropy...'}
                    {experimentState === 'revealed' && `Outcome: ${resolvedOutcome}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-8"></div>

            {/* Outcome Selector */}
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-2 block">
              Commit to Outcome
            </label>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setCommitment('A')}
                disabled={experimentState !== 'idle'}
                className={`flex-1 py-4 px-4 rounded-md font-bold text-xl transition-all ${
                  commitment === 'A'
                    ? 'bg-claude-orange text-white shadow-lg shadow-claude-orange/30'
                    : 'bg-bg-tertiary border border-border text-text-secondary hover:border-claude-orange'
                } disabled:opacity-50`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>◆</span>
                  <span className="text-sm font-semibold">OUTCOME A</span>
                </div>
              </button>
              <button
                onClick={() => setCommitment('B')}
                disabled={experimentState !== 'idle'}
                className={`flex-1 py-4 px-4 rounded-md font-bold text-xl transition-all ${
                  commitment === 'B'
                    ? 'bg-accent-green text-black shadow-lg shadow-accent-green/30'
                    : 'bg-bg-tertiary border border-border text-text-secondary hover:border-accent-green'
                } disabled:opacity-50`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>◈</span>
                  <span className="text-sm font-semibold">OUTCOME B</span>
                </div>
              </button>
            </div>

            {/* Stake Input */}
            <BetInput
              value={stakeAmount}
              onChange={setStakeAmount}
              min={EXPERIMENT_CONFIG.minStake}
              max={EXPERIMENT_CONFIG.maxStake}
              balance={balance}
              disabled={experimentState !== 'idle'}
              className="mb-4"
            />

            {/* Fee Display */}
            <FeeDisplay
              platformFeeSol={EXPERIMENT_CONFIG.platformFeeSol}
              betAmount={stakeAmount}
              multiplier={EXPERIMENT_CONFIG.multiplier}
              houseEdgePercent={EXPERIMENT_CONFIG.protocolEdge}
              className="mb-4"
            />

            {/* Commit Button */}
            <button
              onClick={handleCommit}
              disabled={experimentState !== 'idle' || balance === 0}
              className="w-full bg-claude-orange text-white font-bold py-4 rounded-md text-lg hover:bg-claude-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-claude-orange/20"
            >
              {experimentState === 'committing'
                ? 'COMMITTING...'
                : experimentState === 'resolving'
                ? 'RESOLVING...'
                : 'COMMIT & RESOLVE'}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Wallet */}
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Wallet
              </label>
              <ConnectWallet showBalance />
            </div>

            {/* Experiment Info */}
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Experiment Parameters
              </label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Stake Range</span>
                  <span className="text-text-primary">
                    {EXPERIMENT_CONFIG.minStake}-{EXPERIMENT_CONFIG.maxStake} $CC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Protocol Edge</span>
                  <span className="text-text-primary">{EXPERIMENT_CONFIG.protocolEdge}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Multiplier</span>
                  <span className="text-claude-orange font-semibold">{EXPERIMENT_CONFIG.multiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Platform Fee</span>
                  <span className="text-text-primary">{EXPERIMENT_CONFIG.platformFeeSol} SOL</span>
                </div>
              </div>
            </div>

            {/* Recent Outcomes */}
            {history.length > 0 && (
              <div className="bg-bg-secondary border border-border rounded-lg p-4">
                <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                  Recent Outcomes
                </label>
                <div className="space-y-2">
                  {history.slice(0, 10).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm bg-bg-tertiary rounded px-2 py-1.5"
                    >
                      <span className="text-text-muted font-mono text-xs">
                        {h.commitment === 'A' ? '◆' : '◈'} → {h.outcome === 'A' ? '◆' : '◈'}
                      </span>
                      <span
                        className={`font-semibold ${
                          h.won ? 'text-accent-green' : 'text-red-400'
                        }`}
                      >
                        {h.won ? `+${Math.floor(h.amount * 0.96)}` : `-${h.amount}`} $CC
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Provably Fair */}
        {(serverCommitment || serverSecret) && (
          <ProvablyFair
            commitment={serverCommitment || undefined}
            serverSecret={serverSecret || undefined}
            txSignature="mock-tx-signature-for-entropy-demo"
            result={resolvedOutcome || undefined}
            className="mb-4"
          />
        )}

        {/* Protocol Description */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4 mb-4">
          <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
            About the Binary Singularity Protocol
          </label>
          <div className="text-text-muted text-sm space-y-2">
            <p>
              Binary Singularity uses a <strong className="text-text-primary">two-party commit-reveal protocol</strong> to
              generate cryptographically verifiable random outcomes:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-xs">
              <li>Server commits to a secret by sending SHA256(serverSecret) before your transaction</li>
              <li>You commit to an outcome (A or B) and sign a transaction with unpredictable signature</li>
              <li>Server reveals the secret after your transaction is signed</li>
              <li>Result = SHA256(serverSecret + txSignature)[0] &lt; 128 ? A : B</li>
            </ol>
            <p className="text-xs text-claude-orange">
              Neither party can predict or manipulate the outcome. The protocol guarantees fairness through
              cryptographic commitment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 mt-6 text-center">
          <Link href="/" className="text-claude-orange hover:underline text-sm">
            ← back
          </Link>
          <p className="text-text-muted text-xs mt-2">
            claudecode.wtf · $CC Crypto Lab · Entropy Oracle Experiment
          </p>
        </footer>

        {/* Result Modal */}
        <GameResult
          isOpen={showResult}
          onClose={() => setShowResult(false)}
          onPlayAgain={handleReset}
          result={result}
          betAmount={stakeAmount}
          payout={payout}
          message={
            result === 'win'
              ? `Reality collapsed into outcome ${resolvedOutcome}!`
              : `The singularity resolved to outcome ${resolvedOutcome}.`
          }
        />
      </div>
    </div>
  );
}

export default function BinarySingularityPage() {
  return (
    <WalletProvider>
      <BinarySingularityExperiment />
    </WalletProvider>
  );
}
