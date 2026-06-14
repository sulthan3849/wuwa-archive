"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LuckPercentilePanelProps {
  averagePity: number;
  total5Stars: number;
  totalPulls: number;
  className?: string;
}

export function LuckPercentilePanel({
  averagePity,
  total5Stars,
  totalPulls,
  className,
}: LuckPercentilePanelProps) {
  const t = useTranslations('tracker')

  // Determine luck level based on average pity
  const getLuckStatus = () => {
    if (averagePity < 60) {
      return {
        label: t('luckStatus.lucky'),
        color: "text-green-500",
        bgColor: "bg-green-500/20",
        icon: TrendingDown,
      };
    }
    if (averagePity > 70) {
      return {
        label: t('luckStatus.unlucky'),
        color: "text-red-500",
        bgColor: "bg-red-500/20",
        icon: TrendingUp,
      };
    }
    return {
      label: t('luckStatus.average'),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
      icon: Minus,
    };
  };

  const luckStatus = getLuckStatus();
  const LuckIcon = luckStatus.icon;

  // Empty state check
  const hasData = total5Stars > 0;

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          {t('avgPity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* Average Pity */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "inline-flex items-center justify-center w-20 h-20 rounded-full",
                  luckStatus.bgColor
                )}
              >
                <span className={cn("text-3xl font-bold", luckStatus.color)}>
                  {averagePity.toFixed(1)}
                </span>
              </motion.div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('avgPity')}
              </p>
            </div>

            {/* Luck badge */}
            <div
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg",
                luckStatus.bgColor
              )}
            >
              <LuckIcon className={cn("h-4 w-4", luckStatus.color)} />
              <span className={cn("text-sm font-medium", luckStatus.color)}>
                {luckStatus.label}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{total5Stars}</p>
                <p className="text-xs text-muted-foreground">{t('stats.fiveStars')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{totalPulls}</p>
                <p className="text-xs text-muted-foreground">{t('totalPulls')}</p>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs text-muted-foreground text-center">
              {t('stats.averagePityDescription')}
            </p>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('onboarding.description')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
