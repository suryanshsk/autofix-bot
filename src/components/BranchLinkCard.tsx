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
      className="bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/20 rounded-2xl shadow-xl border-2 border-primary/30 p-8"
    >
      {/* Fork Badge */}
      {forked && originalRepo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-800 text-sm font-semibold"
        >
          <GitFork className="w-4 h-4" />
          <span>Forked from <code className="font-mono font-bold">{originalRepo}</code></span>
        </motion.div>
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-5">
          {/* Branch Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-white border-2 border-primary/30">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">Branch Created</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <code className="text-base font-mono font-bold text-primary bg-white px-4 py-2 rounded-xl border-2 border-primary/30">
                {branchName}
              </code>
              <button
                onClick={copyBranchName}
                className="p-2 rounded-xl hover:bg-white/80 transition-colors border-2 border-transparent hover:border-primary/30"
                title="Copy branch name"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-primary" />
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
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-green-100 border-2 border-green-300">
                  <GitPullRequest className="w-5 h-5 text-green-700" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  Pull Request {forked && "to Original Repo"}
                </span>
              </div>
              <a
                href={pullRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-base font-bold text-green-700 hover:text-green-800 transition-colors underline underline-offset-2"
              >
                View PR #{pullRequestUrl.split('/').pop()}
                <ExternalLink className="w-4 h-4" />
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:shadow-primary/30 transition-all text-sm font-bold transform hover:scale-105"
        >
          View Branch
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      </div>
    </motion.div>
  );
};

export default BranchLinkCard;
