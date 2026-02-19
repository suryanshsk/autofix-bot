import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Timer } from "lucide-react";
import type { AgentResult } from "@/lib/types";

const ScorePanel = ({ result }: { result: AgentResult }) => {
  const { score } = result;
  const percentage = Math.min(Math.max(score.final / 120, 0), 1);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-glow rounded-lg p-6"
    >
      <h2 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-warning" />
        Score
      </h2>

      <div className="flex items-center justify-center mb-5">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {score.final}
            </motion.span>
            <span className="text-xs text-muted-foreground">points</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Base</span>
          <span className="font-mono text-foreground">{score.base}</span>
        </div>
        {score.timeBonus > 0 && (
          <div className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" /> Speed Bonus</span>
            <span className="font-mono">+{score.timeBonus}</span>
          </div>
        )}
        {score.commitPenalty > 0 && (
          <div className="flex items-center justify-between text-destructive">
            <span className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5" /> Commit Penalty</span>
            <span className="font-mono">-{score.commitPenalty}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScorePanel;
