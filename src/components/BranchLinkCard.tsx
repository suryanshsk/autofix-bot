import { motion } from "framer-motion";
import { GitBranch, GitPullRequest, ExternalLink, Copy, Check, GitFork } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  branchName: string;
  repoUrl: string;
  pullRequestUrl?: string | null;
  forked?: boolean;
  originalRepo?: string | null;
}

const BranchLinkCard = ({ branchName, repoUrl, pullRequestUrl, forked, originalRepo }: Props) => {
  const [copied, setCopied] = useState(false);

  const branchUrl = `${repoUrl}/tree/${branchName}`;
  
  const copyBranchName = () => {
    navigator.clipboard.writeText(branchName);
    setCopied(true);
    toast.success("Branch name copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-glow rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
    >
      {/* Fork Badge */}
      {forked && originalRepo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Forked from <code className="font-mono">{originalRepo}</code></span>
        </motion.div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Branch Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                <GitBranch className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Branch Created</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded border border-primary/20">
                {branchName}
              </code>
              <button
                onClick={copyBranchName}
                className="p-1.5 rounded hover:bg-primary/10 transition-colors"
                title="Copy branch name"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Pull Request Section */}
          {pullRequestUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-success/10 border border-success/20">
                  <GitPullRequest className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Pull Request {forked && "to Original Repo"}
                </span>
              </div>
              <a
                href={pullRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-success hover:text-success/80 transition-colors underline underline-offset-2"
              >
                View PR #{pullRequestUrl.split('/').pop()}
                <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          )}
        </div>

        {/* View Branch Button */}
        <motion.a
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          href={branchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium glow-primary"
        >
          View Branch
          <ExternalLink className="w-3.5 h-3.5" />
        </motion.a>
      </div>
    </motion.div>
  );
};

export default BranchLinkCard;
