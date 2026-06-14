"use client";

import { Monitor, Smartphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type Platform = "windows" | "android";

interface PlatformTabsGroupProps {
  value: Platform;
  onChange: (platform: Platform) => void;
  className?: string;
}

export function PlatformTabsGroup({
  value,
  onChange,
  className,
}: PlatformTabsGroupProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as Platform)}
      className={className}
    >
      <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50">
        <TabsTrigger
          value="windows"
          className={cn(
            "flex items-center gap-2 py-3",
            "data-[state=active]:bg-background"
          )}
        >
          <Monitor className="h-4 w-4" />
          <span className="hidden sm:inline">Windows</span>
          <span className="sm:hidden">PC</span>
        </TabsTrigger>
        <TabsTrigger
          value="android"
          className={cn(
            "flex items-center gap-2 py-3",
            "data-[state=active]:bg-background"
          )}
        >
          <Smartphone className="h-4 w-4" />
          <span>Android</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
