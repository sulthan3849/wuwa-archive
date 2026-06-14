"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToJson } from "@/lib/db/export-import";
import { useStore } from "@/lib/store/useStore";
import { useToast } from "@/components/shared/ToastAlerts";
import { useTranslations } from "next-intl";

interface ExportButtonProps {
  className?: string;
}

export function ExportButton({ className }: ExportButtonProps) {
  const t = useTranslations('toast')
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const activeUid = useStore((state) => state.activeUid);
  const { addToast } = useToast();

  const handleExport = async () => {
    if (!activeUid) return;

    setIsExporting(true);
    setShowSuccess(false);

    try {
      const result = await exportToJson(activeUid);

      if (result.success) {
        setShowSuccess(true);
        addToast('success', t('exportSuccess'))
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error("Export failed:", result.error);
        addToast('error', result.error || t('exportError'))
      }
    } catch (error) {
      console.error("Export error:", error);
      addToast('error', t('exportError'))
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = !activeUid || isExporting;

  return (
    <Button
      onClick={handleExport}
      disabled={isDisabled}
      className={className}
      variant="outline"
      size="sm"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : showSuccess ? (
        <>
          <Download className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Downloaded!</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </>
      )}
    </Button>
  );
}
