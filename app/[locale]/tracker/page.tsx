"use client"
import { ConveneTypeTabs } from "@/components/tracker/ConveneTypeTabs"
import { PityCircularGauge } from "@/components/tracker/PityCircularGauge"
import { ConveneHistoryDataGrid } from "@/components/tracker/ConveneHistoryDataGrid"
import { FiftyFiftyTracker } from "@/components/tracker/FiftyFiftyTracker"
import { PullRatioStats } from "@/components/tracker/PullRatioStats"
import { LuckPercentilePanel } from "@/components/tracker/LuckPercentilePanel"
import { ServerResetCountdown } from "@/components/tracker/ServerResetCountdown"
import { ExportButton } from "@/components/tracker/ExportButton"
import { useStore } from "@/lib/store/useStore"
import { usePulls } from "@/lib/hooks/usePulls"
import { useProfiles } from "@/lib/hooks/useProfile"
import { useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { calculatePityStats } from "@/lib/calculator/pity"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function TrackerPage() {
  const t = useTranslations('tracker')
  const { activeUid, setActiveUid, activeBannerTab, setActiveBannerTab } = useStore()
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles()
  
  // Set default activeUid if not set but we have profiles
  useEffect(() => {
    if (!activeUid && profiles && profiles.length > 0) {
      setActiveUid(profiles[0].playerUid)
    }
  }, [activeUid, profiles, setActiveUid])

  const { data: pulls, isLoading: isLoadingPulls } = usePulls(activeUid, activeBannerTab)

  // Calculate pity stats
  const pityInfo = useMemo(() => {
    if (!pulls || pulls.length === 0) {
      return {
        currentPity5: 0,
        currentPity4: 0,
        totalPulls: 0,
        total5Stars: 0,
        total4Stars: 0,
        total3Stars: 0,
        averagePity: 0,
        fiftyFiftyWins: 0,
        fiftyFiftyLosses: 0,
        guaranteeActive: false,
      }
    }
    return calculatePityStats(pulls, activeBannerTab)
  }, [pulls, activeBannerTab])

  // Calculate pull ratio stats
  const pullStats = useMemo(() => {
    if (!pulls || pulls.length === 0) {
      return { totalPulls: 0, fiveStarCount: 0, fourStarCount: 0, threeStarCount: 0 }
    }
    let fiveStarCount = 0
    let fourStarCount = 0
    let threeStarCount = 0
    for (const pull of pulls) {
      if (pull.qualityLevel === 5) fiveStarCount++
      else if (pull.qualityLevel === 4) fourStarCount++
      else if (pull.qualityLevel === 3) threeStarCount++
    }
    return { totalPulls: pulls.length, fiveStarCount, fourStarCount, threeStarCount }
  }, [pulls])

  if (isLoadingProfiles) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!profiles || profiles.length === 0 || !activeUid) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-12 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold text-foreground">{t('noData')}</h1>
        <p className="text-muted-foreground">{t('noDataDescription')}</p>
        <Link href="/import" className="inline-block px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 transition-colors">
          {t('goToImport')}
        </Link>
      </div>
    )
  }

  const maxPity = activeBannerTab === 1 ? 50 : 80

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header with server reset countdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground">{t('profile')}: {activeUid}</p>
        </div>
        <div className="flex items-center gap-4">
          <ServerResetCountdown />
          <ExportButton />
        </div>
      </div>
      
      <ConveneTypeTabs activeTab={activeBannerTab} onTabChange={setActiveBannerTab} />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 mt-6">
        {/* Left sidebar - Stats */}
        <div className="flex flex-col gap-6">
          {/* Pity Gauge */}
          <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-lg shadow-sm">
            <PityCircularGauge 
              currentPity={pityInfo.currentPity5} 
              maxPity={maxPity} 
            />
            <div className="mt-4 text-center">
              <div className="font-semibold text-lg">
                {pityInfo.total5Stars > 0 ? (
                  <>
                    {t('stats.totalFiveStars')}: <span className="text-accent">{pityInfo.total5Stars}</span>
                  </>
                ) : (
                  <>
                    {t('guaranteeActive')}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* 50/50 Tracker - only show for Featured Resonator (type 4) */}
          {activeBannerTab === 4 && (
            <FiftyFiftyTracker 
              wins={pityInfo.fiftyFiftyWins}
              losses={pityInfo.fiftyFiftyLosses}
              guaranteeActive={pityInfo.guaranteeActive}
            />
          )}
          
          {/* Pull Ratio Stats */}
          <PullRatioStats 
            totalPulls={pullStats.totalPulls}
            fiveStarCount={pullStats.fiveStarCount}
            fourStarCount={pullStats.fourStarCount}
            threeStarCount={pullStats.threeStarCount}
          />
          
          {/* Luck Stats */}
          <LuckPercentilePanel 
            averagePity={pityInfo.averagePity}
            total5Stars={pityInfo.total5Stars}
            totalPulls={pityInfo.totalPulls}
          />
        </div>

        {/* Right side - Pull History */}
        <div className="flex flex-col gap-4">
          {isLoadingPulls ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : pulls && pulls.length > 0 ? (
            <ConveneHistoryDataGrid pulls={pulls} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-lg bg-card">
              <p className="text-muted-foreground">{t('emptyState.title')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
