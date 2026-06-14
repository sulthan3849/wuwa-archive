// ============================================================================
// Wuwa Archive — Database Schema (Dexie / IndexedDB)
// Local-first: ALL user data lives in the browser, never on our server
// ============================================================================

import Dexie, { type Table } from 'dexie';

// === Stored Pull Record ===
export interface StoredPull {
  id: string;              // Generated: `${playerUid}_${cardPoolType}_${time}_${name}_${idx}`
  playerUid: string;       // Player UID — index for filtering per profile
  cardPoolType: number;    // Banner type (1-8) — NORMALIZED to number
  name: string;            // Item name (e.g. "Jiyan", "Verdant Summit")
  qualityLevel: number;    // 3, 4, or 5
  resourceType: number;    // NORMALIZED: 1=Resonator, 2=Weapon
  resourceId: number;      // Internal item ID from Kuro API
  time: string;            // "YYYY-MM-DD HH:mm:ss"

  // Computed fields (calculated during import, not from API)
  isNew: boolean;          // First-time acquisition flag
  pityCount: number;       // Distance from last 5★ in same pool
  isFiftyFiftyWin: boolean | null; // true=win, false=lose, null=N/A
}

// === Stored Profile ===
export interface StoredProfile {
  playerUid: string;       // Primary key
  serverId: string;        // Server identifier
  serverArea: string;      // "global" | "cn"
  lastImportAt: string;    // ISO timestamp of last import
  lastImportUrl: string;   // Last convene URL used (for re-import)
}

// === Settings (key-value store) ===
export interface StoredSettings {
  key: string;             // Primary key (e.g. "locale", "theme")
  value: string;           // Setting value
}

// === Database Class ===
export class WuwaDatabase extends Dexie {
  pulls!: Table<StoredPull, string>;
  profiles!: Table<StoredProfile, string>;
  settings!: Table<StoredSettings, string>;

  constructor() {
    super('WuwaArchiveDB');

    // Version 1: Original schema
    this.version(1).stores({
      pulls: 'id, [playerUid+cardPoolType], playerUid, cardPoolType, time, qualityLevel',
      profiles: 'playerUid',
    });

    // Version 2: Add settings table, resourceId as number
    this.version(2).stores({
      pulls: 'id, [playerUid+cardPoolType], playerUid, cardPoolType, time, qualityLevel',
      profiles: 'playerUid',
      settings: 'key',
    });
  }
}

export const db = new WuwaDatabase();
