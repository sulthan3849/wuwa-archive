"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PowerShellCodeBlockProps {
  command?: string;
  className?: string;
}

export function PowerShellCodeBlock({
  command = "iwr -UseBasicParsing https://raw.githubusercontent.com/.../import.ps1 | iex",
  className,
}: PowerShellCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [command]);

  return (
    <div className={cn("relative group", className)}>
      {/* Copy button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={cn(
          "absolute right-2 top-2 z-10",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "bg-muted/50 hover:bg-muted"
        )}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-green-500">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </>
        )}
      </Button>

      {/* Code block */}
      <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">PowerShell</span>
        </div>

        {/* Code content */}
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm text-green-400 font-mono whitespace-pre">
            {command}
          </code>
        </pre>
      </div>
    </div>
  );
}
