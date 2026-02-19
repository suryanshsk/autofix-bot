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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">AUTONOMOUS AGENT v1.0</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-foreground">CI/CD </span>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Healing Agent
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI-powered autonomous agent that detects, classifies, and fixes test failures — then pushes clean code to GitHub automatically.
          </p>
        </motion.div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <AgentInputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Loading Animation with Progress */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
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
                    className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all px-6 py-3 rounded-full font-semibold"
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
                  <Sparkles className="w-14 h-14 text-primary animate-pulse drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </div>
                <div className="text-base text-foreground font-medium text-center max-w-md">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
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
              className="space-y-8"
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
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">AI-Generated Fixes</h2>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary text-sm font-semibold">
                      {result.fixes.length} fixes
                    </span>
                  </div>
                  <div className="space-y-6">
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
