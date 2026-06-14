"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PullRatioStatsProps {
  totalPulls: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  className?: string;
}

export function PullRatioStats({
  totalPulls,
  fiveStarCount,
  fourStarCount,
  threeStarCount,
  className,
}: PullRatioStatsProps) {
  const t = useTranslations('tracker')

  // Calculate percentages
  const fiveStarPercent = totalPulls > 0 ? (fiveStarCount / totalPulls) * 100 : 0;
  const fourStarPercent = totalPulls > 0 ? (fourStarCount / totalPulls) * 100 : 0;
  const threeStarPercent = totalPulls > 0 ? (threeStarCount / totalPulls) * 100 : 0;

  // Empty state check
  const hasData = totalPulls > 0;

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          {t('pullRatio')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* Stacked bar chart */}
            <div className="h-4 rounded-full overflow-hidden flex">
              {fiveStarCount > 0 && (
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${fiveStarPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  title={`5★: ${fiveStarPercent.toFixed(1)}%`}
                />
              )}
              {fourStarCount > 0 && (
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${fourStarPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                  title={`4★: ${fourStarPercent.toFixed(1)}%`}
                />
              )}
              {threeStarCount > 0 && (
                <motion.div
                  className="bg-gradient-to-r from-blue-400 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${threeStarPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  title={`3★: ${threeStarPercent.toFixed(1)}%`}
                />
              )}
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {/* 5★ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-yellow-500 font-medium">
                    {t('stats.fiveStars')}
                  </span>
                </div>
                <span className="text-sm">
                  <span className="font-bold">{fiveStarCount}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({fiveStarPercent.toFixed(1)}%)
                  </span>
                </span>
              </div>

              {/* 4★ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-purple-500 font-medium">
                    {t('stats.fourStars')}
                  </span>
                </div>
                <span className="text-sm">
                  <span className="font-bold">{fourStarCount}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({fourStarPercent.toFixed(1)}%)
                  </span>
                </span>
              </div>

              {/* 3★ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-blue-500 font-medium">
                    {t('stats.threeStars')}
                  </span>
                </div>
                <span className="text-sm">
                  <span className="font-bold">{threeStarCount}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({threeStarPercent.toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                {t('totalPulls')}: <span className="font-bold text-foreground">{totalPulls}</span>
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-6">
            <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('onboarding.description')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
