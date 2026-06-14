"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Copy, UploadCloud, Link as LinkIcon, AlertCircle, Check } from "lucide-react"
import { extractConveneUrl } from "@/lib/parser/log-parser"
import { calculatePity } from "@/lib/calculator/pity"
import { db } from "@/lib/db/database"
import { useStore } from "@/lib/store/useStore"
import { useTranslations } from "next-intl"

const BANNER_TYPES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // All banner types including Cyberpunk collab

export function ImportWizard() {
  const t = useTranslations('import')
  const router = useRouter()
  const { setActiveUid } = useStore()
  
  const [url, setUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStepText, setCurrentStepText] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [scriptUrl] = useState(() => typeof window !== 'undefined' ? `${window.location.origin}/import.ps1` : '/import.ps1')
  const [copied, setCopied] = useState(false)

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(`iwr -useb ${scriptUrl} | iex`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setErrorMsg(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const extractedUrl = extractConveneUrl(text)
      
      if (extractedUrl) {
        setUrl(extractedUrl)
      } else {
        setErrorMsg(t('errors.noData'))
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!url) return
    
    setIsImporting(true)
    setErrorMsg(null)
    setProgress(0)
    
    let activePlayerUid = ""
    
    try {
      let completed = 0;
      for (const poolType of BANNER_TYPES) {
        setCurrentStepText(t('progress.fetching', { banner: poolType }))
        
        const res = await fetch('/api/v1/import/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conveneUrl: url, cardPoolType: poolType })
        })
        
        const data = await res.json()
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch data')
        }
        
        activePlayerUid = data.playerUid
        
        if (data.pulls && data.pulls.length > 0) {
          // Process pity
          const processedPulls = calculatePity(data.pulls, activePlayerUid, poolType)
          
          // Delete old pulls for this banner first to prevent phantom duplicates from previous buggy imports
          await db.pulls.where('[playerUid+cardPoolType]').equals([activePlayerUid, poolType]).delete();
          
          // Insert to Dexie
          await db.pulls.bulkPut(processedPulls)
        }
        
        completed++
        setProgress(Math.round((completed / BANNER_TYPES.length) * 100))
      }
      
      setCurrentStepText(t('progress.complete'))
      if (activePlayerUid) {
        await db.profiles.put({
          playerUid: activePlayerUid,
          serverId: '', 
          serverArea: '',
          lastImportAt: new Date().toISOString(),
          lastImportUrl: url
        })
        setActiveUid(activePlayerUid)
      }
      
      setCurrentStepText(t('success.redirecting'))
      setTimeout(() => {
        const locale = window.location.pathname.split('/')[1] || 'en';
        router.push(`/${locale}/tracker`)
      }, 1000)
      
    } catch (err: unknown) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setErrorMsg(errorMessage === 'TOKEN_EXPIRED' 
        ? t('errors.tokenExpired')
        : errorMessage || t('errors.networkError'))
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex gap-2 items-start">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <Tabs defaultValue="windows" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="windows">{t('platform.windows')}</TabsTrigger>
          <TabsTrigger value="android" disabled>Android (Coming Soon)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="windows" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold">1</span>
                  {t('windows.instructions.title')}
                </CardTitle>
                <CardDescription>{t('windows.instructions.step3')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-md border border-border relative group">
                  <code className="text-sm font-mono text-muted-foreground break-all">
                    iwr -useb {scriptUrl} | iex
                  </code>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopyScript}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{t('windows.or')}</p>
                </div>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">{t('windows.uploadLog.title')}</span>
                  <span className="text-xs text-muted-foreground mt-1">{t('windows.uploadLog.maxSize')}</span>
                  <input 
                    type="file" 
                    accept=".log,.txt" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold">2</span>
                  {t('importButton')}
                </CardTitle>
                <CardDescription>{t('urlInput.placeholder')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder={t('urlInput.placeholder')} 
                      className="pl-9 bg-muted/50"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{t('importing')}</span>
                      <span className="text-accent font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{currentStepText}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors" 
                  disabled={!url || isImporting}
                  onClick={handleImport}
                >
                  {isImporting ? t('importing') : t('importButton')}
                </Button>
              </CardFooter>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
