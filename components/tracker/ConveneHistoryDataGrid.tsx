"use client"
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { StoredPull } from '@/lib/db/database'
import { cn } from '@/lib/utils'
import { getCharacter } from '@/lib/constants/characters'
import { getWeapon } from '@/lib/constants/weapons'
import { ELEMENT_COLORS } from '@/lib/constants/elements'

export function ConveneHistoryDataGrid({ pulls }: { pulls: StoredPull[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: pulls.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // 56px row height
    overscan: 10,
  })

  if (pulls.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground border border-dashed border-border rounded-lg bg-card">
        No pulls recorded for this banner.
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm flex flex-col h-[600px]">
      <div className="grid grid-cols-[60px_60px_1fr_100px_80px_150px] gap-4 p-4 border-b border-border bg-muted/50 font-semibold text-sm text-muted-foreground">
        <div>#</div>
        <div>Icon</div>
        <div>Name</div>
        <div>Type</div>
        <div>Pity</div>
        <div className="text-right">Time</div>
      </div>
      
      <div ref={parentRef} className="overflow-auto flex-1 relative">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const pull = pulls[virtualRow.index]
            
            const characterMeta = pull.resourceType === 1 ? getCharacter(pull.name) : undefined
            const weaponMeta = pull.resourceType === 2 ? getWeapon(pull.name) : undefined
            
            const iconUrl = characterMeta?.iconUrl || weaponMeta?.iconUrl || "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconItem/T_IconItem_20000000_UI.webp"
            const element = characterMeta?.element
            const elementColor = element ? ELEMENT_COLORS[element] : undefined
            
            const rarityColor = pull.qualityLevel === 5 ? "text-accent" : pull.qualityLevel === 4 ? "text-purple-400" : "text-blue-400"
            const rowBg = pull.qualityLevel === 5 ? "bg-accent/5 hover:bg-accent/10" : "hover:bg-muted/50"
            
            return (
              <div
                key={virtualRow.key}
                className={cn(
                  "absolute top-0 left-0 w-full grid grid-cols-[60px_60px_1fr_100px_80px_150px] gap-4 px-4 items-center border-b border-border transition-colors text-sm",
                  rowBg
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="text-muted-foreground">{pulls.length - virtualRow.index}</div>
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 overflow-hidden", "border-transparent bg-black/20")}>
                    <img 
                      src={iconUrl} 
                      alt={pull.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pull.name)}&background=random&color=fff`;
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("font-medium", rarityColor)}>{pull.name}</div>
                  {element && (
                    <span 
                      className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold opacity-90"
                      style={{ backgroundColor: `${elementColor}33`, color: elementColor }}
                    >
                      {element.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">{pull.resourceType === 1 ? 'Resonator' : 'Weapon'}</div>
                <div className="font-medium">{pull.pityCount}</div>
                <div className="text-right text-muted-foreground text-xs whitespace-nowrap">
                  {new Date(pull.time).toLocaleDateString()} {new Date(pull.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
