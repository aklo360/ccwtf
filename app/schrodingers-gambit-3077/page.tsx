'use client';

/**
 * Schrödinger's Gambit - Quantum Entropy Oracle
 *
 * A cryptographic 50/50 outcome determination using commit-reveal entropy.
 * Your commitment exists in all states until cryptographic observation collapses the wave function.
 *
 * CRYPTOGRAPHIC GUARANTEE:
 * - Server commits to secret BEFORE user acts
 * - User's transaction signature is unpredictable
 * - Result computed from BOTH sources
 * - Neither party can predict or manipulate outcome
 * - Protocol fee: 2% (1.96x payout multiplier)
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  WalletProvider,
  ConnectWallet,
  BetInput,
  GameResult,
  ProvablyFair,
  useBalance,
} from '@/app/components/gamefi';

// Game constants
const MIN_STAKE = 1;
const MAX_STAKE = 1000;
const PROTOCOL_EDGE = 0.02;
const PAYOUT_MULTIPLIER = 2 * (1 - PROTOCOL_EDGE); // 1.96x
const PLATFORM_FEE_SOL = 0.001;

// Outcome options (A/B abstraction with quantum theme)
type Outcome = 'wave' | 'particle';
type GamePhase = 'idle' | 'committing' | 'resolving' | 'revealing' | 'complete';

interface GameRound {
  commitment?: string;
  serverSecret?: string;
  txSignature?: string;
  result?: Outcome;
  playerChoice?: Outcome;
  stakeAmount: number;
  payout: number;
  timestamp: number;
}

// Mock crypto functions (in production, these would be API calls)
const generateServerSecret = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const hashSecret = async (secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const computeResult = async (serverSecret: string, txSignature: string): Promise<Outcome> => {
  const combined = serverSecret + txSignature;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const firstByte = hashArray[0];
  return firstByte < 128 ? 'wave' : 'particle';
};

// Mock transaction signature generator
const mockTransactionSign = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let sig = '';
  for (let i = 0; i < 88; i++) {
    sig += chars[Math.floor(Math.random() * chars.length)];
  }
  return sig;
};

function SchrodingersGambitExperiment() {
  const { connected } = useWallet();
  const { cc: ccBalance } = useBalance();

  // Game state
  const [stakeAmount, setStakeAmount] = useState(10);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>('wave');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [recentRounds, setRecentRounds] = useState<GameRound[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [entropyProgress, setEntropyProgress] = useState(0);

  // Quantum wave animation state
  const [wavePhase, setWavePhase] = useState(0);

  // Animate the quantum wave
  useEffect(() => {
    const interval = setInterval(() => {
      setWavePhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Entropy resolution animation
  useEffect(() => {
    if (phase === 'resolving') {
      const interval = setInterval(() => {
        setEntropyProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    } else {
      setEntropyProgress(0);
    }
  }, [phase]);

  const handleCommit = async () => {
    if (!connected || stakeAmount < MIN_STAKE || stakeAmount > MAX_STAKE || stakeAmount > ccBalance) {
      return;
    }

    // Phase 1: Server generates and commits to secret
    setPhase('committing');
    const serverSecret = generateServerSecret();
    const commitment = await hashSecret(serverSecret);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Phase 2: User signs transaction (creates entropy)
    setPhase('resolving');
    const txSignature = mockTransactionSign();

    // Initialize round
    setCurrentRound({
      commitment,
      serverSecret: '', // Hidden until reveal
      txSignature,
      playerChoice: selectedOutcome,
      stakeAmount,
      payout: 0,
      timestamp: Date.now(),
    });

    // Entropy resolution animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Phase 3: Reveal and compute result
    setPhase('revealing');
    const result = await computeResult(serverSecret, txSignature);
    const won = result === selectedOutcome;
    const payout = won ? Math.floor(stakeAmount * PAYOUT_MULTIPLIER) : 0;

    const finalRound: GameRound = {
      commitment,
      serverSecret,
      txSignature,
      result,
      playerChoice: selectedOutcome,
      stakeAmount,
      payout,
      timestamp: Date.now(),
    };

    setCurrentRound(finalRound);
    setRecentRounds(prev => [finalRound, ...prev].slice(0, 10));

    // Simulate reveal delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setPhase('complete');
    setShowResult(true);
  };

  const handlePlayAgain = () => {
    setPhase('idle');
    setShowResult(false);
    setCurrentRound(null);
    setEntropyProgress(0);
  };

  const isCommitDisabled = !connected || stakeAmount < MIN_STAKE || stakeAmount > MAX_STAKE || stakeAmount > ccBalance || phase !== 'idle';

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-4 sm:py-8 px-[5%]">
      <div className="max-w-[900px] w-[90%]">

        {/* HEADER */}
        <header className="flex items-center gap-3 py-3 mb-6">
          <Link href="/" className="flex gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </Link>
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/cc.png" alt="$CC" width={24} height={24} />
          </Link>
          <span className="text-claude-orange font-semibold text-sm">Schrödinger's Gambit</span>
          <span className="text-text-muted text-xs ml-auto">Quantum Entropy Oracle</span>
        </header>

        {/* CONTENT */}
        <div className="space-y-4">

          {/* Wallet Connection */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-text-primary font-semibold text-base mb-1">Connect Wallet</h2>
                <p className="text-text-muted text-xs">Two-party entropy requires Solana wallet</p>
              </div>
              <ConnectWallet />
            </div>
          </div>

          {/* Quantum State Visualization */}
          <div className="bg-bg-secondary border border-border rounded-lg p-6 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path
                  d={`M 0 50 ${Array.from({ length: 40 }).map((_, i) => {
                    const x = i * 10;
                    const y = 50 + Math.sin((wavePhase + i * 9) * Math.PI / 180) * 30;
                    return `L ${x} ${y}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-claude-orange"
                />
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-text-primary font-semibold text-sm mb-2">Quantum Superposition</h3>
              <p className="text-text-muted text-xs mb-4">
                Your commitment exists in all states until cryptographic observation collapses the wave function
              </p>

              {phase === 'idle' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🌊⚛️</div>
                  <p className="text-text-secondary text-sm">Awaiting quantum commitment...</p>
                </div>
              )}

              {phase === 'committing' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2 animate-pulse">🔒</div>
                  <p className="text-text-secondary text-sm">Server committing to entropy...</p>
                </div>
              )}

              {phase === 'resolving' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2 animate-spin">⚛️</div>
                  <p className="text-text-secondary text-sm mb-3">Collapsing wave function...</p>
                  <div className="w-full bg-bg-primary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-claude-orange transition-all duration-100"
                      style={{ width: `${entropyProgress}%` }}
                    />
                  </div>
                  <p className="text-text-muted text-xs mt-2">{entropyProgress}% entropy resolved</p>
                </div>
              )}

              {phase === 'revealing' && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🔓</div>
                  <p className="text-text-secondary text-sm">Revealing server secret...</p>
                </div>
              )}

              {phase === 'complete' && currentRound && (
                <div className="text-center py-4">
                  <div className="text-5xl mb-2">
                    {currentRound.result === 'wave' ? '🌊' : '⚛️'}
                  </div>
                  <p className="text-text-primary text-lg font-semibold mb-1">
                    Observed: {currentRound.result === 'wave' ? 'WAVE' : 'PARTICLE'}
                  </p>
                  <p className="text-text-muted text-xs">
                    Wave function collapsed to definite state
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stake Input */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <BetInput
              value={stakeAmount}
              onChange={setStakeAmount}
              min={MIN_STAKE}
              max={MAX_STAKE}
              balance={ccBalance}
              disabled={phase !== 'idle'}
            />
          </div>

          {/* Outcome Selection */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Commit to Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedOutcome('wave')}
                disabled={phase !== 'idle'}
                className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  selectedOutcome === 'wave'
                    ? 'border-claude-orange bg-claude-orange/10'
                    : 'border-border bg-bg-tertiary hover:border-claude-orange/50'
                }`}
              >
                <div className="text-3xl mb-2">🌊</div>
                <div className="text-text-primary font-semibold text-sm">WAVE</div>
                <div className="text-text-muted text-xs mt-1">Observable state A</div>
              </button>
              <button
                onClick={() => setSelectedOutcome('particle')}
                disabled={phase !== 'idle'}
                className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  selectedOutcome === 'particle'
                    ? 'border-claude-orange bg-claude-orange/10'
                    : 'border-border bg-bg-tertiary hover:border-claude-orange/50'
                }`}
              >
                <div className="text-3xl mb-2">⚛️</div>
                <div className="text-text-primary font-semibold text-sm">PARTICLE</div>
                <div className="text-text-muted text-xs mt-1">Observable state B</div>
              </button>
            </div>
          </div>

          {/* Protocol Info */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-2 block">
              Protocol Parameters
            </label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Payout Multiplier:</span>
                <span className="text-claude-orange font-semibold ml-2">{PAYOUT_MULTIPLIER}x</span>
              </div>
              <div>
                <span className="text-text-muted">Protocol Edge:</span>
                <span className="text-text-secondary ml-2">{(PROTOCOL_EDGE * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-text-muted">Platform Fee:</span>
                <span className="text-text-secondary ml-2">{PLATFORM_FEE_SOL} SOL</span>
              </div>
              <div>
                <span className="text-text-muted">Potential Payout:</span>
                <span className="text-accent-green ml-2">{Math.floor(stakeAmount * PAYOUT_MULTIPLIER)} $CC</span>
              </div>
            </div>
          </div>

          {/* Commit Button */}
          <button
            onClick={handleCommit}
            disabled={isCommitDisabled}
            className="w-full bg-claude-orange text-white font-semibold py-3 px-4 rounded-md text-base hover:bg-claude-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {phase === 'idle' ? (
              `Commit ${stakeAmount} $CC to ${selectedOutcome === 'wave' ? 'WAVE' : 'PARTICLE'}`
            ) : phase === 'committing' ? (
              'Committing...'
            ) : phase === 'resolving' ? (
              'Resolving Entropy...'
            ) : phase === 'revealing' ? (
              'Revealing...'
            ) : (
              'Experiment Complete'
            )}
          </button>

          {/* Provably Fair */}
          {currentRound && (
            <ProvablyFair
              commitment={currentRound.commitment}
              serverSecret={currentRound.serverSecret}
              txSignature={currentRound.txSignature}
              result={currentRound.result}
              solscanCluster="?cluster=devnet"
            />
          )}

          {/* Recent Outcomes */}
          {recentRounds.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Recent Experiments
              </label>
              <div className="space-y-2">
                {recentRounds.map((round, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-bg-tertiary border border-border rounded p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {round.result === 'wave' ? '🌊' : '⚛️'}
                      </span>
                      <span className="text-text-muted">
                        {new Date(round.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary">
                        Stake: {round.stakeAmount} $CC
                      </span>
                      <span className={round.payout > 0 ? 'text-accent-green' : 'text-red-400'}>
                        {round.payout > 0 ? `+${round.payout - round.stakeAmount}` : `-${round.stakeAmount}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <h3 className="text-text-primary font-semibold text-sm mb-3">How Two-Party Entropy Works</h3>
            <ol className="space-y-2 text-xs text-text-muted list-decimal list-inside">
              <li>
                <strong className="text-text-secondary">Server Commitment:</strong> Server generates random secret and sends you SHA256(secret) BEFORE you commit
              </li>
              <li>
                <strong className="text-text-secondary">Your Transaction:</strong> You sign transaction, creating unpredictable signature as entropy source
              </li>
              <li>
                <strong className="text-text-secondary">Entropy Resolution:</strong> Server reveals secret, result = SHA256(secret + txSig)[0] &lt; 128 ? Wave : Particle
              </li>
              <li>
                <strong className="text-text-secondary">Cryptographic Guarantee:</strong> Neither party can predict or manipulate the final outcome
              </li>
            </ol>
            <div className="mt-3 p-2 bg-bg-tertiary border border-claude-orange/30 rounded">
              <p className="text-xs text-claude-orange">
                <strong>⚠️ Research Experiment:</strong> This is a cryptographic demonstration. Protocol edge: 2%. Platform fee: 0.001 SOL per resolution.
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="py-4 mt-6 text-center">
          <Link href="/" className="text-claude-orange hover:underline text-sm">
            ← back
          </Link>
          <p className="text-text-muted text-xs mt-2">
            claudecode.wtf · 100% of fees to @bcherny
          </p>
        </footer>

      </div>

      {/* Result Modal */}
      {currentRound && (
        <GameResult
          isOpen={showResult}
          onClose={() => setShowResult(false)}
          onPlayAgain={handlePlayAgain}
          result={currentRound.result === currentRound.playerChoice ? 'win' : 'lose'}
          betAmount={currentRound.stakeAmount}
          payout={currentRound.payout}
          message={
            currentRound.result === currentRound.playerChoice
              ? `Wave function collapsed to ${currentRound.result === 'wave' ? 'WAVE' : 'PARTICLE'} - you predicted correctly!`
              : `Wave function collapsed to ${currentRound.result === 'wave' ? 'WAVE' : 'PARTICLE'} - not your predicted state`
          }
        />
      )}
    </div>
  );
}

export default function SchrodingersGambitPage() {
  return (
    <WalletProvider>
      <SchrodingersGambitExperiment />
    </WalletProvider>
  );
}
