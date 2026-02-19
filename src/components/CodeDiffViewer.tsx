import { motion } from "framer-motion";
import { Code2, AlertTriangle, Check } from "lucide-react";
import type { BugType } from "@/lib/types";

interface Props {
  file: string;
  bugType: BugType;
  line: number;
  errorMessage?: string;
  beforeCode?: string;
  afterCode?: string;
}

const bugTypeColors: Record<BugType, { bg: string; text: string; border: string }> = {
  LINTING: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  SYNTAX: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
  LOGIC: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  TYPE_ERROR: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  IMPORT: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  INDENTATION: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
};

const CodeDiffViewer = ({ file, bugType, line, errorMessage, beforeCode, afterCode }: Props) => {
  const colors = bugTypeColors[bugType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow rounded-lg overflow-hidden border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono text-foreground">{file}</span>
          <span className="text-xs text-muted-foreground">Line {line}</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
          {bugType}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="px-4 py-3 bg-destructive/5 border-b border-destructive/10 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-xs text-destructive font-mono">{errorMessage}</div>
        </div>
      )}

      {/* Code Diff */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Before */}
        <div className="bg-destructive/5">
          <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-xs font-medium text-destructive">Before</span>
          </div>
          <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
            <code>{beforeCode || "// Code before fix"}</code>
          </pre>
        </div>

        {/* After */}
        <div className="bg-success/5">
          <div className="px-3 py-1.5 bg-success/10 border-b border-success/20 flex items-center gap-1.5">
            <Check className="w-3 h-3 text-success" />
            <span className="text-xs font-medium text-success">After</span>
          </div>
          <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
            <code>{afterCode || "// Fixed code"}</code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
};

export default CodeDiffViewer;
