"use client"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export function PityCircularGauge({ currentPity, maxPity }: { currentPity: number, maxPity: number }) {
  const t = useTranslations('tracker')
  const percentage = (currentPity / maxPity) * 100
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  let colorClass = "text-pity-lucky"
  let statusLabel = t('pityStatus.safe')
  if (currentPity >= 66) {
    colorClass = "text-pity-unlucky"
    statusLabel = t('pityStatus.danger')
  }
  else if (currentPity >= 51) {
    colorClass = "text-pity-warning"
    statusLabel = t('pityStatus.caution')
  }

  return (
    <div 
      className="relative w-40 h-40 flex items-center justify-center"
      role="img"
      aria-label={`Pity counter: ${currentPity} out of ${maxPity}. Status: ${statusLabel}`}
    >
      <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
        <circle 
          cx="80" cy="80" r={radius} 
          className="stroke-muted fill-transparent" strokeWidth="8" 
        />
        <motion.circle 
          cx="80" cy="80" r={radius} 
          className={`fill-transparent stroke-current ${colorClass}`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-display font-bold text-foreground">{currentPity}</span>
        <span className="text-sm text-muted-foreground">/ {maxPity}</span>
      </div>
    </div>
  )
}
