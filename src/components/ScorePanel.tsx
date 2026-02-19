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
      className="bg-white rounded-2xl shadow-lg border-2 border-secondary p-6 hover:shadow-xl transition-shadow"
    >
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-primary" />
        Score
      </h2>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="url(#gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {score.final}
            </motion.span>
            <span className="text-sm text-muted-foreground font-medium">points</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-base">
        <div className="flex items-center justify-between py-2 border-b border-border/40">
          <span className="text-muted-foreground font-medium">Base</span>
          <span className="font-bold text-foreground">{score.base}</span>
        </div>
        {score.timeBonus > 0 && (
          <div className="flex items-center justify-between text-green-600 py-2 border-b border-border/40">
            <span className="flex items-center gap-2 font-medium"><Timer className="w-4 h-4" /> Speed Bonus</span>
            <span className="font-bold">+{score.timeBonus}</span>
          </div>
        )}
        {score.commitPenalty > 0 && (
          <div className="flex items-center justify-between text-red-600 py-2">
            <span className="flex items-center gap-2 font-medium"><TrendingDown className="w-4 h-4" /> Commit Penalty</span>
            <span className="font-bold">-{score.commitPenalty}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScorePanel;
