"use client";

import { useState, useCallback, useEffect } from "react";
import { Link, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { validateConveneUrl, sanitizeUrl } from "@/lib/parser/url-validator";

interface UrlInputFieldProps {
  value: string;
  onChange: (url: string) => void;
  onValidChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function UrlInputField({
  value,
  onChange,
  onValidChange,
  placeholder = "Paste Convene URL here...",
  disabled = false,
  className,
}: UrlInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validation result
  const validation = value.trim() ? validateConveneUrl(value) : { isValid: false };
  const showValidation = value.trim().length > 0;

  // Notify parent of validity changes
  useEffect(() => {
    onValidChange?.(validation.isValid);
  }, [validation.isValid, onValidChange]);

  // Handle input change with sanitization
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeUrl(e.target.value);
      onChange(sanitized);
    },
    [onChange]
  );

  // Handle paste event
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      // Small delay to let the paste complete first
      setTimeout(() => {
        const pastedValue = (e.target as HTMLInputElement).value;
        const sanitized = sanitizeUrl(pastedValue);
        onChange(sanitized);
      }, 0);
    },
    [onChange]
  );

  // Get status icon
  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (!showValidation) {
      return <Link className="h-4 w-4 text-muted-foreground" />;
    }
    if (validation.isValid) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  // Get border color based on state
  const getBorderColor = () => {
    if (!showValidation) {
      return isFocused ? "border-accent" : "border-input";
    }
    return validation.isValid ? "border-green-500" : "border-destructive";
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Input field */}
      <div className="relative">
        {/* Left icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {getStatusIcon()}
        </div>

        {/* Input */}
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 pr-10 h-12 font-mono text-sm",
            "transition-colors duration-200",
            getBorderColor(),
            isFocused && "ring-2 ring-accent/50"
          )}
        />

        {/* Right icon - clear button when there's content */}
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Validation message */}
      {showValidation && !validation.isValid && (
        <p className="text-sm text-destructive flex items-start gap-2">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{validation.error}</span>
        </p>
      )}

      {/* Success message */}
      {showValidation && validation.isValid && (
        <p className="text-sm text-green-500 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>URL is valid</span>
        </p>
      )}
    </div>
  );
}
