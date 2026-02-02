'use client';

/**
 * Neural Archive Excavation - Probability Engine Experiment
 *
 * Excavate data fragments from corrupted AI memory banks using
 * cryptographic probability matrices.
 *
 * OUTCOME DISTRIBUTION:
 * - Tier 1 (74%): 0.5x return (2.5 $CC)
 * - Tier 2 (20%): 2x return (10 $CC)
 * - Tier 3 (5%): 5x return (25 $CC)
 * - Tier 4 (1%): 10x return (50 $CC)
 *
 * 10-SAMPLE GUARANTEE:
 * - At least 1 Tier 2+ result guaranteed
 * - If no Tier 2 in first 9, 10th is forced Tier 2+
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  singleStake: 5,      // 5 $CC per sample
  batchStake: 50,      // 50 $CC for 10 samples
  platformFeeSol: 0.001,
  protocolEdgePercent: 10,
};

// Outcome tiers
const OUTCOME_TIERS = [
  { tier: 1, probability: 0.74, multiplier: 0.5, payout: 2.5, label: 'CORRUPTED', color: 'text-text-muted', emoji: '⚠️' },
  { tier: 2, probability: 0.20, multiplier: 2.0, payout: 10, label: 'RECOVERED', color: 'text-blue-400', emoji: '💾' },
  { tier: 3, probability: 0.05, multiplier: 5.0, payout: 25, label: 'PRISTINE', color: 'text-purple-400', emoji: '✨' },
  { tier: 4, probability: 0.01, multiplier: 10.0, payout: 50, label: 'LEGENDARY', color: 'text-claude-orange', emoji: '🔥' },
];

type ExperimentState = 'idle' | 'sampling' | 'revealing' | 'complete';
type OutcomeTier = 1 | 2 | 3 | 4;

interface SampleResult {
  tier: OutcomeTier;
  payout: number;
  seed: string;
}

interface SessionStats {
  totalSamples: number;
  totalReturns: number;
  samplesSinceT3: number; // Samples since last Tier 3 or 4
  tierCounts: Record<OutcomeTier, number>;
}

function NeuralArchiveGame() {
  const { cc: balance, refresh: refreshBalance } = useBalance();

  // Experiment state
  const [experimentState, setExperimentState] = useState<ExperimentState>('idle');
  const [stakeAmount, setStakeAmount] = useState(5);
  const [isBatch, setIsBatch] = useState(false);
  const [currentResults, setCurrentResults] = useState<SampleResult[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  // Session stats
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSamples: 0,
    totalReturns: 0,
    samplesSinceT3: 0,
    tierCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
  });

  // Recent history (last 10 samples)
  const [history, setHistory] = useState<SampleResult[]>([]);

  // Simulate VRF-based outcome determination
  const determineOutcome = (seed: string, guaranteeTier2: boolean = false): OutcomeTier => {
    if (guaranteeTier2) {
      // Guarantee logic: force Tier 2+ (distribute across 2, 3, 4)
      const rand = Math.random();
      if (rand < 0.76) return 2; // 76% of guaranteed outcomes are Tier 2
      if (rand < 0.95) return 3; // 19% are Tier 3
      return 4; // 5% are Tier 4
    }

    // Normal distribution
    const rand = Math.random();
    if (rand < 0.74) return 1;
    if (rand < 0.94) return 2;
    if (rand < 0.99) return 3;
    return 4;
  };

  // Generate random seed (in production, this comes from VRF)
  const generateSeed = (): string => {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const handleExcavate = useCallback(async (batch: boolean) => {
    const stake = batch ? EXPERIMENT_CONFIG.batchStake : EXPERIMENT_CONFIG.singleStake;

    if (stake > balance) {
      alert('Insufficient $CC balance');
      return;
    }

    // Reset state
    setCurrentResults([]);
    setRevealIndex(0);
    setShowResultModal(false);
    setIsBatch(batch);
    setStakeAmount(stake);

    setExperimentState('sampling');

    // Simulate blockchain commit
    await new Promise((r) => setTimeout(r, 500));

    // Generate mock commitment (in production, comes from VRF)
    const mockSecret = generateSeed();
    const mockCommitment = generateSeed();
    setCommitment(mockCommitment);
    setSecret(mockSecret);

    // Generate outcomes
    const numSamples = batch ? 10 : 1;
    const results: SampleResult[] = [];
    let hasT2Plus = false;

    for (let i = 0; i < numSamples; i++) {
      const seed = generateSeed();

      // Check if we need to guarantee Tier 2+ on 10th sample
      const isGuaranteeNeeded = batch && i === 9 && !hasT2Plus;

      const tier = determineOutcome(seed, isGuaranteeNeeded);
      const tierData = OUTCOME_TIERS.find(t => t.tier === tier)!;

      if (tier >= 2) hasT2Plus = true;

      results.push({
        tier,
        payout: tierData.payout,
        seed,
      });
    }

    setCurrentResults(results);

    // Start reveal animation
    setExperimentState('revealing');

    // Reveal samples one by one (faster for batch)
    const revealDelay = batch ? 400 : 1500;
    for (let i = 0; i < results.length; i++) {
      await new Promise((r) => setTimeout(r, revealDelay));
      setRevealIndex(i + 1);
    }

    // Calculate totals
    const totalPayout = results.reduce((sum, r) => sum + r.payout, 0);

    // Update session stats
    setSessionStats(prev => {
      const newStats = {
        totalSamples: prev.totalSamples + numSamples,
        totalReturns: prev.totalReturns + totalPayout,
        samplesSinceT3: prev.samplesSinceT3 + numSamples,
        tierCounts: { ...prev.tierCounts } as Record<OutcomeTier, number>,
      };

      // Update tier counts and check for Tier 3+
      results.forEach(r => {
        newStats.tierCounts[r.tier]++;
        if (r.tier >= 3) {
          newStats.samplesSinceT3 = 0;
        }
      });

      return newStats;
    });

    // Update history
    setHistory(prev => [...results, ...prev].slice(0, 10));

    // Show result modal
    setExperimentState('complete');
    setShowResultModal(true);

    // Refresh balance
    await refreshBalance();
  }, [balance, refreshBalance]);

  const handlePlayAgain = () => {
    setExperimentState('idle');
    setShowResultModal(false);
    setCurrentResults([]);
    setRevealIndex(0);
    setCommitment(null);
    setSecret(null);
  };

  // Calculate net profit/loss
  const netResult = sessionStats.totalReturns - (sessionStats.totalSamples * 5);
  const isProfit = netResult > 0;

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
            Neural Archive Excavation
          </span>
          <span className="text-text-muted text-xs ml-auto">Probability Engine</span>
          <ConnectWallet showBalance />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Excavation Area - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">

            {/* Current Excavation Display */}
            <div className="bg-bg-secondary border border-border rounded-lg p-6">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-4 block">
                Memory Fragment Status
              </label>

              {/* Display current results during reveal */}
              {currentResults.length > 0 ? (
                <div className="space-y-3">
                  {currentResults.slice(0, revealIndex).map((result, i) => {
                    const tierData = OUTCOME_TIERS.find(t => t.tier === result.tier)!;
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between bg-bg-primary border border-border rounded-lg p-4 transition-all ${
                          i === revealIndex - 1 ? 'scale-105 border-claude-orange' : ''
                        }`}
                        style={{
                          animation: i === revealIndex - 1 ? 'pulse 0.5s ease-out' : 'none'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{tierData.emoji}</span>
                          <div>
                            <div className={`font-semibold ${tierData.color}`}>
                              {tierData.label}
                            </div>
                            <div className="text-text-muted text-xs">
                              Tier {result.tier} • {tierData.multiplier}x multiplier
                            </div>
                          </div>
                        </div>
                        <div className={`text-right font-bold text-lg ${tierData.color}`}>
                          +{result.payout} $CC
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading indicators for unrevealed samples */}
                  {Array.from({ length: currentResults.length - revealIndex }).map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="flex items-center justify-center bg-bg-primary border border-border rounded-lg p-4 animate-pulse"
                    >
                      <span className="text-text-muted text-sm">Excavating fragment...</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-text-secondary text-sm mb-2">
                    Ready to excavate memory fragments
                  </p>
                  <p className="text-text-muted text-xs">
                    Select your excavation mode below
                  </p>
                </div>
              )}
            </div>

            {/* Excavation Controls */}
            <div className="bg-bg-secondary border border-border rounded-lg p-6">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-4 block">
                Excavation Mode
              </label>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Single Sample */}
                <button
                  onClick={() => handleExcavate(false)}
                  disabled={experimentState !== 'idle' || balance < EXPERIMENT_CONFIG.singleStake}
                  className="bg-bg-tertiary border border-border rounded-lg p-4 hover:border-claude-orange hover:bg-bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="text-claude-orange font-bold text-lg mb-2">Single Sample</div>
                  <div className="text-text-secondary text-sm mb-3">
                    Excavate 1 fragment
                  </div>
                  <div className="text-text-primary font-semibold">
                    {EXPERIMENT_CONFIG.singleStake} $CC
                  </div>
                </button>

                {/* Batch Sample */}
                <button
                  onClick={() => handleExcavate(true)}
                  disabled={experimentState !== 'idle' || balance < EXPERIMENT_CONFIG.batchStake}
                  className="bg-bg-tertiary border border-border rounded-lg p-4 hover:border-claude-orange hover:bg-bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative"
                >
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    GUARANTEED
                  </div>
                  <div className="text-claude-orange font-bold text-lg mb-2">10-Sample Batch</div>
                  <div className="text-text-secondary text-sm mb-3">
                    At least 1 Tier 2+ guaranteed
                  </div>
                  <div className="text-text-primary font-semibold">
                    {EXPERIMENT_CONFIG.batchStake} $CC
                  </div>
                </button>
              </div>

              {/* Fee info */}
              <div className="bg-bg-primary border border-border rounded-lg p-3 text-xs">
                <div className="flex justify-between text-text-muted mb-1">
                  <span>Platform Fee</span>
                  <span>{EXPERIMENT_CONFIG.platformFeeSol} SOL</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Protocol Edge</span>
                  <span>{EXPERIMENT_CONFIG.protocolEdgePercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Stats & Info */}
          <div className="space-y-4">

            {/* Session Stats */}
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Session Statistics
              </label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Samples</span>
                  <span className="text-text-primary font-semibold">{sessionStats.totalSamples}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Returns</span>
                  <span className="text-text-primary font-semibold">{sessionStats.totalReturns} $CC</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-text-muted">Net Result</span>
                  <span className={`font-bold ${isProfit ? 'text-accent-green' : netResult < 0 ? 'text-red-400' : 'text-text-muted'}`}>
                    {isProfit ? '+' : ''}{netResult} $CC
                  </span>
                </div>
              </div>
            </div>

            {/* Guarantee Counter */}
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Tier 3+ Guarantee Tracker
              </label>
              <div className="text-center">
                <div className="text-4xl font-bold text-claude-orange mb-2">
                  {sessionStats.samplesSinceT3}
                </div>
                <div className="text-text-muted text-xs">
                  samples since last Tier 3+
                </div>
                {sessionStats.samplesSinceT3 >= 50 && (
                  <div className="mt-2 text-purple-400 text-xs font-semibold">
                    ⚡ Your luck is due!
                  </div>
                )}
              </div>
            </div>

            {/* Distribution Table */}
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Outcome Distribution
              </label>
              <div className="space-y-2">
                {OUTCOME_TIERS.map(tier => (
                  <div key={tier.tier} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{tier.emoji}</span>
                      <span className={tier.color}>{tier.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-text-muted">{(tier.probability * 100).toFixed(0)}%</div>
                      <div className={tier.color}>{tier.multiplier}x</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted">
                Expected Value: 0.9x per sample
              </div>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-bg-secondary border border-border rounded-lg p-4">
                <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                  Recent Excavations
                </label>
                <div className="space-y-1.5">
                  {history.map((result, i) => {
                    const tierData = OUTCOME_TIERS.find(t => t.tier === result.tier)!;
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span>{tierData.emoji}</span>
                          <span className={tierData.color}>{tierData.label}</span>
                        </div>
                        <span className={tierData.color}>+{result.payout} $CC</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verification Info */}
            {(commitment || secret) && (
              <ProvablyFair
                commitment={commitment || undefined}
                serverSecret={secret || undefined}
                txSignature="mock-tx-signature"
                result={currentResults[0]?.tier.toString() as any}
                className="text-xs"
              />
            )}

          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 mt-6 text-center">
          <Link href="/" className="text-claude-orange hover:underline text-sm">
            ← back
          </Link>
          <p className="text-text-muted text-xs mt-2">
            claudecode.wtf · 100% of fees to @bcherny
          </p>
        </footer>

        {/* Result Modal */}
        {currentResults.length > 0 && (
          <GameResult
            isOpen={showResultModal}
            onClose={handlePlayAgain}
            onPlayAgain={handlePlayAgain}
            result={currentResults.some(r => r.tier >= 3) ? 'win' : currentResults.some(r => r.tier >= 2) ? 'win' : 'lose'}
            betAmount={stakeAmount}
            payout={currentResults.reduce((sum, r) => sum + r.payout, 0)}
            message={
              isBatch
                ? `Excavated ${currentResults.length} fragments! Total return: ${currentResults.reduce((sum, r) => sum + r.payout, 0)} $CC`
                : `Fragment ${OUTCOME_TIERS.find(t => t.tier === currentResults[0].tier)?.label} - ${currentResults[0].payout} $CC returned`
            }
          />
        )}

      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}

export default function NeuralArchivePage() {
  return (
    <WalletProvider>
      <NeuralArchiveGame />
    </WalletProvider>
  );
}
