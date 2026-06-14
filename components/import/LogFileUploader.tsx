"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogFileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_EXTENSIONS = [".log", ".txt"];

export function LogFileUploader({
  onFileSelect,
  selectedFile,
  disabled = false,
  className,
}: LogFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Only ${ACCEPTED_EXTENSIONS.join(", ")} files are supported.`;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    return null;
  }, []);

  // Handle file selection
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (!file) {
        onFileSelect(null);
        setError(null);
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onFileSelect(null);
        return;
      }

      setError(null);
      onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  // Handle drag events
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0] || null;
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onFileSelect(null);
        return;
      }

      setError(null);
      onFileSelect(file);
    },
    [disabled, onFileSelect, validateFile]
  );

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Handle remove file
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileSelect(null);
      setError(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFileSelect]
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6",
          "transition-colors duration-200 cursor-pointer",
          "flex flex-col items-center justify-center gap-3",
          isDragging
            ? "border-accent bg-accent/10"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          selectedFile && "border-green-500 bg-green-500/5"
        )}
      >
        {selectedFile ? (
          <>
            {/* Selected file display */}
            <FileText className="h-8 w-8 text-green-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className={cn(
                "absolute top-2 right-2 p-1 rounded-full",
                "bg-muted hover:bg-muted/80 transition-colors"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            {/* Empty state */}
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-foreground">
                Drag & drop Client.log here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: {ACCEPTED_EXTENSIONS.join(", ")} (max 5MB)
              </p>
            </div>
          </>
        )}
      </div>

      {/* File location hint */}
      {!selectedFile && (
        <p className="text-xs text-muted-foreground">
          File location: [Game]\Client\Saved\Logs\Client.log
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
