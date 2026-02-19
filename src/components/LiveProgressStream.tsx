import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle, GitBranch, Upload, Sparkles, Terminal } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "error";
  details?: string;
}

interface Props {
  steps: ProgressStep[];
  currentStep?: string;
}

const LiveProgressStream = ({ steps, currentStep }: Props) => {
  const getIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-success" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-muted" />;
    }
  };

  const getStepIcon = (id: string) => {
    switch (id) {
      case "clone":
        return <GitBranch className="w-3.5 h-3.5" />;
      case "test":
        return <Terminal className="w-3.5 h-3.5" />;
      case "classify":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "push":
        return <Upload className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow rounded-lg p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <h2 className="text-lg font-semibold text-foreground">Live Progress</h2>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-md transition-all ${
                step.status === "running"
                  ? "bg-primary/5 border border-primary/20"
                  : step.status === "completed"
                  ? "bg-success/5 border border-success/10"
                  : step.status === "error"
                  ? "bg-destructive/5 border border-destructive/10"
                  : "bg-muted/30 border border-transparent"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{getIcon(step.status)}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getStepIcon(step.id)}
                  <span className={`text-sm font-medium ${
                    step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {step.details && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground font-mono mt-1"
                  >
                    {step.details}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LiveProgressStream;
