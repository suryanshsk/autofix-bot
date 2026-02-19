import { motion } from "framer-motion";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import type { AgentResult } from "@/lib/types";

const CITimeline = ({ result }: { result: AgentResult }) => {
  const maxRetries = 2; // Updated to match orchestrator MAX_RETRIES
  const used = result.ciTimeline.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-glow rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          CI/CD Timeline
        </h2>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
          {used}/{maxRetries} retries
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {result.ciTimeline.map((iter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-4 relative"
            >
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                iter.passed 
                  ? "border-success bg-success/10" 
                  : "border-destructive bg-destructive/10"
              }`}>
                {iter.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Iteration {iter.iteration}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    iter.passed 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {iter.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {new Date(iter.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Unused retries */}
        {Array.from({ length: maxRetries - used }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-start gap-4 relative mt-4 opacity-20">
            <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 border-border bg-muted">
              <span className="text-xs text-muted-foreground">{used + i + 1}</span>
            </div>
            <div className="flex-1 pt-1.5">
              <span className="text-xs text-muted-foreground">Unused</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CITimeline;
