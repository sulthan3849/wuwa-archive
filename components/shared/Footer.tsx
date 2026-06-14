"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t border-border bg-background/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left - Disclaimer */}
          <p className="text-sm text-muted-foreground">
            {t('disclaimer')}
          </p>

          {/* Center - Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Right - GitHub */}
          {/* TODO: Replace with actual GitHub repository URL */}
          <a
            href="https://github.com/your-repo/wuwa-archive"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground",
              "hover:text-foreground transition-colors"
            )}
          >
            <ExternalLink className="h-4 w-4" />
            <span>v1.0.0</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
