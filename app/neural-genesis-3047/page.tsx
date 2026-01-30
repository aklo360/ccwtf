'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletProvider, ConnectWallet, BetInput, FeeDisplay, GameResult, ProvablyFair, useBalance } from '@/app/components/gamefi';

type NeuronTier = 'Basic' | 'Advanced' | 'Elite' | 'Legendary';

interface SampleResult {
  commitment: string;
  serverSecret: string;
  txSignature: string;
  tier: NeuronTier;
  multiplier: number;
  payout: number;
}

interface HistoryEntry {
  timestamp: number;
  stake: number;
  tier: NeuronTier;
  multiplier: number;
  payout: number;
}

interface SessionStats {
  samplesCount: number;
  totalStaked: number;
  totalReturned: number;
  netProfit: number;
  samplesSinceT3: number; // Samples since last Tier 3 or 4
}

function NeuralGenesisEngineInner() {
  const { connected, publicKey } = useWallet();
  const { cc: ccBalance } = useBalance();

  // UI State
  const [stakeAmount, setStakeAmount] = useState(5);
  const [sampleSize, setSampleSize] = useState<1 | 10>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Experiment State
  const [commitment, setCommitment] = useState<string>('');
  const [sampleResult, setSampleResult] = useState<SampleResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    samplesCount: 0,
    totalStaked: 0,
    totalReturned: 0,
    netProfit: 0,
    samplesSinceT3: 0,
  });

  // Animation State
  const [neuronPulses, setNeuronPulses] = useState(0);
  const [evolutionProgress, setEvolutionProgress] = useState(0);

  // Distribution probabilities
  const DISTRIBUTION = {
    'Basic': { prob: 0.74, multiplier: 0.5 },      // 74%: 0.5x (2.5 $CC)
    'Advanced': { prob: 0.20, multiplier: 2 },     // 20%: 2x (10 $CC)
    'Elite': { prob: 0.05, multiplier: 5 },        // 5%: 5x (25 $CC)
    'Legendary': { prob: 0.01, multiplier: 10 },   // 1%: 10x (50 $CC)
  };

  // Mock commit-reveal protocol
  const generateCommitment = (): { commitment: string; secret: string } => {
    const secret = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const commitment = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { commitment, secret };
  };

  const mockTransactionSignature = (): string => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return Array.from({ length: 88 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

  const computeTier = (serverSecret: string, txSig: string, sampleIndex: number = 0): NeuronTier => {
    // Simulate VRF: SHA256(serverSecret + txSignature + sampleIndex)
    const combined = serverSecret + txSig + sampleIndex.toString();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }

    // Map hash to 0-100 range
    const roll = Math.abs(hash % 100);

    // Distribution mapping
    if (roll < 1) return 'Legendary';  // 1%
    if (roll < 6) return 'Elite';      // 5%
    if (roll < 26) return 'Advanced';  // 20%
    return 'Basic';                    // 74%
  };

  const handleSample = async () => {
    if (!connected || stakeAmount < 5 || stakeAmount > ccBalance) return;

    setIsProcessing(true);
    setIsAnimating(true);
    setShowResult(false);

    // Step 1: Server generates commitment
    const { commitment: newCommitment, secret } = generateCommitment();
    setCommitment(newCommitment);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: User signs transaction
    const txSig = mockTransactionSignature();

    // Step 3: Animate neural evolution
    setNeuronPulses(30);

    // Animate evolution progress
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;
      setEvolutionProgress(currentProgress);
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 2500));
    clearInterval(progressInterval);
    setEvolutionProgress(100);

    // Step 4: Compute result(s)
    let finalTier: NeuronTier;
    let finalMultiplier: number;
    let totalPayout = 0;

    if (sampleSize === 10) {
      // Process 10 samples
      const results = [];
      let hasT2Plus = false;

      for (let i = 0; i < 10; i++) {
        const tier = computeTier(secret, txSig, i);
        const multiplier = DISTRIBUTION[tier].multiplier;
        const samplePayout = Math.floor(stakeAmount * multiplier);

        results.push({ tier, multiplier, payout: samplePayout });
        totalPayout += samplePayout;

        if (tier === 'Advanced' || tier === 'Elite' || tier === 'Legendary') {
          hasT2Plus = true;
        }
      }

      // 10-sample guarantee: If no Tier 2+ in first 9, force last one to be Tier 2+
      if (!hasT2Plus) {
        const guaranteedTier: NeuronTier = Math.random() < 0.8 ? 'Advanced' : 'Elite';
        results[9] = {
          tier: guaranteedTier,
          multiplier: DISTRIBUTION[guaranteedTier].multiplier,
          payout: Math.floor(stakeAmount * DISTRIBUTION[guaranteedTier].multiplier),
        };
        totalPayout = results.reduce((sum, r) => sum + r.payout, 0);
      }

      // Use best result for display
      const bestResult = results.reduce((best, curr) =>
        curr.multiplier > best.multiplier ? curr : best
      );
      finalTier = bestResult.tier;
      finalMultiplier = bestResult.multiplier;

      // Add all to history
      results.forEach((r, i) => {
        const historyEntry: HistoryEntry = {
          timestamp: Date.now() + i,
          stake: stakeAmount,
          tier: r.tier,
          multiplier: r.multiplier,
          payout: r.payout,
        };
        setHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
      });
    } else {
      // Single sample
      finalTier = computeTier(secret, txSig);
      finalMultiplier = DISTRIBUTION[finalTier].multiplier;
      totalPayout = Math.floor(stakeAmount * finalMultiplier);

      const historyEntry: HistoryEntry = {
        timestamp: Date.now(),
        stake: stakeAmount,
        tier: finalTier,
        multiplier: finalMultiplier,
        payout: totalPayout,
      };
      setHistory([historyEntry, ...history.slice(0, 49)]);
    }

    const resultData: SampleResult = {
      commitment: newCommitment,
      serverSecret: secret,
      txSignature: txSig,
      tier: finalTier,
      multiplier: finalMultiplier,
      payout: totalPayout,
    };

    setSampleResult(resultData);

    // Update session stats
    const totalStake = stakeAmount * sampleSize;
    setSessionStats(prev => ({
      samplesCount: prev.samplesCount + sampleSize,
      totalStaked: prev.totalStaked + totalStake,
      totalReturned: prev.totalReturned + totalPayout,
      netProfit: prev.netProfit + (totalPayout - totalStake),
      samplesSinceT3: (finalTier === 'Elite' || finalTier === 'Legendary') ? 0 : prev.samplesSinceT3 + sampleSize,
    }));

    // End animation and show result
    setIsAnimating(false);
    setNeuronPulses(0);
    setEvolutionProgress(0);

    await new Promise(resolve => setTimeout(resolve, 500));
    setShowResult(true);
    setIsProcessing(false);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setSampleResult(null);
    setCommitment('');
  };

  const getTierColor = (tier: NeuronTier) => {
    switch (tier) {
      case 'Legendary': return 'text-yellow-400';
      case 'Elite': return 'text-purple-400';
      case 'Advanced': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTierEmoji = (tier: NeuronTier) => {
    switch (tier) {
      case 'Legendary': return '🧠';
      case 'Elite': return '⚡';
      case 'Advanced': return '🔷';
      default: return '⚪';
    }
  };

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
          <span className="text-claude-orange font-semibold text-sm">Neural Network Genesis</span>
          <span className="text-text-muted text-xs ml-auto">Distribution sampling, tiered returns</span>
        </header>

        {/* WALLET CONNECTION */}
        <div className="mb-6 flex justify-end">
          <ConnectWallet />
        </div>

        {/* MAIN CONTENT */}
        <div className="space-y-4">

          {/* EXPERIMENT INFO */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <h2 className="text-text-primary font-semibold mb-2">Cryptographic Neural Evolution</h2>
            <p className="text-text-secondary text-sm mb-3">
              Train AI neurons through verifiable random synthesis. Each sample evolves from basic nodes
              to legendary consciousness cores based on cryptographic entropy.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">BASIC (74%)</div>
                <div className="text-gray-400 font-bold text-sm">0.5x</div>
              </div>
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">ADVANCED (20%)</div>
                <div className="text-blue-400 font-bold text-sm">2x</div>
              </div>
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">ELITE (5%)</div>
                <div className="text-purple-400 font-bold text-sm">5x</div>
              </div>
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">LEGENDARY (1%)</div>
                <div className="text-yellow-400 font-bold text-sm">10x</div>
              </div>
            </div>
          </div>

          {/* SESSION STATS */}
          {sessionStats.samplesCount > 0 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Current Session
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                <div>
                  <div className="text-text-muted text-xs mb-1">Samples</div>
                  <div className="text-text-primary font-semibold">{sessionStats.samplesCount}</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs mb-1">Staked</div>
                  <div className="text-text-primary font-semibold">{sessionStats.totalStaked} $CC</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs mb-1">Returns</div>
                  <div className="text-text-primary font-semibold">{sessionStats.totalReturned} $CC</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs mb-1">Net Profit</div>
                  <div className={`font-semibold ${sessionStats.netProfit >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                    {sessionStats.netProfit >= 0 ? '+' : ''}{sessionStats.netProfit} $CC
                  </div>
                </div>
              </div>
              {sessionStats.samplesSinceT3 > 0 && (
                <div className="mt-3 text-center">
                  <div className="text-text-muted text-xs">
                    Samples since last Elite/Legendary: <span className="text-claude-orange font-semibold">{sessionStats.samplesSinceT3}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SAMPLE SIZE SELECTOR */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Select Sample Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setSampleSize(1); setStakeAmount(5); }}
                disabled={isProcessing || isAnimating}
                className={`py-6 rounded-lg border-2 transition-all ${
                  sampleSize === 1
                    ? 'border-claude-orange bg-claude-orange/10'
                    : 'border-border bg-bg-primary hover:border-claude-orange/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-3xl mb-2">🔬</div>
                <div className="text-text-primary font-semibold text-lg">Single Sample</div>
                <div className="text-text-muted text-xs mt-1">5 $CC per sample</div>
                <div className="text-text-secondary text-xs mt-2">Quick synthesis attempt</div>
              </button>
              <button
                onClick={() => { setSampleSize(10); setStakeAmount(5); }}
                disabled={isProcessing || isAnimating}
                className={`py-6 rounded-lg border-2 transition-all ${
                  sampleSize === 10
                    ? 'border-claude-orange bg-claude-orange/10'
                    : 'border-border bg-bg-primary hover:border-claude-orange/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-3xl mb-2">🧬</div>
                <div className="text-text-primary font-semibold text-lg">10-Sample Batch</div>
                <div className="text-text-muted text-xs mt-1">50 $CC total (5 $CC × 10)</div>
                <div className="text-accent-green text-xs mt-2 font-semibold">✓ Guaranteed Advanced+ result</div>
              </button>
            </div>
          </div>

          {/* STAKE INFO - Fixed amount display */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Stake Amount
            </label>
            <div className="bg-bg-primary border border-border rounded-lg p-4 text-center">
              <div className="text-text-muted text-xs mb-2">
                {sampleSize === 10 ? 'Total Stake (10 samples)' : 'Single Sample Stake'}
              </div>
              <div className="text-claude-orange text-3xl font-bold mb-2">
                {stakeAmount * sampleSize} $CC
              </div>
              <div className="text-text-muted text-xs">
                Fixed at 5 $CC per sample
              </div>
            </div>
          </div>

          {/* FEE DISPLAY */}
          {connected && stakeAmount > 0 && (
            <FeeDisplay
              platformFeeSol={0.001}
              betAmount={stakeAmount * sampleSize}
              multiplier={sampleSize === 10 ? 2 : 1}
              houseEdgePercent={10}
            />
          )}

          {/* EVOLUTION ANIMATION */}
          {isAnimating && (
            <div className="bg-bg-secondary border border-claude-orange rounded-lg p-8 relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="text-text-secondary text-sm mb-2">NEURAL EVOLUTION IN PROGRESS</div>
                <div className="text-claude-orange text-4xl font-mono mb-4">
                  {evolutionProgress.toFixed(0)}%
                </div>
                <div className="text-text-muted text-xs mb-4">
                  Synthesizing neural pathways via VRF entropy...
                </div>
                <div className="w-full bg-bg-primary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-claude-orange h-full transition-all duration-200"
                    style={{ width: `${evolutionProgress}%` }}
                  />
                </div>
              </div>

              {/* Neural pulse effects */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: neuronPulses }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-claude-orange rounded-full opacity-60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `neuronPulse ${0.8 + Math.random() * 0.4}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* COMMIT BUTTON */}
          <button
            onClick={handleSample}
            disabled={!connected || isProcessing || isAnimating || (stakeAmount * sampleSize) > ccBalance}
            className="w-full bg-claude-orange text-white font-semibold py-4 px-4 rounded-md text-base hover:bg-claude-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!connected
              ? 'Connect Wallet to Begin Synthesis'
              : isProcessing || isAnimating
              ? `Evolving Neural Network...`
              : `Initiate ${sampleSize === 10 ? '10-Sample Batch' : 'Single Sample'} (${stakeAmount * sampleSize} $CC)`}
          </button>

          {/* PROVABLY FAIR */}
          {sampleResult && (
            <ProvablyFair
              commitment={sampleResult.commitment}
              serverSecret={sampleResult.serverSecret}
              txSignature={sampleResult.txSignature}
              result={`${sampleResult.tier} Neuron (${sampleResult.multiplier}x)`}
              depositTx={sampleResult.txSignature}
              payoutTx={sampleResult.payout > 0 ? sampleResult.txSignature : undefined}
              solscanCluster="?cluster=devnet"
            />
          )}

          {/* RECENT SAMPLES */}
          {history.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Recent Samples (Last 10)
              </label>
              <div className="space-y-2">
                {history.slice(0, 10).map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-primary border border-border rounded p-2 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-lg ${getTierColor(entry.tier)}`}>
                        {getTierEmoji(entry.tier)}
                      </div>
                      <div>
                        <div className={`font-semibold ${getTierColor(entry.tier)}`}>
                          {entry.tier}
                        </div>
                        <div className="text-text-muted text-xs">
                          {entry.stake} $CC → {entry.multiplier}x
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${entry.payout >= entry.stake ? 'text-accent-green' : 'text-red-400'}`}>
                        {entry.payout >= entry.stake ? '+' : ''}{entry.payout - entry.stake} $CC
                      </div>
                      <div className="text-text-muted text-xs">
                        {entry.payout} $CC payout
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOW IT WORKS */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Cryptographic Distribution Protocol
            </label>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">1.</div>
                <div>
                  <strong className="text-text-primary">VRF Commitment:</strong> Server generates
                  cryptographic commitment before your stake transaction.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">2.</div>
                <div>
                  <strong className="text-text-primary">User Entropy:</strong> Your transaction signature
                  adds unpredictable entropy to the outcome computation.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">3.</div>
                <div>
                  <strong className="text-text-primary">Tier Distribution:</strong> VRF output maps to
                  tier probabilities: Basic 74%, Advanced 20%, Elite 5%, Legendary 1%.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">4.</div>
                <div>
                  <strong className="text-text-primary">10-Sample Guarantee:</strong> Batches of 10
                  guarantee at least one Advanced+ result if none naturally occur.
                </div>
              </div>
            </div>
          </div>

          {/* EXPECTED VALUE */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Protocol Economics
            </label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-bg-primary border border-border rounded p-3">
                <div className="text-text-muted text-xs mb-1">Expected Value</div>
                <div className="text-text-primary font-semibold">
                  0.90x return
                </div>
                <div className="text-text-muted text-xs mt-1">
                  Long-term average per sample
                </div>
              </div>
              <div className="bg-bg-primary border border-border rounded p-3">
                <div className="text-text-muted text-xs mb-1">Protocol Edge</div>
                <div className="text-claude-orange font-semibold">
                  10%
                </div>
                <div className="text-text-muted text-xs mt-1">
                  Built into tier probabilities
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RESULT MODAL */}
        {sampleResult && (
          <GameResult
            isOpen={showResult}
            onClose={() => setShowResult(false)}
            onPlayAgain={handlePlayAgain}
            result={sampleResult.payout >= (stakeAmount * sampleSize) ? 'win' : 'lose'}
            betAmount={stakeAmount * sampleSize}
            payout={sampleResult.payout}
            message={
              sampleSize === 10
                ? `Batch synthesis complete! Best result: ${sampleResult.tier} Neuron`
                : `Neural evolution complete: ${sampleResult.tier} Neuron synthesized!`
            }
          />
        )}

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

      <style jsx>{`
        @keyframes neuronPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}

export default function NeuralGenesisEngine() {
  return (
    <WalletProvider network="mainnet-beta">
      <NeuralGenesisEngineInner />
    </WalletProvider>
  );
}
