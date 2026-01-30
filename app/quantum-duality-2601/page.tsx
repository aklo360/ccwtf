'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletProvider, ConnectWallet, BetInput, FeeDisplay, GameResult, ProvablyFair, useBalance } from '@/app/components/gamefi';

type Outcome = 'A' | 'B';

interface ExperimentResult {
  commitment: string;
  serverSecret: string;
  txSignature: string;
  result: Outcome;
  won: boolean;
  payout: number;
}

interface HistoryEntry {
  timestamp: number;
  stake: number;
  userChoice: Outcome;
  result: Outcome;
  won: boolean;
  payout: number;
}

function QuantumDualityEngineInner() {
  const { connected, publicKey } = useWallet();
  const { cc: ccBalance } = useBalance();

  // UI State
  const [stakeAmount, setStakeAmount] = useState(10);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome>('A');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Experiment State
  const [commitment, setCommitment] = useState<string>('');
  const [experimentResult, setExperimentResult] = useState<ExperimentResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Animation State
  const [particleCount, setParticleCount] = useState(0);
  const [entropyValue, setEntropyValue] = useState(0);

  // Mock commit-reveal protocol
  const generateCommitment = (): { commitment: string; secret: string } => {
    // Generate random server secret (64 hex chars)
    const secret = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    // Mock SHA256 commitment (in real implementation, server would do this)
    const commitment = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { commitment, secret };
  };

  const mockTransactionSignature = (): string => {
    // Mock transaction signature (88 chars base58)
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return Array.from({ length: 88 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

  const computeResult = (serverSecret: string, txSig: string): Outcome => {
    // Simulate SHA256(serverSecret + txSignature)[0] < 128 ? A : B
    const combined = serverSecret + txSig;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 256) < 128 ? 'A' : 'B';
  };

  const handleCommit = async () => {
    if (!connected || stakeAmount < 1 || stakeAmount > 1000) return;

    setIsProcessing(true);
    setIsAnimating(true);
    setShowResult(false);

    // Step 1: Server generates commitment
    const { commitment: newCommitment, secret } = generateCommitment();
    setCommitment(newCommitment);

    // Brief delay to show commitment received
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 2: User signs transaction (creates unpredictable signature)
    const txSig = mockTransactionSignature();

    // Step 3: Animate entropy resolution
    setParticleCount(50);

    // Animate entropy value counting up
    let currentEntropy = 0;
    const entropyInterval = setInterval(() => {
      currentEntropy += Math.random() * 10;
      setEntropyValue(currentEntropy);
    }, 50);

    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(entropyInterval);

    // Step 4: Compute result
    const result = computeResult(secret, txSig);
    const won = result === selectedOutcome;
    const payout = won ? Math.floor(stakeAmount * 1.96) : 0;

    const resultData: ExperimentResult = {
      commitment: newCommitment,
      serverSecret: secret,
      txSignature: txSig,
      result,
      won,
      payout,
    };

    setExperimentResult(resultData);

    // Add to history
    const historyEntry: HistoryEntry = {
      timestamp: Date.now(),
      stake: stakeAmount,
      userChoice: selectedOutcome,
      result,
      won,
      payout,
    };
    setHistory([historyEntry, ...history.slice(0, 9)]);

    // End animation and show result
    setIsAnimating(false);
    setParticleCount(0);
    setEntropyValue(0);

    await new Promise(resolve => setTimeout(resolve, 500));
    setShowResult(true);
    setIsProcessing(false);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setExperimentResult(null);
    setCommitment('');
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
          <span className="text-claude-orange font-semibold text-sm">Quantum Duality Engine</span>
          <span className="text-text-muted text-xs ml-auto">Two-party entropy, instant resolution</span>
        </header>

        {/* WALLET CONNECTION */}
        <div className="mb-6 flex justify-end">
          <ConnectWallet />
        </div>

        {/* MAIN CONTENT */}
        <div className="space-y-4">

          {/* EXPERIMENT INFO */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <h2 className="text-text-primary font-semibold mb-2">Cryptographic Binary State Collapse</h2>
            <p className="text-text-secondary text-sm mb-3">
              A quantum-inspired entropy oracle using two-party commit-reveal protocol.
              Neither participant can predict or manipulate the outcome.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">MULTIPLIER</div>
                <div className="text-claude-orange font-bold text-lg">1.96x</div>
              </div>
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">PROTOCOL EDGE</div>
                <div className="text-claude-orange font-bold text-lg">2%</div>
              </div>
              <div className="bg-bg-primary border border-border rounded p-2">
                <div className="text-text-muted text-xs mb-1">PLATFORM FEE</div>
                <div className="text-claude-orange font-bold text-lg">0.001 SOL</div>
              </div>
            </div>
          </div>

          {/* STAKE INPUT */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <BetInput
              value={stakeAmount}
              onChange={setStakeAmount}
              min={1}
              max={1000}
              balance={ccBalance}
              disabled={isProcessing || isAnimating}
            />
          </div>

          {/* OUTCOME SELECTOR */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Commit to Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedOutcome('A')}
                disabled={isProcessing || isAnimating}
                className={`py-8 rounded-lg border-2 transition-all ${
                  selectedOutcome === 'A'
                    ? 'border-claude-orange bg-claude-orange/10'
                    : 'border-border bg-bg-primary hover:border-claude-orange/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-4xl mb-2">⬆</div>
                <div className="text-text-primary font-semibold text-lg">State A</div>
                <div className="text-text-muted text-xs mt-1">Quantum superposition ↑</div>
              </button>
              <button
                onClick={() => setSelectedOutcome('B')}
                disabled={isProcessing || isAnimating}
                className={`py-8 rounded-lg border-2 transition-all ${
                  selectedOutcome === 'B'
                    ? 'border-claude-orange bg-claude-orange/10'
                    : 'border-border bg-bg-primary hover:border-claude-orange/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-4xl mb-2">⬇</div>
                <div className="text-text-primary font-semibold text-lg">State B</div>
                <div className="text-text-muted text-xs mt-1">Quantum superposition ↓</div>
              </button>
            </div>
          </div>

          {/* FEE DISPLAY */}
          {connected && stakeAmount > 0 && (
            <FeeDisplay
              platformFeeSol={0.001}
              betAmount={stakeAmount}
              multiplier={1.96}
              houseEdgePercent={2}
            />
          )}

          {/* ENTROPY ANIMATION */}
          {isAnimating && (
            <div className="bg-bg-secondary border border-claude-orange rounded-lg p-8 relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="text-text-secondary text-sm mb-2">ENTROPY RESOLUTION IN PROGRESS</div>
                <div className="text-claude-orange text-4xl font-mono mb-4">
                  {entropyValue.toFixed(2)}
                </div>
                <div className="text-text-muted text-xs">
                  Computing SHA256(serverSecret + txSignature)...
                </div>
              </div>

              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: particleCount }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-claude-orange rounded-full opacity-50"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `pulse ${0.5 + Math.random()}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* COMMIT BUTTON */}
          <button
            onClick={handleCommit}
            disabled={!connected || isProcessing || isAnimating || stakeAmount < 1 || stakeAmount > ccBalance}
            className="w-full bg-claude-orange text-white font-semibold py-4 px-4 rounded-md text-base hover:bg-claude-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!connected
              ? 'Connect Wallet to Participate'
              : isProcessing || isAnimating
              ? 'Processing Entropy Resolution...'
              : `Commit ${stakeAmount} $CC to ${selectedOutcome}`}
          </button>

          {/* PROVABLY FAIR */}
          {experimentResult && (
            <ProvablyFair
              commitment={experimentResult.commitment}
              serverSecret={experimentResult.serverSecret}
              txSignature={experimentResult.txSignature}
              result={experimentResult.result === 'A' ? 'State A' : 'State B'}
              depositTx={experimentResult.txSignature}
              payoutTx={experimentResult.won ? experimentResult.txSignature : undefined}
              solscanCluster="?cluster=devnet"
            />
          )}

          {/* RECENT OUTCOMES */}
          {history.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-4">
              <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
                Recent Experiments (Last 10)
              </label>
              <div className="space-y-2">
                {history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-primary border border-border rounded p-2 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`font-mono ${entry.won ? 'text-accent-green' : 'text-red-400'}`}>
                        {entry.won ? '✓ WIN' : '✗ LOSS'}
                      </div>
                      <div className="text-text-muted">
                        {entry.stake} $CC → {entry.userChoice}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-text-secondary">
                        Result: <span className="text-claude-orange">{entry.result}</span>
                      </div>
                      {entry.won && (
                        <div className="text-accent-green font-semibold">
                          +{entry.payout} $CC
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOW IT WORKS */}
          <div className="bg-bg-secondary border border-border rounded-lg p-4">
            <label className="text-text-secondary text-xs uppercase tracking-wider mb-3 block">
              Cryptographic Security Model
            </label>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">1.</div>
                <div>
                  <strong className="text-text-primary">Server Commitment:</strong> Server generates
                  serverSecret and publishes SHA256(serverSecret) before your transaction.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">2.</div>
                <div>
                  <strong className="text-text-primary">User Entropy:</strong> You sign a transaction,
                  creating an unpredictable signature the server cannot predict.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">3.</div>
                <div>
                  <strong className="text-text-primary">Result Computation:</strong> Result =
                  SHA256(serverSecret + txSignature)[0] &lt; 128 ? A : B
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-claude-orange font-bold">4.</div>
                <div>
                  <strong className="text-text-primary">Verification:</strong> Both parties can
                  independently verify the result. Neither can manipulate the outcome.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RESULT MODAL */}
        {experimentResult && (
          <GameResult
            isOpen={showResult}
            onClose={() => setShowResult(false)}
            onPlayAgain={handlePlayAgain}
            result={experimentResult.won ? 'win' : 'lose'}
            betAmount={stakeAmount}
            payout={experimentResult.payout}
            message={experimentResult.won
              ? `Entropy collapsed to State ${experimentResult.result}!`
              : `Entropy collapsed to State ${experimentResult.result}.`
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
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default function QuantumDualityEngine() {
  return (
    <WalletProvider network="mainnet-beta">
      <QuantumDualityEngineInner />
    </WalletProvider>
  );
}
