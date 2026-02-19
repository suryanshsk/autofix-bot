import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Cpu } from "lucide-react";
import AgentInputForm from "@/components/AgentInputForm";
import RunSummaryCard from "@/components/RunSummaryCard";
import ScorePanel from "@/components/ScorePanel";
import FixesTable from "@/components/FixesTable";
import CITimeline from "@/components/CITimeline";
import { MOCK_RESULT, formatBranchName, type AgentResult } from "@/lib/types";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);

  const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
    setLoading(true);
    setResult(null);

    // Simulate agent run - replace with POST /run-agent
    await new Promise((r) => setTimeout(r, 3000));

    setResult({
      ...MOCK_RESULT,
      repoUrl,
      teamName: teamName.toUpperCase().replace(/\s+/g, "_"),
      leaderName: leaderName.toUpperCase().replace(/\s+/g, "_"),
      branchName: formatBranchName(teamName, leaderName),
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
            AUTONOMOUS AGENT v1.0
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            CI/CD <span className="text-gradient">Healing Agent</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            AI-powered autonomous agent that detects, classifies, and fixes test failures — then pushes clean code to GitHub.
          </p>
        </motion.div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-10">
          <AgentInputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <div className="relative">
                <Cpu className="w-12 h-12 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full glow-primary animate-ping opacity-30" />
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Cloning → Testing → Classifying → Fixing → Pushing...
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Top row: Summary + Score */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RunSummaryCard result={result} />
                </div>
                <ScorePanel result={result} />
              </div>

              {/* Fixes Table */}
              <FixesTable result={result} />

              {/* CI Timeline */}
              <CITimeline result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
