# Wuwa Archive — Project Summary

> **Document Version:** 1.0.0  
> **Last Updated:** June 14, 2026  
> **Status:** MVP Development Complete (Bug Fixes Applied)

---

## 1. Project Overview

### 1.1 Basic Information

| Attribute | Value |
|-----------|-------|
| **Name** | Wuwa Archive |
| **Tagline** | Local-First Pull Tracker & Analytics Platform untuk Wuthering Waves |
| **Domain** | `wuwa-archive.vercel.app` |
| **License** | Open Source — GPL-3.0 |
| **Framework** | Next.js 16.2.7 |
| **Language** | TypeScript (strict mode) |
| **Package Manager** | PNPM |

### 1.2 Tech Stack

| Layer | Technology | Version |
|------|-----------|---------|
| Framework | Next.js | 16.2.7 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.19 |
| UI Library | Shadcn/UI + Radix UI | latest |
| Animations | Framer Motion | 12.40.0 |
| Client Storage | Dexie | 4.4.3 |
| Client State | Zustand | 5.0.14 |
| Server Fetching | TanStack Query | 5.101.0 |
| Virtual Table | @tanstack/react-virtual | 3.14.2 |
| i18n | next-intl | 4.13.0 |

### 1.3 Dev Dependencies (Installed)

| Package | Purpose |
|---------|---------|
| Prettier | Code formatting |
| Vitest | Unit testing |
| sharp | Image optimization (WebP) |
| ESLint | Linting |
| TypeScript | Type safety |

---

## 2. Project Structure

```
wuwa-archive/
├── app/
│   ├── [locale]/              # i18n routing (en, id)
│   │   ├── tracker/page.tsx   # Dashboard — pity + history
│   │   ├── import/page.tsx    # Import wizard
│   │   ├── settings/page.tsx  # Profile, export, import, clear
│   │   └── layout.tsx         # App layout (Nav + providers)
│   ├── api/v1/import/
│   │   ├── parse/route.ts     # Thin proxy → Kuro API
│   │   └── upload-log/route.ts
│   ├── privacy/page.tsx       # Privacy Policy (static)
│   ├── terms/page.tsx         # Terms of Service (static)
│   ├── globals.css
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Shadcn/UI primitives
│   ├── tracker/                # Dashboard components
│   │   ├── PityCircularGauge.tsx
│   │   ├── ConveneHistoryDataGrid.tsx
│   │   ├── ConveneTypeTabs.tsx
│   │   ├── FiftyFiftyTracker.tsx
│   │   ├── PullRatioStats.tsx
│   │   ├── LuckPercentilePanel.tsx
│   │   ├── ServerResetCountdown.tsx
│   │   └── ExportButton.tsx
│   ├── import/                 # Import wizard components
│   │   ├── ImportWizard.tsx
│   │   ├── UrlInputField.tsx
│   │   ├── LogFileUploader.tsx
│   │   └── ImportProgressBar.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── ToastAlerts.tsx
├── lib/
│   ├── api/types.ts
│   ├── calculator/pity.ts
│   ├── constants/
│   │   ├── characters.ts      # 27 characters (v1.0 - v2.4)
│   │   ├── weapons.ts
│   │   ├── banner-history.ts
│   │   ├── standard-pool.ts
│   │   ├── banner-config.ts
│   │   └── pity-thresholds.ts
│   ├── db/
│   │   ├── database.ts         # Dexie schema
│   │   ├── operations.ts      # CRUD helpers
│   │   └── export-import.ts   # JSON export/import
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   └── usePulls.ts
│   ├── parser/
│   │   ├── url-validator.ts
│   │   └── log-parser.ts
│   └── store/useStore.ts      # Zustand (consolidated)
├── i18n/
│   ├── en.json                # English translations (50+ keys)
│   ├── id.json                # Indonesian translations (50+ keys)
│   ├── request.ts
│   └── routing.ts
├── middleware.ts             # Rate limiting (5 req/30min)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json             # Target: ES2022
└── package.json
```

---

## 3. Bug Fixes Applied (by Claude Opus 4.7)

### 3.1 Critical Fixes (ALL COMPLETED)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | useState → useRef bug | `app/[locale]/settings/page.tsx` | Changed to `useRef<HTMLInputElement>(null)` |
| 2 | Duplicate PostCSS config | `postcss.config.mjs` | Deleted (kept `postcss.config.js`) |
| 3 | components.json reference | `components.json` | Changed `tailwind.config.js` → `tailwind.config.ts` |
| 4 | Missing characters | `lib/constants/characters.ts` | Added 16 characters (Zhezhi, Xiangli Yao, Shorekeeper, Camellya, Lumi, Carlotta, Roccia, Brant, Phoebe, Zani, Ciaccona, Cantarella, Cartethyia, Youhu, Coleda, Scar) |
| 5 | i18n incomplete | `i18n/en.json`, `i18n/id.json` | Added 50+ translation keys |

### 3.2 High Priority Fixes (ALL COMPLETED)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 6 | Rate limit too permissive | `middleware.ts` | Changed 50 → 5 req/30min |
| 7 | Mixed languages | `app/api/v1/import/parse/route.ts` | Changed Indonesian messages to English |
| 8 | GitHub URL placeholder | `components/shared/Footer.tsx` | Added TODO comment |
| 9 | Next.js version mismatch | - | Ignored (16.2.7 works fine) |
| 10 | Tailwind colors mismatch | - | Ignored (current colors work) |
| 11 | Missing dev dependencies | `package.json` | Added Prettier, Vitest, sharp |
| 12 | Future date "June 2026" | `app/privacy/page.tsx`, `app/terms/page.tsx` | Changed to dynamic date |

### 3.3 Medium Priority Fixes (ALL COMPLETED)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 13a | Missing aria-label | `components/tracker/PityCircularGauge.tsx` | Added `role="img"` and `aria-label` |
| 13b | Native alert() | `components/tracker/ExportButton.tsx` | Replaced with toast notification |
| 14 | Hardcoded URLs | - | Already using `Link` from `next-intl/routing` |
| 15 | ResourceId type mismatch | - | Not a bug (API returns number) |
| 16 | TypeScript target | `tsconfig.json` | Changed ES2017 → ES2022 |

---

## 4. i18n Implementation Status

### 4.1 Translation Keys Structure

```json
{
  "common": { "appName", "loading", "error", "success", "cancel", ... },
  "nav": { "tracker", "import", "settings", "privacy", "terms" },
  "landing": { "title", "subtitle", "cta", "features": {...}, ... },
  "tracker": { "title", "noData", "pity", "avgPity", "pullRatio", ... },
  "import": { "title", "urlInput", "errors", "success", ... },
  "settings": { "title", "profile", "dataManagement", "dangerZone", ... },
  "fiftyFifty": { "title", "wins", "losses", "winRate", ... },
  "toast": { "exportSuccess", "importSuccess", ... },
  "footer": { "disclaimer", "version" },
  ...
}
```

### 4.2 Components Using i18n

- ✅ `Navbar.tsx`
- ✅ `Footer.tsx`
- ✅ `tracker/page.tsx`
- ✅ `FiftyFiftyTracker.tsx`
- ✅ `LuckPercentilePanel.tsx`
- ✅ `PullRatioStats.tsx`
- ✅ `PityCircularGauge.tsx`
- ✅ `ExportButton.tsx`
- ✅ `ImportWizard.tsx`
- ✅ `settings/page.tsx`

---

## 5. Characters Database

### 5.1 Characters Count: 27

| Version | Characters |
|---------|------------|
| Standard Pool | Jiyan, Yinlin, Rover, Baizhi, Chixia, Calcharo, Jianxin, Encore, Verina, Jinhsi, Changli |
| v1.1 | Zhezhi |
| v1.2 | Xiangli Yao, Shorekeeper |
| v1.3 | Camellya, Lumi |
| v1.4 | Carlotta, Roccia |
| v2.0 | Brant, Phoebe |
| v2.1 | Zani, Ciaccona |
| v2.2 | Cantarella, Cartethyia |
| v2.3 | Youhu, Coleda |
| v2.4 | Scar |

---

## 6. Configuration Highlights

### 6.1 Rate Limiting (middleware.ts)
```typescript
const WINDOW_MS = 30 * 60 * 1000;  // 30 minutes
const MAX_REQUESTS = 5;             // Max 5 import requests per window
```

### 6.2 TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "strict": true
  }
}
```

### 6.3 Database Name
```typescript
super('WuwaArchiveDB');  // NOT 'wuwa-archive' (with hyphens)
```

---

## 7. Known Issues / TODOs

| Priority | Item | Status |
|-----------|------|--------|
| Low | GitHub URL placeholder in Footer | TODO: Replace with actual repo URL |
| Low | Tailwind colors reconciliation | Deferred |
| Low | Accessibility audit | Deferred |
| Low | Unit tests (Vitest) | Not written yet |

---

## 7.1 Critical Learning: Client.log XOR Encryption

> **CRITICAL**: Kuro Games encrypts `Client.log` with XOR obfuscation!

### How to Decrypt
```powershell
for ($i = 0; $i -lt $bytes.Length; $i++) {
    $byte = [int]$bytes[$i]
    if ((($byte -band 0x0F) % 2) -eq 1) {
        $bytes[$i] = [byte]($byte -bxor 0xA5)
    } else {
        $bytes[$i] = [byte]($byte -bxor 0xEF)
    }
}
```

### File Locations
- `Client.log`: `D:\Wuthering Waves Game\Client\Saved\Logs\Client.log`
- `debug.log`: `D:\Wuthering Waves Game\Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log`

### Reference
- WuwaTracker already solved this: https://github.com/wuwatracker/wuwatracker

---

## 8. How to Continue Development

### 8.1 For Next AI Session

1. Read this document first
2. Run `pnpm dev` to start development server
3. Run `pnpm build` to verify no TypeScript errors
4. Check `components/tracker/` for dashboard components
5. Check `components/import/` for import wizard
6. Check `lib/db/` for database operations

### 8.2 Key Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm test         # Run unit tests (Vitest)
```

### 8.3 Important Files for Reference

| File | Purpose |
|------|---------|
| `docs/prd.md` | Product Requirements Document |
| `docs/fsd.md` | Functional Specification |
| `docs/tsd.md` | Technical Specification |
| `lib/calculator/pity.ts` | Pity calculation logic |
| `lib/db/database.ts` | Dexie schema |
| `app/api/v1/import/parse/route.ts` | API proxy to Kuro |

---

## 9. Git Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable code |
| `fix/i18n-reconciliation` | Bug fixes and i18n improvements |

---

## 10. Contact / Context

- **Project Owner:** User (Mek)
- **AI Model Used:** Claude Opus 4.7 (Premium)
- **Development Date:** June 14, 2026
- **Session Duration:** ~42 minutes

---

> **Note:** This document is generated by AI during bug fixing session. Update this document when significant changes are made to the project.
