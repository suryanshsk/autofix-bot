import { motion } from "framer-motion";
import { GitBranch, Bug, Wrench, Clock, CheckCircle2, XCircle, Globe, GitPullRequest } from "lucide-react";
import type { AgentResult } from "@/lib/types";

const RunSummaryCard = ({ result }: { result: AgentResult }) => {
  const passed = result.finalCIStatus === "PASSED";

  const items = [
    { icon: Globe, label: "Repository", value: result.repoUrl.replace("https://github.com/", ""), mono: true },
    { icon: GitBranch, label: "Branch", value: result.branchName, mono: true },
    ...(result.pullRequestUrl ? [{ icon: GitPullRequest, label: "Pull Request", value: result.pullRequestUrl, link: true }] : []),
    { icon: Bug, label: "Failures Found", value: result.totalFailures },
    { icon: Wrench, label: "Fixes Applied", value: result.totalFixes },
    { icon: Clock, label: "Time Taken", value: result.totalTimeTaken },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-glow rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">Run Summary</h2>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${passed ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {result.finalCIStatus}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <item.icon className="w-4 h-4" />
              {item.label}
            </span>
            {item.link ? (
              <a 
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-mono text-xs underline underline-offset-2 transition-colors"
              >
                #{item.value.split('/').pop()}
              </a>
            ) : (
              <span className={`text-foreground ${item.mono ? "font-mono text-xs" : "font-semibold"}`}>
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RunSummaryCard;
