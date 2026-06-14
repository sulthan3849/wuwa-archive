# 🔧 Wuwa Archive — Technical Specification Document (TSD)

> **Dokumen referensi teknis untuk implementasi Wuwa Archive**
> Versi: 1.0.0 | Terakhir diperbarui: 2026-06-05

---

## 1. Tech Stack Overview

### 1.1 MVP Dependencies

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Framework** | Next.js | 15.x | App Router, SSR/SSG, API routes |
| **Language** | TypeScript | 5.x | Strict mode, type safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **UI Library** | Shadcn/UI | latest | Composable, accessible components |
| **Animations** | Framer Motion | 11.x | Micro-animations, transitions |
| **Client Storage** | Dexie | 4.x | IndexedDB wrapper (primary data store) |
| **Client State** | Zustand | 5.x | Lightweight reactive state |
| **Server Fetching** | TanStack Query | 5.x | Async state, caching, retry logic |
| **Virtual Table** | @tanstack/react-virtual | 3.x | Virtualized scrolling (10k+ rows) |
| **i18n** | next-intl | 3.x | Internationalization (EN + ID) |
| **Package Manager** | PNPM | 9.x | Fast, disk-efficient |

### 1.2 Phase 2 Dependencies (TIDAK di MVP)

| Teknologi | Versi | Fungsi | Trigger |
|-----------|-------|--------|---------|
| PostgreSQL (Neon) | — | Opt-in Global Stats | User demand |
| Drizzle ORM | — | Type-safe SQL | Dengan PostgreSQL |
| Better Auth | — | OAuth (Google/GitHub) | Cloud Backup |
| Redis | — | Caching, rate limiting | Global Stats aggregation |
| BullMQ | — | Background job queue | Stats pipeline |

### 1.3 Dev Dependencies

| Tool | Fungsi |
|------|--------|
| ESLint | Linting (Next.js config) |
| Prettier | Code formatting |
| Vitest | Unit testing |
| sharp | Image optimization (WebP conversion) |

---

## 2. Project Structure

```
wuwa-archive/
├── app/                              # Next.js 15 App Router
│   ├── [locale]/                     # i18n routing (en, id)
│   │   ├── tracker/page.tsx          # Dashboard — pity + history
│   │   ├── import/page.tsx           # Import wizard
│   │   ├── settings/page.tsx         # Profile, export, import, clear
│   │   ├── privacy/page.tsx          # Privacy Policy (static)
│   │   ├── terms/page.tsx            # Terms of Service (static)
│   │   └── layout.tsx                # App layout (Nav + reset countdown)
│   ├── api/v1/
│   │   └── import/
│   │       ├── parse/route.ts        # Thin proxy → Kuro API (per-banner)
│   │       └── upload-log/route.ts   # Client.log → extract → proxy
│   ├── globals.css                   # Tailwind base + custom styles
│   └── layout.tsx                    # Root layout (html, body, providers)
├── components/
│   ├── ui/                           # Shadcn/UI primitives (Button, Dialog, etc)
│   ├── tracker/                      # Dashboard components
│   │   ├── PityCircularGauge.tsx     # Donut chart — pity progress
│   │   ├── ConveneHistoryDataGrid.tsx # Virtual table — pull history
│   │   ├── ConveneTypeTabs.tsx       # Banner type tab switcher
│   │   ├── FiftyFiftyTracker.tsx     # Win/loss ratio + guarantee
│   │   ├── PullRatioStats.tsx        # 5★/4★/3★ distribution
│   │   ├── LuckPercentilePanel.tsx   # Average pity display
│   │   ├── ServerResetCountdown.tsx  # Daily reset timer
│   │   └── ExportButton.tsx          # JSON export trigger
│   ├── import/                       # Import wizard components
│   │   ├── PlatformTabsGroup.tsx     # Windows / Android toggle
│   │   ├── UrlInputField.tsx         # URL input + regex validation
│   │   ├── PowerShellCodeBlock.tsx   # Code block + copy button
│   │   ├── LogFileUploader.tsx       # Drag-and-drop file upload
│   │   ├── ImportDataButton.tsx      # Trigger import
│   │   └── ImportProgressBar.tsx     # Banner progress (3/8...)
│   └── shared/                       # Global components
│       ├── Navbar.tsx                # Navigation bar
│       ├── Footer.tsx                # Footer links
│       └── ToastAlerts.tsx           # Notification toasts
├── lib/
│   ├── api/
│   │   ├── kuro-client.ts           # Server-side: proxy to Kuro API
│   │   └── types.ts                 # Shared TypeScript types
│   ├── calculator/                   # CLIENT-SIDE pity engine
│   │   ├── pity.ts                  # Main pity calculator
│   │   ├── fifty-fifty.ts           # 50/50 win/loss determination
│   │   └── pull-stats.ts            # Aggregate statistics
│   ├── parser/
│   │   ├── url-validator.ts         # Regex URL validation
│   │   └── log-parser.ts            # Client.log regex extraction
│   ├── db/
│   │   ├── database.ts              # Dexie instance + schema
│   │   ├── operations.ts            # CRUD helpers
│   │   └── export-import.ts         # JSON export/import (native format)
│   ├── store/                        # Zustand stores
│   │   ├── profile-store.ts         # Active profile management
│   │   ├── pull-store.ts            # Pull data + computed pity
│   │   └── ui-store.ts              # Theme, locale, active tab
│   └── constants/
│       ├── characters.ts            # CharacterMeta mapping
│       ├── weapons.ts               # WeaponMeta mapping
│       ├── banner-history.ts        # Featured char per banner period
│       ├── standard-pool.ts         # Standard 5★ resonator list
│       ├── banner-config.ts         # cardPoolType → label/icon
│       ├── pity-thresholds.ts       # Soft/hard pity numbers
│       └── colors.ts                # Element HEX palette
├── middleware.ts                     # Rate limiting (IP-based)
├── i18n/
│   ├── en.json                      # English translations
│   └── id.json                      # Indonesian translations
├── scripts/
│   ├── import.ps1                   # PowerShell URL extractor (from scratch)
│   ├── download-assets.ts           # Batch download game icons
│   └── sync-game-data.ts            # Auto-sync from community repos
├── public/
│   └── assets/
│       ├── characters/              # ~50 WebP character icons
│       ├── weapons/                 # ~100+ WebP weapon icons
│       ├── elements/                # 6 element icons
│       └── weapon-types/            # 5 weapon type icons
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Next.js Configuration

### 3.1 `next.config.ts`

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 768, 1024, 1280],
    localPatterns: [
      { pathname: '/assets/**' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Vercel serverless config
  serverExternalPackages: [],
};

export default withNextIntl(nextConfig);
```

### 3.2 `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        basis: '#fceee3',           // Ivory — light background
        accent: '#ddbf61',          // Gold — 5★ convention
        rarity: {
          5: '#ddbf61',             // Gold shimmer
          4: '#9b59b6',             // Purple
          3: '#3498db',             // Blue
        },
        pity: {
          lucky: '#2ecc71',         // Green (low pity: 1-50)
          warning: '#f1c40f',       // Yellow (mid pity: 51-65)
          unlucky: '#e74c3c',       // Red (high pity: 66-80)
        },
        element: {
          glacio: '#4FC3F7',
          fusion: '#FF7043',
          electro: '#CE93D8',
          aero: '#81C784',
          spectro: '#FFD54F',
          havoc: '#EF5350',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'gauge-fill': 'gauge-fill 1s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 3.3 `tsconfig.json` — Path Aliases

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/constants/*": ["./lib/constants/*"]
    }
  }
}
```

### 3.4 `middleware.ts` — Rate Limiting

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store (per Vercel serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 30 * 60 * 1000;  // 30 menit
const MAX_REQUESTS = 5;             // Max 5 import per window

export function middleware(request: NextRequest) {
  // Hanya rate-limit endpoint import
  if (!request.nextUrl.pathname.startsWith('/api/v1/import')) {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Reset jika window sudah expired
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  // Cek limit
  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: 'RATE_LIMITED',
        message: `Terlalu banyak request. Coba lagi dalam ${retryAfter} detik.`,
        retryAfter,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/import/:path*',
};
```

> [!NOTE]
> In-memory rate limiting bekerja per-instance di Vercel. Untuk rate limiting yang lebih robust (Phase 2), gunakan Redis atau Upstash.

---

## 4. Database Layer (IndexedDB + Dexie)

### 4.1 Schema Definition

```typescript
// lib/db/database.ts
import Dexie, { type Table } from 'dexie';

// === INTERFACES ===

export interface StoredPull {
  id: string;              // API pull ID (primary key, unique)
  playerUid: string;       // Player UID — index untuk filter per profile
  cardPoolType: number;    // Banner type (1-8+) — index untuk tab switching
  name: string;            // Item name (e.g. "Jiyan", "Verdant Summit")
  qualityLevel: number;    // 3, 4, atau 5 — index untuk filter by rarity
  resourceType: number;    // 1 = Resonator, 2 = Weapon
  resourceId: string;      // Internal item ID (e.g. "1404")
  time: string;            // "YYYY-MM-DD HH:mm:ss" — index untuk sorting
  isNew: boolean;          // First-time acquisition flag

  // === Computed fields (dihitung saat import, bukan dari API) ===
  pityCount: number;       // Jarak dari 5★ terakhir dalam pool yang sama
  isFiftyFiftyWin: boolean | null;  // true=win, false=lose, null=N/A
}

export interface StoredProfile {
  playerUid: string;       // Primary key
  serverId: string;        // Server identifier
  serverArea: string;      // "global" | "cn"
  lastImportAt: string;    // ISO timestamp terakhir import
  lastImportUrl: string;   // URL terakhir (untuk re-import)
}

export interface StoredSettings {
  key: string;             // Primary key (e.g. "locale", "theme")
  value: any;              // Setting value
}

// === DATABASE CLASS ===

class WuwaArchiveDB extends Dexie {
  pulls!: Table<StoredPull>;
  profiles!: Table<StoredProfile>;
  settings!: Table<StoredSettings>;

  constructor() {
    super('wuwa-archive');

    this.version(1).stores({
      // Syntax: 'primaryKey, index1, index2, ...'
      pulls: 'id, playerUid, cardPoolType, qualityLevel, time, [playerUid+cardPoolType]',
      profiles: 'playerUid',
      settings: 'key',
    });
  }
}

export const db = new WuwaArchiveDB();
```

### 4.2 Migration Strategy

```typescript
// Jika perlu menambah field/index di masa depan:
this.version(2).stores({
  pulls: 'id, playerUid, cardPoolType, qualityLevel, time, [playerUid+cardPoolType], resourceType',
}).upgrade(tx => {
  // Migrasi data jika perlu
  return tx.table('pulls').toCollection().modify(pull => {
    // Tambah default value untuk field baru
    if (pull.newField === undefined) pull.newField = 'default';
  });
});
```

### 4.3 CRUD Operations

```typescript
// lib/db/operations.ts
import { db, type StoredPull, type StoredProfile } from './database';

// === IMPORT ===
export async function importPulls(pulls: StoredPull[]): Promise<number> {
  // bulkPut = upsert by primary key (id)
  // Aman untuk re-import — tidak akan duplikasi
  return db.pulls.bulkPut(pulls);
}

// === QUERY ===
export async function getPullsByPool(
  playerUid: string,
  cardPoolType: number
): Promise<StoredPull[]> {
  return db.pulls
    .where('[playerUid+cardPoolType]')
    .equals([playerUid, cardPoolType])
    .sortBy('time');
}

export async function getAllPulls(playerUid: string): Promise<StoredPull[]> {
  return db.pulls
    .where('playerUid')
    .equals(playerUid)
    .sortBy('time');
}

// === PROFILE ===
export async function upsertProfile(profile: StoredProfile): Promise<void> {
  await db.profiles.put(profile);
}

export async function getProfiles(): Promise<StoredProfile[]> {
  return db.profiles.toArray();
}

// === DELETE ===
export async function clearProfileData(playerUid: string): Promise<void> {
  await db.transaction('rw', db.pulls, db.profiles, async () => {
    await db.pulls.where('playerUid').equals(playerUid).delete();
    await db.profiles.delete(playerUid);
  });
}

// === SETTINGS ===
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  return record?.value ?? defaultValue;
}

export async function setSetting(key: string, value: any): Promise<void> {
  await db.settings.put({ key, value });
}
```

### 4.4 Storage Size Estimates

| Data | Per Record | 10k Pulls | 50k Pulls |
|------|-----------|-----------|-----------|
| StoredPull | ~200 bytes | ~2 MB | ~10 MB |
| StoredProfile | ~150 bytes | negligible | negligible |
| Indexes | ~30% overhead | ~0.6 MB | ~3 MB |
| **Total** | — | **~2.6 MB** | **~13 MB** |

> IndexedDB limit umumnya **50MB+** per origin (browser-dependent). Cukup untuk **200k+ pull records**.

---

## 5. State Management (Zustand)

### 5.1 Profile Store

```typescript
// lib/store/profile-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StoredProfile } from '@/lib/db/database';
import { getProfiles, upsertProfile } from '@/lib/db/operations';

interface ProfileStore {
  activePlayerUid: string | null;
  profiles: StoredProfile[];

  // Actions
  setActiveProfile: (uid: string) => void;
  loadProfiles: () => Promise<void>;
  addProfile: (profile: StoredProfile) => Promise<void>;
  removeProfile: (uid: string) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      activePlayerUid: null,
      profiles: [],

      setActiveProfile: (uid) => set({ activePlayerUid: uid }),

      loadProfiles: async () => {
        const profiles = await getProfiles();
        const current = get().activePlayerUid;
        set({
          profiles,
          activePlayerUid: current ?? profiles[0]?.playerUid ?? null,
        });
      },

      addProfile: async (profile) => {
        await upsertProfile(profile);
        const profiles = await getProfiles();
        set({ profiles, activePlayerUid: profile.playerUid });
      },

      removeProfile: async (uid) => {
        const profiles = get().profiles.filter(p => p.playerUid !== uid);
        const newActive = profiles[0]?.playerUid ?? null;
        set({ profiles, activePlayerUid: newActive });
      },
    }),
    {
      name: 'wuwa-archive-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activePlayerUid: state.activePlayerUid }),
    }
  )
);
```

### 5.2 Pull Store

```typescript
// lib/store/pull-store.ts
import { create } from 'zustand';
import type { StoredPull } from '@/lib/db/database';
import type { PityInfo } from '@/lib/calculator/pity';
import { getPullsByPool, getAllPulls } from '@/lib/db/operations';
import { calculatePity } from '@/lib/calculator/pity';
import { BANNER_CONFIG } from '@/constants/banner-config';

interface PullStore {
  pullsByPool: Record<number, StoredPull[]>;
  pityByPool: Record<number, PityInfo>;
  isLoading: boolean;

  // Actions
  loadPulls: (playerUid: string) => Promise<void>;
  refreshPool: (playerUid: string, cardPoolType: number) => Promise<void>;
}

export const usePullStore = create<PullStore>((set) => ({
  pullsByPool: {},
  pityByPool: {},
  isLoading: false,

  loadPulls: async (playerUid) => {
    set({ isLoading: true });

    const pullsByPool: Record<number, StoredPull[]> = {};
    const pityByPool: Record<number, PityInfo> = {};

    // Load semua pool secara paralel
    const poolTypes = Object.keys(BANNER_CONFIG).map(Number);
    await Promise.all(
      poolTypes.map(async (poolType) => {
        const pulls = await getPullsByPool(playerUid, poolType);
        pullsByPool[poolType] = pulls;
        pityByPool[poolType] = calculatePity(pulls, poolType);
      })
    );

    set({ pullsByPool, pityByPool, isLoading: false });
  },

  refreshPool: async (playerUid, cardPoolType) => {
    const pulls = await getPullsByPool(playerUid, cardPoolType);
    set((state) => ({
      pullsByPool: { ...state.pullsByPool, [cardPoolType]: pulls },
      pityByPool: {
        ...state.pityByPool,
        [cardPoolType]: calculatePity(pulls, cardPoolType),
      },
    }));
  },
}));
```

### 5.3 UI Store

```typescript
// lib/store/ui-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIStore {
  locale: 'en' | 'id';
  theme: 'dark' | 'light';
  activeBannerTab: number;

  setLocale: (locale: 'en' | 'id') => void;
  toggleTheme: () => void;
  setActiveBannerTab: (tab: number) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      locale: 'en',
      theme: 'dark',             // Default: dark mode
      activeBannerTab: 4,        // Default: Featured Resonator

      setLocale: (locale) => set({ locale }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setActiveBannerTab: (tab) => set({ activeBannerTab: tab }),
    }),
    {
      name: 'wuwa-archive-ui',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 5.4 Rehydration Flow

```
App Mount
  │
  ├── 1. Zustand rehydrates dari localStorage (activePlayerUid, theme, locale)
  │
  ├── 2. useEffect → profileStore.loadProfiles() → baca IndexedDB
  │
  ├── 3. Jika activePlayerUid !== null:
  │      └── pullStore.loadPulls(activePlayerUid) → baca IndexedDB → compute pity
  │
  └── 4. Jika activePlayerUid === null:
         └── Tampilkan Empty State / Onboarding
```

---

## 6. API Routes (Server-Side)

### 6.1 `POST /api/v1/import/parse`

```typescript
// app/api/v1/import/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';

// === TYPES ===
interface ParseRequest {
  conveneUrl: string;
  cardPoolType: number;
}

interface KuroApiResponse {
  code: number;
  msg: string;
  data: {
    page: number;
    size: number;
    total: number;
    list: KuroPullRecord[];
  };
}

interface KuroPullRecord {
  id: string;
  name: string;
  qualityLevel: number;
  resourceType: number;
  resourceId: string;
  time: string;
  cardPoolType: number;
  isNew: boolean;
}

// === URL VALIDATION ===
const CONVENE_URL_REGEX = /^https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?/;

function extractUrlParams(url: string) {
  const hashPart = url.split('#/record?')[1];
  if (!hashPart) throw new Error('INVALID_URL_FORMAT');

  const params = new URLSearchParams(hashPart);
  const playerId = params.get('player_id');
  const recordId = params.get('record_id');
  const serverId = params.get('svr_id');
  const languageCode = params.get('lang') || 'en';
  const svrArea = params.get('svr_area') || 'global';

  if (!playerId || !recordId || !serverId) {
    throw new Error('MISSING_PARAMS');
  }

  return { playerId, recordId, serverId, languageCode, svrArea };
}

// === KURO API PROXY ===
const KURO_API_GLOBAL = 'https://gmserver-api.aki-game2.net/gacha/record/query';
const KURO_API_CN = 'https://gmserver-api.aki-game2.com/gacha/record/query';

async function fetchBannerPulls(
  params: ReturnType<typeof extractUrlParams>,
  cardPoolType: number
): Promise<KuroPullRecord[]> {
  const allPulls: KuroPullRecord[] = [];
  const apiUrl = params.svrArea === 'cn' ? KURO_API_CN : KURO_API_GLOBAL;

  let page = 1;
  while (true) {
    const body = {
      cardPoolType,
      playerId: params.playerId,
      serverId: params.serverId,
      languageCode: params.languageCode,
      recordId: params.recordId,
      page,
      size: 20,  // Kuro API default
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`KURO_API_HTTP_${res.status}`);

    const json: KuroApiResponse = await res.json();
    if (json.code !== 0) throw new Error(`KURO_API_CODE_${json.code}`);

    const { list } = json.data;
    if (!list || list.length === 0) break;

    allPulls.push(...list);
    page++;

    // Rate limiting: sleep 500ms antar page
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allPulls;
}

// === ROUTE HANDLER ===
export async function POST(request: NextRequest) {
  try {
    const body: ParseRequest = await request.json();

    // 1. Validate URL
    if (!CONVENE_URL_REGEX.test(body.conveneUrl)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_URL' },
        { status: 400 }
      );
    }

    // 2. Validate cardPoolType
    if (!body.cardPoolType || body.cardPoolType < 1 || body.cardPoolType > 10) {
      return NextResponse.json(
        { success: false, error: 'INVALID_POOL_TYPE' },
        { status: 400 }
      );
    }

    // 3. Extract params
    const params = extractUrlParams(body.conveneUrl);

    // 4. Fetch pulls for this banner
    const pulls = await fetchBannerPulls(params, body.cardPoolType);

    // 5. Return (server does NOT store anything)
    return NextResponse.json({
      success: true,
      playerUid: params.playerId,
      serverId: params.serverId,
      serverArea: params.svrArea,
      cardPoolType: body.cardPoolType,
      pulls,
      pullCount: pulls.length,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    const message = error.message || 'UNKNOWN_ERROR';

    // Token expired detection
    if (message.includes('KURO_API_CODE')) {
      return NextResponse.json(
        { success: false, error: 'TOKEN_EXPIRED', message: 'Token sudah expired. Buka Convene History di game lalu coba lagi.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
```

### 6.2 `POST /api/v1/import/upload-log`

```typescript
// app/api/v1/import/upload-log/route.ts
import { NextRequest, NextResponse } from 'next/server';

const LOG_URL_REGEX = /https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?[^\s"']+/g;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logFile') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'NO_FILE' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'FILE_TOO_LARGE', maxSize: '5MB' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Find ALL convene URLs (take the last/most recent one)
    const matches = content.match(LOG_URL_REGEX);
    if (!matches || matches.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URL_NOT_FOUND', message: 'Convene URL tidak ditemukan di file log.' },
        { status: 400 }
      );
    }

    const conveneUrl = matches[matches.length - 1]; // Last = most recent

    return NextResponse.json({
      success: true,
      conveneUrl,
      message: 'URL berhasil diekstrak. Gunakan endpoint /parse untuk mengambil data.',
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}
```

---

## 7. Pity Calculator Engine

### 7.1 Types

```typescript
// lib/calculator/pity.ts

export interface PityInfo {
  currentPity5: number;        // Jarak sejak 5★ terakhir
  currentPity4: number;        // Jarak sejak 4★ terakhir
  totalPulls: number;          // Total pull count
  total5Stars: number;         // Jumlah 5★ didapat
  total4Stars: number;         // Jumlah 4★ didapat
  total3Stars: number;         // Jumlah 3★ didapat
  averagePity: number;         // Rata-rata pity per 5★
  pityDistances: number[];     // Array jarak setiap 5★
  fiftyFiftyWins: number;      // Jumlah win 50/50
  fiftyFiftyLosses: number;    // Jumlah lose 50/50
  guaranteeActive: boolean;    // Apakah guaranteed aktif
  maxPity: number;             // Hard pity threshold (50 atau 80)
}
```

### 7.2 Calculator Implementation

```typescript
import type { StoredPull } from '@/lib/db/database';
import { STANDARD_5STAR_RESONATORS } from '@/constants/standard-pool';
import { BANNER_HISTORY } from '@/constants/banner-history';

export function calculatePity(
  pulls: StoredPull[],   // sorted ascending by time
  cardPoolType: number
): PityInfo {
  let pity5 = 0, pity4 = 0;
  let total5 = 0, total4 = 0, total3 = 0;
  let distances: number[] = [];
  let wins = 0, losses = 0;
  let guarantee = false;

  for (const pull of pulls) {
    pity5++;
    pity4++;

    if (pull.qualityLevel === 5) {
      distances.push(pity5);
      total5++;

      // 50/50 logic hanya untuk Featured Resonator (cardPoolType=4)
      if (cardPoolType === 4) {
        if (guarantee) {
          // Guaranteed — tidak dihitung sebagai win/lose
          guarantee = false;
        } else {
          const featured = getFeaturedCharacter(pull.time);
          if (featured && pull.name === featured) {
            wins++;
          } else if (STANDARD_5STAR_RESONATORS.includes(pull.name as any)) {
            losses++;
            guarantee = true;
          } else {
            // Edge case: karakter tidak dikenal → treat as win
            // (kemungkinan featured baru yang belum ada di BANNER_HISTORY)
            wins++;
          }
        }
      }

      pity5 = 0;
    }

    if (pull.qualityLevel === 4) {
      total4++;
      pity4 = 0;
    }

    if (pull.qualityLevel === 3) {
      total3++;
    }
  }

  return {
    currentPity5: pity5,
    currentPity4: pity4,
    totalPulls: pulls.length,
    total5Stars: total5,
    total4Stars: total4,
    total3Stars: total3,
    averagePity: distances.length > 0
      ? distances.reduce((a, b) => a + b, 0) / distances.length
      : 0,
    pityDistances: distances,
    fiftyFiftyWins: wins,
    fiftyFiftyLosses: losses,
    guaranteeActive: guarantee,
    maxPity: cardPoolType === 1 ? 50 : 80,
  };
}

// Helper: cari featured character berdasarkan waktu pull
function getFeaturedCharacter(pullTime: string): string | null {
  for (const banner of BANNER_HISTORY) {
    if (pullTime >= banner.startDate && pullTime < banner.endDate) {
      return banner.featuredResonator;
    }
  }
  return null; // Tidak ditemukan — edge case
}
```

---

## 8. Asset Mapping Layer

### 8.1 Types

```typescript
// lib/api/types.ts

export interface CharacterMeta {
  name: string;
  element: 'Glacio' | 'Fusion' | 'Electro' | 'Aero' | 'Spectro' | 'Havoc';
  weaponType: 'Broadblade' | 'Sword' | 'Pistols' | 'Gauntlets' | 'Rectifier';
  rarity: 4 | 5;
  resourceId: string;
  iconPath: string;        // e.g. '/assets/characters/jiyan.webp'
}

export interface WeaponMeta {
  name: string;
  weaponType: 'Broadblade' | 'Sword' | 'Pistols' | 'Gauntlets' | 'Rectifier';
  rarity: 3 | 4 | 5;
  resourceId: string;
  iconPath: string;
}
```

### 8.2 Lookup Functions

```typescript
// lib/utils/asset-lookup.ts
import { CHARACTERS } from '@/constants/characters';
import { WEAPONS } from '@/constants/weapons';
import type { CharacterMeta, WeaponMeta } from '@/lib/api/types';

const PLACEHOLDER_ICON = '/assets/placeholder.webp';

export function getItemMeta(
  name: string,
  resourceType: number
): CharacterMeta | WeaponMeta | null {
  if (resourceType === 1) return CHARACTERS[name] ?? null;
  if (resourceType === 2) return WEAPONS[name] ?? null;
  return null;
}

export function getItemIcon(name: string, resourceType: number): string {
  const meta = getItemMeta(name, resourceType);
  return meta?.iconPath ?? PLACEHOLDER_ICON;
}

export function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    Glacio: '#4FC3F7',
    Fusion: '#FF7043',
    Electro: '#CE93D8',
    Aero: '#81C784',
    Spectro: '#FFD54F',
    Havoc: '#EF5350',
  };
  return colors[element] ?? '#9E9E9E';
}
```

### 8.3 Fallback Strategy

```
Saat getItemMeta(name) return null (karakter belum ada di mapping):

1. Tampilkan nama teks apa adanya (dari API response)
2. Gunakan placeholder icon berdasarkan qualityLevel:
   - 5★ → placeholder-gold.webp
   - 4★ → placeholder-purple.webp  
   - 3★ → placeholder-blue.webp
3. Element & weapon type = "Unknown"
4. TIDAK crash, TIDAK error — graceful degradation
```

---

## 9. Import Flow (Technical)

### 9.1 Client-Side Orchestration

```typescript
// lib/api/import-client.ts
import { db } from '@/lib/db/database';
import { calculatePityForPull } from '@/lib/calculator/pity';

interface ImportProgress {
  currentPool: number;
  totalPools: number;
  poolName: string;
  pullsFetched: number;
}

export async function importFromUrl(
  conveneUrl: string,
  onProgress: (progress: ImportProgress) => void
): Promise<{ playerUid: string; totalPulls: number }> {
  const poolTypes = [1, 2, 3, 4, 5, 6, 7, 8];
  let totalPulls = 0;
  let playerUid = '';

  for (let i = 0; i < poolTypes.length; i++) {
    const poolType = poolTypes[i];

    onProgress({
      currentPool: i + 1,
      totalPools: poolTypes.length,
      poolName: getPoolName(poolType),
      pullsFetched: totalPulls,
    });

    try {
      const response = await fetch('/api/v1/import/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conveneUrl, cardPoolType: poolType }),
      });

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }

      const result = await response.json();

      if (!result.success) {
        if (result.error === 'TOKEN_EXPIRED') throw new Error('TOKEN_EXPIRED');
        continue; // Skip empty banners silently
      }

      playerUid = result.playerUid;

      // Compute pity dan 50/50 sebelum simpan
      const enrichedPulls = enrichPullsWithPity(result.pulls, poolType);

      // Simpan langsung ke IndexedDB per banner
      await db.pulls.bulkPut(enrichedPulls);
      totalPulls += enrichedPulls.length;

    } catch (error: any) {
      if (error.message === 'TOKEN_EXPIRED' || error.message === 'RATE_LIMITED') {
        throw error; // Propagate critical errors
      }
      // Non-critical: banner mungkin kosong → lanjut
    }
  }

  // Update/create profile
  if (playerUid) {
    await db.profiles.put({
      playerUid,
      serverId: '', // from first successful response
      serverArea: 'global',
      lastImportAt: new Date().toISOString(),
      lastImportUrl: conveneUrl,
    });
  }

  return { playerUid, totalPulls };
}
```

### 9.2 URL Validation (Client-Side)

```typescript
// lib/parser/url-validator.ts
const CONVENE_URL_PATTERN = /^https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?.*player_id=\d+.*record_id=[a-zA-Z0-9]+/;

export function isValidConveneUrl(url: string): boolean {
  return CONVENE_URL_PATTERN.test(url.trim());
}

export function sanitizeUrl(url: string): string {
  return url.trim().replace(/\s+/g, '');
}

// Test cases:
// ✅ "https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?svr_id=xxx&player_id=800123456&record_id=abc123"
// ❌ "https://evil-site.com/fake?player_id=123"
// ❌ "not a url at all"
// ❌ "" (empty string)
```

---

## 10. Export/Import System

### 10.1 Native JSON Format (v1.0.0)

```typescript
interface WuwaArchiveExport {
  version: '1.0.0';
  app: 'wuwa-archive';
  exportedAt: string;           // ISO timestamp
  profile: {
    playerUid: string;
    serverId: string;
    serverArea: string;
  };
  pulls: StoredPull[];          // All pull records
  totalPulls: number;           // Convenience count
}
```

### 10.2 File Naming

```
wuwa-archive-pulls-{playerUid}.json
Example: wuwa-archive-pulls-800123456.json
```

---

## 11. Internationalization (i18n)

### 11.1 Setup

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`@/i18n/${locale}.json`)).default,
}));
```

### 11.2 Key Naming Convention

```json
// i18n/en.json
{
  "common": {
    "import": "Import",
    "export": "Export",
    "settings": "Settings",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "tracker": {
    "pity": "{num}✦ Pity",
    "avg_pity": "Average Pity",
    "pull_ratio": "Pull Ratio",
    "fifty_fifty_wins": "50/50 Wins",
    "total_pulls": "Total Pulls",
    "guarantee_active": "Guarantee Active",
    "no_data": "No data yet. Import your pull history to get started!"
  },
  "import": {
    "title": "Import Pull History",
    "paste_url": "Paste Convene URL here",
    "import_data": "Import Data",
    "upload_log": "Upload Client.log",
    "progress": "Fetching banner {current}/{total}...",
    "success": "Successfully imported {count} pulls!",
    "error_expired": "Token expired. Open Convene History in-game and try again.",
    "error_rate_limit": "Too many requests. Please wait {seconds} seconds."
  }
}
```

---

## 12. Security Implementation

| # | Measure | Implementation |
|---|---------|---------------|
| 1 | **URL Validation** | Regex whitelist — hanya domain `aki-gm-resources*.aki-game.net/com` |
| 2 | **Rate Limiting** | IP-based middleware: 5 req / 30 min per import endpoint |
| 3 | **Input Sanitization** | `.trim()`, remove whitespace, validate JSON schema |
| 4 | **File Size Limit** | Max 5MB untuk upload log |
| 5 | **Security Headers** | X-Content-Type-Options, X-Frame-Options, CSP |
| 6 | **No Data Storage** | Server proxy TIDAK menyimpan/log data pull user |
| 7 | **CORS** | Next.js default — same-origin API routes |

---

## 13. Performance Optimization

### 13.1 Virtual Scrolling

```typescript
// Menggunakan @tanstack/react-virtual di ConveneHistoryDataGrid
import { useVirtualizer } from '@tanstack/react-virtual';

function ConveneHistoryDataGrid({ pulls }: { pulls: StoredPull[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: pulls.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,  // Estimated row height
    overscan: 10,             // Render 10 extra rows for smooth scrolling
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <PullRow key={virtualRow.key} pull={pulls[virtualRow.index]} />
        ))}
      </div>
    </div>
  );
}
```

### 13.2 Other Optimizations

| Optimization | Implementation |
|-------------|---------------|
| **Lazy loading icons** | Next.js `<Image>` with `loading="lazy"` |
| **Dexie compound index** | `[playerUid+cardPoolType]` untuk fast query |
| **Bundle splitting** | Next.js automatic code splitting per route |
| **Image format** | WebP, 80% quality, ~10-30KB per icon |
| **Skeleton screens** | Loading state sebelum data ready dari IndexedDB |

---

## 14. Testing Strategy

### 14.1 Unit Tests (Vitest)

```typescript
// __tests__/calculator/pity.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePity } from '@/lib/calculator/pity';

describe('calculatePity', () => {
  it('should calculate current pity correctly', () => {
    const pulls = generateMockPulls(73, 3); // 73 pulls, all 3★
    const result = calculatePity(pulls, 4);
    expect(result.currentPity5).toBe(73);
    expect(result.total5Stars).toBe(0);
  });

  it('should reset pity after 5★', () => {
    const pulls = [
      ...generateMockPulls(50, 3),
      mockPull5Star('Jiyan'),
      ...generateMockPulls(10, 3),
    ];
    const result = calculatePity(pulls, 4);
    expect(result.currentPity5).toBe(10);
    expect(result.total5Stars).toBe(1);
  });

  it('should track 50/50 correctly', () => {
    const pulls = [
      ...generateMockPulls(79, 3),
      mockPull5Star('Calcharo'),  // Standard = LOSE
      ...generateMockPulls(79, 3),
      mockPull5Star('Jiyan'),     // After lose = GUARANTEED
    ];
    const result = calculatePity(pulls, 4);
    expect(result.fiftyFiftyLosses).toBe(1);
    expect(result.guaranteeActive).toBe(false);
  });
});
```

### 14.2 Test Commands

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
pnpm build             # Build verification
```

---

## 15. Deployment (Vercel)

### 15.1 Configuration

```json
// vercel.json (optional, most config via dashboard)
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "regions": ["sin1"]       // Singapore — closest to SEA users
}
```

### 15.2 Environment Variables

```env
# .env.local (development only)
# Tidak ada secrets untuk MVP — semua data di client side!
# Kuro API URLs di-hardcode karena public endpoints

# Phase 2 (jika diperlukan):
# DATABASE_URL=postgresql://...
# BETTER_AUTH_SECRET=...
# REDIS_URL=redis://...
```

### 15.3 Domain

```
MVP:    wuwa-archive.vercel.app
Nanti:  Custom domain via Vercel Dashboard → Settings → Domains
```

---

## 16. Scripts

### 16.1 `import.ps1` — PowerShell URL Extractor

```powershell
# scripts/import.ps1
# Wuwa Archive — Convene URL Extractor (from scratch)
# Usage: iwr -UseBasicParsing https://raw.githubusercontent.com/.../import.ps1 | iex

$ErrorActionPreference = "Stop"

# Cari semua lokasi game yang diketahui
$gamePaths = @(
    # Standalone
    "$env:SystemDrive\Program Files\Wuthering Waves\Wuthering Waves Game",
    "${env:ProgramFiles}\Wuthering Waves\Wuthering Waves Game",
    # Steam
    "${env:ProgramFiles(x86)}\Steam\steamapps\common\Wuthering Waves\Wuthering Waves Game",
    # Epic Games
    "${env:ProgramFiles}\Epic Games\WutheringWavesj3oFh\Wuthering Waves Game"
)

# Log file locations (relative to game path)
$logFiles = @(
    "Client\Saved\Logs\Client.log",
    "Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log"
)

$urlPattern = "https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/record\?[^\s`"']+"
$foundUrl = $null

foreach ($gamePath in $gamePaths) {
    foreach ($logFile in $logFiles) {
        $fullPath = Join-Path $gamePath $logFile
        if (Test-Path $fullPath) {
            Write-Host "[*] Scanning: $fullPath" -ForegroundColor Cyan
            $content = Get-Content $fullPath -Raw
            $matches = [regex]::Matches($content, $urlPattern)
            if ($matches.Count -gt 0) {
                $foundUrl = $matches[$matches.Count - 1].Value  # Last = most recent
                break
            }
        }
    }
    if ($foundUrl) { break }
}

if ($foundUrl) {
    # Copy ke clipboard
    Set-Clipboard -Value $foundUrl
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " URL DITEMUKAN! (sudah di-copy ke clipboard)" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host " Buka Wuwa Archive dan paste URL:" -ForegroundColor Yellow
    Write-Host " https://wuwa-archive.vercel.app/import" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " URL: $foundUrl" -ForegroundColor DarkGray
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " URL TIDAK DITEMUKAN" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host " Pastikan:" -ForegroundColor Yellow
    Write-Host " 1. Buka game Wuthering Waves" -ForegroundColor White
    Write-Host " 2. Buka menu Convene History (riwayat pull)" -ForegroundColor White
    Write-Host " 3. Tunggu halaman memuat penuh" -ForegroundColor White
    Write-Host " 4. Jalankan script ini lagi" -ForegroundColor White
}
```

### 16.2 `sync-game-data.ts` — Auto-Sync Design

```typescript
// scripts/sync-game-data.ts
// Jalankan: npx tsx scripts/sync-game-data.ts

// 1. Fetch data dari community repos (yuhkix/wuwa-ids, dll)
// 2. Parse character/weapon metadata
// 3. Generate lib/constants/characters.ts
// 4. Generate lib/constants/weapons.ts
// 5. Download missing icons → public/assets/

// Jalankan manual per patch baru (~6 minggu)
// Output: auto-generated TypeScript files
```

### 16.3 `download-assets.ts` — Image Pipeline

```typescript
// scripts/download-assets.ts
// Jalankan: npx tsx scripts/download-assets.ts

// 1. Clone/fetch dari Escartem/WutheringWavesTextures
// 2. Filter hanya T_IconRole_*.png dan T_IconWeapon_*.png
// 3. Convert PNG → WebP (80% quality, 256x256)
// 4. Rename berdasarkan mapping (1404 → jiyan.webp)
// 5. Simpan ke public/assets/characters/ dan public/assets/weapons/
```

---

## Appendix A: Error Codes

| Code | HTTP | Meaning | User Message |
|------|------|---------|-------------|
| `INVALID_URL` | 400 | URL format salah | "URL tidak valid. Pastikan URL dimulai dengan https://aki-gm-resources..." |
| `INVALID_POOL_TYPE` | 400 | cardPoolType invalid | (internal — tidak ditampilkan ke user) |
| `MISSING_PARAMS` | 400 | player_id/record_id kosong | "URL tidak lengkap. Coba buka Convene History lagi." |
| `TOKEN_EXPIRED` | 401 | record_id expired | "Token sudah expired (~1-2 jam). Buka Convene History di game lalu coba lagi." |
| `RATE_LIMITED` | 429 | Terlalu banyak request | "Terlalu banyak request. Coba lagi dalam {seconds} detik." |
| `NO_FILE` | 400 | File tidak ditemukan | "File tidak ditemukan. Pilih file Client.log." |
| `FILE_TOO_LARGE` | 400 | File > 5MB | "File terlalu besar (max 5MB)." |
| `URL_NOT_FOUND` | 400 | URL tidak ditemukan di log | "URL tidak ditemukan di file log. Buka Convene History dulu." |
| `KURO_API_HTTP_*` | 502 | Kuro API HTTP error | "Server Kuro Games sedang bermasalah. Coba lagi nanti." |
| `KURO_API_CODE_*` | 502 | Kuro API return error | "Server Kuro Games mengembalikan error. Token mungkin expired." |

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Convene** | Sistem gacha di Wuthering Waves |
| **Pity** | Counter jumlah pull sejak 5★ terakhir |
| **Hard Pity** | Guaranteed 5★ (50 untuk Novice, 80 untuk lainnya) |
| **Soft Pity** | Peningkatan probability mulai pull ~62+ |
| **50/50** | Mekanisme di Featured Resonator: 50% featured, 50% standard |
| **Guarantee** | Setelah lose 50/50, pull 5★ berikutnya PASTI featured |
| **cardPoolType** | Internal ID untuk tipe banner (1-8+) |
| **resourceId** | Internal ID untuk karakter/senjata di Kuro API |
| **Thin Proxy** | Server yang hanya forward request, tidak menyimpan data |
| **record_id** | Auth token dari Convene URL (~1-2 jam expiry) |
| **bulkPut** | Dexie method: upsert (insert or update) by primary key |
| **Virtual Table** | Teknik render hanya baris yang terlihat di layar |
