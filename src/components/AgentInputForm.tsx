import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Loader2, Zap, Terminal } from "lucide-react";
import { formatBranchName } from "@/lib/types";

interface Props {
  onSubmit: (repoUrl: string, teamName: string, leaderName: string) => void;
  loading: boolean;
}

const AgentInputForm = ({ onSubmit, loading }: Props) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");

  const branchPreview = teamName && leaderName ? formatBranchName(teamName, leaderName) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl && teamName && leaderName) {
      onSubmit(repoUrl, teamName, leaderName);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow rounded-lg p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
          <Terminal className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Agent Configuration</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">GitHub Repository URL</label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
            className="w-full px-4 py-2.5 rounded-md bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Alpha"
              className="w-full px-4 py-2.5 rounded-md bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Leader Name</label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-md bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              required
            />
          </div>
        </div>

        {branchPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 text-xs font-mono text-primary bg-primary/5 border border-primary/10 rounded-md px-3 py-2"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="text-muted-foreground">Branch:</span>
            <span>{branchPreview}</span>
          </motion.div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !repoUrl || !teamName || !leaderName}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-primary"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Agent Running...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Run Healing Agent
          </>
        )}
      </button>
    </motion.form>
  );
};

export default AgentInputForm;
