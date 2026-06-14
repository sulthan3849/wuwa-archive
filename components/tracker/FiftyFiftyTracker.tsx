"use client";

import { motion } from "framer-motion";
import { Trophy, ShieldAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FiftyFiftyTrackerProps {
  wins: number;
  losses: number;
  guaranteeActive: boolean;
  className?: string;
}

export function FiftyFiftyTracker({
  wins,
  losses,
  guaranteeActive,
  className,
}: FiftyFiftyTrackerProps) {
  const t = useTranslations('fiftyFifty')
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  // Empty state check
  const hasData = total > 0;

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* Win/Loss stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Wins */}
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">
                    {wins}W
                  </span>
                </div>

                {/* Losses */}
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span className="text-2xl font-bold text-red-500">
                    {losses}L
                  </span>
                </div>
              </div>

              {/* Win rate */}
              <div className="text-right">
                <span className="text-2xl font-bold text-accent">
                  {winRate.toFixed(1)}%
                </span>
                <p className="text-xs text-muted-foreground">{t('winRate')}</p>
              </div>
            </div>

            {/* Win rate bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Guarantee status */}
            {guaranteeActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "flex items-center justify-center gap-2 p-2 rounded-lg",
                  "bg-yellow-500/20 text-yellow-500",
                  "border border-yellow-500/30"
                )}
              >
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">
                  {t('guarantee')} — {t('active')}
                </span>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-6">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('noData')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
