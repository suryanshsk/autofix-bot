import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Loader2, Zap, Terminal, AlertCircle } from "lucide-react";
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
      className="bg-white rounded-2xl shadow-xl shadow-primary/10 border-2 border-secondary p-8 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <Terminal className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Agent Configuration</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">GitHub Repository URL</label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/YOUR-USERNAME/your-repo"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-border text-foreground placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            required
          />
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex items-start gap-2 text-sm text-primary bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Automatic Forking:</span> Don't have write access? No problem! 
              We'll automatically fork the repo and create a PR back to the original.
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Alpha"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Leader Name</label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
          </div>
        </div>

        {branchPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 text-sm font-mono text-primary bg-gradient-to-r from-secondary/50 to-accent/30 border border-primary/20 rounded-xl px-4 py-3"
          >
            <GitBranch className="w-4 h-4" />
            <span className="text-foreground font-semibold">Branch:</span>
            <span className="font-semibold">{branchPreview}</span>
          </motion.div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !repoUrl || !teamName || !leaderName}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Agent Running...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Run Healing Agent
          </>
        )}
      </button>
    </motion.form>
  );
};

export default AgentInputForm;
