"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { id: 4, name: "Featured Resonator", badge: 450 },
  { id: 5, name: "Featured Weapon", badge: 120 },
  { id: 2, name: "Permanent Resonator", badge: 340 },
  { id: 3, name: "Permanent Weapon", badge: 80 },
  { id: 1, name: "Novice Convene", badge: 50 },
]

export function ConveneTypeTabs({ activeTab, onTabChange }: { activeTab: number, onTabChange: (id: number) => void }) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <Tabs value={activeTab.toString()} onValueChange={(v) => onTabChange(parseInt(v))} className="w-max">
        <TabsList className="bg-transparent h-auto p-0 rounded-none w-full justify-start gap-6 border-b border-border">
          {TABS.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id.toString()}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:shadow-none px-2 py-3 text-muted-foreground"
            >
              {tab.name}
              <span className="ml-2 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                {tab.badge}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
