"use client";

import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImportDataButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ImportDataButton({
  onClick,
  disabled = false,
  isLoading = false,
  className,
}: ImportDataButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full h-12 text-base font-semibold",
        "bg-accent text-accent-foreground",
        "hover:bg-accent/90",
        "transition-all duration-200",
        isLoading && "opacity-80",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Importing...</span>
        </>
      ) : (
        <>
          <Rocket className="h-5 w-5" />
          <span>Import Data</span>
        </>
      )}
    </Button>
  );
}
