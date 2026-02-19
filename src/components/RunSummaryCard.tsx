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
      className="bg-white rounded-2xl shadow-lg border-2 border-secondary p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Run Summary</h2>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${passed ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-2 border-green-300" : "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-2 border-red-300"}`}>
          {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {result.finalCIStatus}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
            <span className="flex items-center gap-3 text-muted-foreground font-medium">
              <item.icon className="w-5 h-5 text-primary" />
              {item.label}
            </span>
            {item.link ? (
              <a 
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-accent font-mono text-xs underline underline-offset-2 transition-colors font-semibold"
              >
                #{item.value.split('/').pop()}
              </a>
            ) : (
              <span className={`text-foreground ${item.mono ? "font-mono text-sm" : "font-bold"}`}>
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
