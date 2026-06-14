"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ImportProgressState {
  currentPool: number;
  totalPools: number;
  poolName: string;
  pullsFetched: number;
  status: "idle" | "importing" | "success" | "error";
  error?: string;
}

interface ImportProgressBarProps {
  progress: ImportProgressState;
  className?: string;
}

export function ImportProgressBar({ progress, className }: ImportProgressBarProps) {
  const { currentPool, totalPools, poolName, pullsFetched, status, error } = progress;

  // Calculate percentage
  const percentage = totalPools > 0 ? (currentPool / totalPools) * 100 : 0;

  // Format pool name for display
  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Ready to import";
      case "importing":
        return `Fetching ${poolName}... (${currentPool}/${totalPools})`;
      case "success":
        return `Import complete! Total: ${pullsFetched} pulls`;
      case "error":
        return error || "Import failed";
      default:
        return "";
    }
  };

  if (status === "idle") {
    return null;
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Status text */}
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "text-muted-foreground",
          status === "error" && "text-destructive"
        )}>
          {getStatusText()}
        </span>
        <span className="text-muted-foreground font-mono">
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            status === "error" && "[&>[data-state]]:bg-destructive"
          )}
        />
        
        {/* Animated overlay for importing state */}
        {status === "importing" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>

      {/* Pool indicators */}
      <div className="flex gap-1">
        {Array.from({ length: totalPools }, (_, i) => {
          const poolNum = i + 1;
          const isComplete = poolNum < currentPool;
          const isCurrent = poolNum === currentPool && status === "importing";
          const isError = status === "error" && isCurrent;

          return (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                isComplete && "bg-green-500",
                isCurrent && "bg-accent animate-pulse",
                isError && "bg-destructive",
                !isComplete && !isCurrent && "bg-muted"
              )}
            />
          );
        })}
      </div>

      {/* Success/Error indicators */}
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-green-500"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">All banners imported successfully!</span>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive"
        >
          <XCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </div>
  );
}

// Helper to create initial progress state
export function createInitialProgressState(): ImportProgressState {
  return {
    currentPool: 0,
    totalPools: 8,
    poolName: "",
    pullsFetched: 0,
    status: "idle",
  };
}
