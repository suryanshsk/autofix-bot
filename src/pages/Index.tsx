import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Cpu, ExternalLink, Sparkles } from "lucide-react";
import AgentInputForm from "@/components/AgentInputForm";
import RunSummaryCard from "@/components/RunSummaryCard";
import ScorePanel from "@/components/ScorePanel";
import FixesTable from "@/components/FixesTable";
import CITimeline from "@/components/CITimeline";
import LiveProgressStream from "@/components/LiveProgressStream";
import BranchLinkCard from "@/components/BranchLinkCard";
import CodeDiffViewer from "@/components/CodeDiffViewer";
import { formatBranchName, type AgentResult } from "@/lib/types";
import { triggerAgent, pollForResults, type WorkflowStatus } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [progressSteps, setProgressSteps] = useState<Array<{
    id: string;
    label: string;
    status: "pending" | "running" | "completed" | "error";
    details?: string;
  }>>([]);

  const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
    setLoading(true);
    setResult(null);
    setStatusMessage("Triggering GitHub Actions workflow...");
    setGithubUrl("");
    
    // Initialize progress steps
    setProgressSteps([
      { id: "trigger", label: "Triggering GitHub Actions", status: "running", details: "Starting workflow..." },
      { id: "clone", label: "Cloning Repository", status: "pending" },
      { id: "test", label: "Running Tests", status: "pending" },
      { id: "classify", label: "Classifying Errors with AI", status: "pending" },
      { id: "fix", label: "Generating Fixes", status: "pending" },
      { id: "push", label: "Pushing to Branch", status: "pending" },
      { id: "pr", label: "Creating Pull Request", status: "pending" },
    ]);

    try {
      // Step 1: Trigger the workflow
      toast.info("Starting agent...");
      const response = await triggerAgent({ repoUrl, teamName, leaderName });
      
      setGithubUrl(response.githubUrl);
      setStatusMessage("Workflow started! Running agent...");
      
      setProgressSteps(prev => prev.map(step => 
        step.id === "trigger" ? { ...step, status: "completed" as const, details: "Workflow triggered" } :
        step.id === "clone" ? { ...step, status: "running" as const, details: "Cloning repository..." } :
        step
      ));
      
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
            
            // Simulate progress through steps
            setProgressSteps(prev => {
              const runningIndex = prev.findIndex(s => s.status === "running");
              if (runningIndex >= 0 && runningIndex < prev.length - 1) {
                return prev.map((step, i) => 
                  i === runningIndex ? { ...step, status: "completed" as const } :
                  i === runningIndex + 1 ? { ...step, status: "running" as const } :
                  step
                );
              }
              return prev;
            });
          } else if (status.status === 'completed') {
            setStatusMessage("Workflow completed! Fetching results...");
            setProgressSteps(prev => prev.map(step => ({ ...step, status: "completed" as const })));
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
      setProgressSteps(prev => prev.map(step => 
        step.status === "running" ? { ...step, status: "error" as const, details: error.message } : step
      ));
      
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

        {/* Loading Animation with Progress */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* GitHub Link */}
              {githubUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline card-glow px-5 py-3 rounded-lg font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Live Logs on GitHub Actions
                  </a>
                </motion.div>
              )}

              {/* Progress Stream */}
              <div className="max-w-2xl mx-auto">
                <LiveProgressStream steps={progressSteps} />
              </div>

              {/* Pulsing AI Icon */}
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <Sparkles className="w-12 h-12 text-primary animate-pulse" />
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
              {/* Branch Link Card (prominent) */}
              <BranchLinkCard 
                branchName={result.branchName}
                repoUrl={result.repoUrl}
                pullRequestUrl={result.pullRequestUrl}
                forked={result.forked}
                originalRepo={result.originalRepo}
              />

              {/* Top row: Summary + Score */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RunSummaryCard result={result} />
                </div>
                <ScorePanel result={result} />
              </div>

              {/* Code Diffs Section */}
              {result.fixes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">AI-Generated Fixes</h2>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {result.fixes.length} fixes
                    </span>
                  </div>
                  <div className="space-y-4">
                    {result.fixes.map((fix, index) => (
                      <CodeDiffViewer
                        key={index}
                        file={fix.file}
                        bugType={fix.bugType}
                        line={fix.line}
                        errorMessage={fix.errorMessage}
                        beforeCode={fix.beforeCode}
                        afterCode={fix.afterCode}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

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
