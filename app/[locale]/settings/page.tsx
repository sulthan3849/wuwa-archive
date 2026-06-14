"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useStore } from "@/lib/store/useStore"
import { useProfiles } from "@/lib/hooks/useProfile"
import { usePulls } from "@/lib/hooks/usePulls"
import { exportToJson, importFromJson, validateFileSize, validateFileExtension } from "@/lib/db/export-import"
import { clearProfileData } from "@/lib/db/operations"
import { useToast, ToastProvider } from "@/components/shared/ToastAlerts"
import { useTranslations } from "next-intl"

function SettingsContent() {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const tToast = useTranslations('toast')
  const { activeUid, setActiveUid } = useStore()
  const { data: profiles, refetch: refetchProfiles } = useProfiles()
  const [totalPulls, setTotalPulls] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addToast } = useToast()

  // Get profile data
  const activeProfile = profiles?.find(p => p.playerUid === activeUid)

  // Get total pulls count
  useEffect(() => {
    if (activeUid) {
      // Import the database directly for counting
      import('@/lib/db/database').then(async ({ db }) => {
        const count = await db.pulls.where('playerUid').equals(activeUid).count()
        setTotalPulls(count)
      })
    }
  }, [activeUid])

  // Handle export
  const handleExport = useCallback(async () => {
    if (!activeUid) return

    setIsExporting(true)
    try {
      const result = await exportToJson(activeUid)
      if (result.success) {
        addToast('success', tToast('exportSuccess'))
      } else {
        addToast('error', result.error || tToast('exportError'))
      }
    } catch (err) {
      addToast('error', tToast('exportError'))
    } finally {
      setIsExporting(false)
    }
  }, [activeUid, addToast, tToast])

  // Handle import
  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    setImportSuccess(null)
    setIsImporting(true)

    // Validate file
    const sizeCheck = validateFileSize(file)
    if (!sizeCheck.isValid) {
      setImportError(sizeCheck.error || t('dataManagement.import.error'))
      setIsImporting(false)
      return
    }

    const extCheck = validateFileExtension(file)
    if (!extCheck.isValid) {
      setImportError(extCheck.error || t('dataManagement.import.error'))
      setIsImporting(false)
      return
    }

    try {
      const result = await importFromJson(file)
      if (result.success) {
        setImportSuccess(`${t('dataManagement.import.newRecords')}: ${result.newRecords} (${t('dataManagement.import.duplicates')}: ${result.duplicateRecords})`)
        addToast('success', tToast('importSuccess'))
        // Refresh profiles
        refetchProfiles()
        // Set active UID to imported profile
        if (result.profile) {
          setActiveUid(result.profile.playerUid)
        }
      } else {
        setImportError(result.error || t('dataManagement.import.error'))
        addToast('error', result.error || tToast('importError'))
      }
    } catch (err) {
      setImportError(t('dataManagement.import.error'))
      addToast('error', tToast('importError'))
    } finally {
      setIsImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }, [addToast, refetchProfiles, setActiveUid, t, tToast])

  // Handle clear data
  const handleClearData = useCallback(async () => {
    if (!activeUid) return

    setIsClearing(true)
    try {
      await clearProfileData(activeUid)
      addToast('success', tToast('clearSuccess'))
      setShowConfirmClear(false)
      refetchProfiles()
      setActiveUid('')
    } catch (err) {
      addToast('error', tToast('clearError'))
    } finally {
      setIsClearing(false)
    }
  }, [activeUid, addToast, refetchProfiles, setActiveUid, tToast])

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-12 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Active Profile Card */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            {t('profile.title')}
          </CardTitle>
          <CardDescription>{t('profile.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeProfile ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('profile.playerUid')}</span>
                <p className="font-mono font-medium">{activeProfile.playerUid}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('profile.server')}</span>
                <p className="font-medium capitalize">{activeProfile.serverArea || 'Global'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('profile.totalPulls')}</span>
                <p className="font-medium">{totalPulls.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('profile.lastImport')}</span>
                <p className="font-medium">
                  {activeProfile.lastImportAt
                    ? new Date(activeProfile.lastImportAt).toLocaleDateString()
                    : t('profile.never')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t('profile.noProfile')}</p>
          )}
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle>{t('dataManagement.title')}</CardTitle>
          <CardDescription>{t('dataManagement.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import success/error messages */}
          {importSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p className="text-sm">{importSuccess}</p>
            </div>
          )}
          {importError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{importError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="flex-1 flex items-center gap-2"
              onClick={handleExport}
              disabled={!activeUid || isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t('dataManagement.export.button')}
            </Button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 cursor-pointer"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {t('dataManagement.import.button')}
              </Button>
            </label>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6 mt-2">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-destructive">{t('dangerZone.title')}</h4>
              <p className="text-xs text-muted-foreground">{t('dangerZone.description')}</p>
            </div>
            {!showConfirmClear ? (
              <Button
                variant="destructive"
                className="flex items-center gap-2 shrink-0"
                onClick={() => setShowConfirmClear(true)}
                disabled={!activeUid}
              >
                <Trash2 className="h-4 w-4" /> {t('dangerZone.clearButton')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmClear(false)}
                  disabled={isClearing}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={handleClearData}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {t('dangerZone.confirmDelete')}
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  )
}
