"use client"
import { Link, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const links = [
    { href: "/tracker", label: t('tracker') },
    { href: "/import", label: t('import') },
    { href: "/settings", label: t('settings') },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display font-bold text-xl inline-block text-accent">Wuwa Archive</span>
          </Link>
          <div className="flex gap-6 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname?.includes(link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
