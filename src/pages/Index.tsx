import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Cpu, ExternalLink } from "lucide-react";
import AgentInputForm from "@/components/AgentInputForm";
import RunSummaryCard from "@/components/RunSummaryCard";
import ScorePanel from "@/components/ScorePanel";
import FixesTable from "@/components/FixesTable";
import CITimeline from "@/components/CITimeline";
import { formatBranchName, type AgentResult } from "@/lib/types";
import { triggerAgent, pollForResults, type WorkflowStatus } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [githubUrl, setGithubUrl] = useState<string>("");

  const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
    setLoading(true);
    setResult(null);
    setStatusMessage("Triggering GitHub Actions workflow...");
    setGithubUrl("");

    try {
      // Step 1: Trigger the workflow
      toast.info("Starting agent...");
      const response = await triggerAgent({ repoUrl, teamName, leaderName });
      
      setGithubUrl(response.githubUrl);
      setStatusMessage("Workflow started! Running agent...");
      
      toast.success("GitHub Actions workflow triggered!", {
        description: "This may take a few minutes. View live logs on GitHub."
      });

      // Step 2: Poll for results
      const results = await pollForResults(
        response.runId,
        (status: WorkflowStatus) => {
          // Update status message based on workflow state
          if (status.status === 'queued') {
            setStatusMessage("Workflow queued, waiting to start...");
          } else if (status.status === 'in_progress') {
            setStatusMessage("Agent running: Cloning → Testing → Fixing → Pushing...");
          } else if (status.status === 'completed') {
            setStatusMessage("Workflow completed! Fetching results...");
          }
        },
        60 // Max 5 minutes
      );

      // Step 3: Display results
      setResult(results);
      setLoading(false);
      
      toast.success(`Success! Fixed ${results.totalFixes} issues in ${results.totalTimeTaken}`);

    } catch (error: any) {
      console.error('Agent execution failed:', error);
      setLoading(false);
      
      toast.error("Agent failed", {
        description: error.message || "Failed to run agent. Check console for details."
      });
    }
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
              <div className="text-sm text-muted-foreground font-mono text-center max-w-md">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {statusMessage}
                </motion.span>
              </div>
              {githubUrl && (
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline card-glow px-4 py-2 rounded-md"
                >
                  <ExternalLink className="w-3 h-3" />
                  View live logs on GitHub Actions
                </motion.a>
              )}
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
