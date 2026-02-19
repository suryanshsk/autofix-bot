import { motion } from "framer-motion";
import { FileCode2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { AgentResult, BugType, FixStatus } from "@/lib/types";

const bugTypeColors: Record<BugType, string> = {
  LINTING: "bg-accent/10 text-accent border-accent/20",
  SYNTAX: "bg-warning/10 text-warning border-warning/20",
  LOGIC: "bg-destructive/10 text-destructive border-destructive/20",
  TYPE_ERROR: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  IMPORT: "bg-primary/10 text-primary border-primary/20",
  INDENTATION: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
};

const statusIcon: Record<FixStatus, JSX.Element> = {
  FIXED: <CheckCircle2 className="w-4 h-4 text-success" />,
  FAILED: <XCircle className="w-4 h-4 text-destructive" />,
  PENDING: <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />,
};

const FixesTable = ({ result }: { result: AgentResult }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="card-glow rounded-lg p-6"
  >
    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
      <FileCode2 className="w-5 h-5 text-accent" />
      Fixes Applied
    </h2>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-left">
            <th className="pb-3 font-medium">File</th>
            <th className="pb-3 font-medium">Bug Type</th>
            <th className="pb-3 font-medium">Line</th>
            <th className="pb-3 font-medium hidden md:table-cell">Commit Message</th>
            <th className="pb-3 font-medium text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {result.fixes.map((fix, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td className="py-3 font-mono text-xs text-foreground">{fix.file}</td>
              <td className="py-3">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${bugTypeColors[fix.bugType]}`}>
                  {fix.bugType}
                </span>
              </td>
              <td className="py-3 font-mono text-xs text-muted-foreground">{fix.line}</td>
              <td className="py-3 font-mono text-xs text-muted-foreground hidden md:table-cell truncate max-w-[280px]">{fix.commitMessage}</td>
              <td className="py-3 text-center">{statusIcon[fix.status]}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default FixesTable;
