"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Percent } from "lucide-react"

export function FiftyFiftyTracker({ wins = 5, losses = 3 }) {
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">50/50 Win Rate</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{winRate}%</div>
        <p className="text-xs text-muted-foreground">
          {wins} Wins / {losses} Losses
        </p>
        <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500" style={{ width: `${winRate}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${100 - winRate}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}

export function PullRatioStats({ avgPity = 56.4 }) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average 5★ Pity</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-accent">{avgPity.toFixed(1)}</div>
        <p className="text-xs text-muted-foreground">
          Below soft pity average (66)
        </p>
      </CardContent>
    </Card>
  )
}

export function LuckPercentilePanel({ percentile = 82 }) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Luck Percentile</CardTitle>
        <Percent className="h-4 w-4 text-accent/70" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-pity-lucky">Top {100 - percentile}%</div>
        <p className="text-xs text-muted-foreground">
          You are luckier than {percentile}% of players
        </p>
      </CardContent>
    </Card>
  )
}
