"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerResetCountdownProps {
  className?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date();
  
  // Get current UTC time
  const utcNow = new Date(now.toISOString());
  
  // Calculate next reset time (04:00 UTC daily)
  const nextReset = new Date(utcNow);
  nextReset.setUTCHours(4, 0, 0, 0);
  
  // If it's already past 04:00 UTC, set to next day
  if (utcNow >= nextReset) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }
  
  // Calculate difference
  const diff = nextReset.getTime() - utcNow.getTime();
  
  // Convert to hours, minutes, seconds
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    total: diff,
  };
}

export function ServerResetCountdown({ className }: ServerResetCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format numbers with leading zeros
  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  // Determine color based on time remaining
  const getColorClass = () => {
    if (timeLeft.total < 10 * 60 * 1000) {
      // Less than 10 minutes
      return "text-destructive animate-pulse";
    }
    if (timeLeft.total < 60 * 60 * 1000) {
      // Less than 1 hour
      return "text-yellow-500";
    }
    return "text-muted-foreground";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-muted/50 backdrop-blur-sm",
        "text-sm",
        className
      )}
    >
      <Clock className={cn("h-4 w-4", getColorClass())} />
      <span className="text-muted-foreground">Server Reset in:</span>
      <span className={cn("font-mono font-bold", getColorClass())}>
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:
        {formatNumber(timeLeft.seconds)}
      </span>
    </div>
  );
}
