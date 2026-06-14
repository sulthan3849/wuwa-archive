// ============================================================================
// Wuwa Archive — Database Operations (CRUD Helpers)
// Local-first: ALL user data lives in the browser, never on our server
// ============================================================================

import { db, type StoredPull, type StoredProfile, type StoredSettings } from './database';

// === PULLS OPERATIONS ===

/**
 * Import pulls to IndexedDB (upsert by id)
 * Safe for re-import — duplicates are automatically skipped
 */
export async function importPulls(pulls: StoredPull[]): Promise<number> {
  if (pulls.length === 0) return 0;
  
  const result = await db.pulls.bulkPut(pulls);
  return pulls.length;
}

/**
 * Get all pulls for a specific player
 */
export async function getAllPulls(playerUid: string): Promise<StoredPull[]> {
  return db.pulls
    .where('playerUid')
    .equals(playerUid)
    .sortBy('time');
}

/**
 * Get pulls filtered by cardPoolType (banner type)
 * Uses compound index for efficient query
 */
export async function getPullsByPool(
  playerUid: string,
  cardPoolType: number
): Promise<StoredPull[]> {
  return db.pulls
    .where('[playerUid+cardPoolType]')
    .equals([playerUid, cardPoolType])
    .sortBy('time');
}

/**
 * Get pulls filtered by rarity (qualityLevel)
 */
export async function getPullsByRarity(
  playerUid: string,
  cardPoolType: number,
  qualityLevel: number
): Promise<StoredPull[]> {
  const pulls = await getPullsByPool(playerUid, cardPoolType);
  return pulls.filter(pull => pull.qualityLevel === qualityLevel);
}

/**
 * Get count of pulls for a specific player
 */
export async function getPullCount(playerUid: string): Promise<number> {
  return db.pulls.where('playerUid').equals(playerUid).count();
}

/**
 * Get count of pulls by pool type
 */
export async function getPullCountByPool(
  playerUid: string,
  cardPoolType: number
): Promise<number> {
  return db.pulls
    .where('[playerUid+cardPoolType]')
    .equals([playerUid, cardPoolType])
    .count();
}

/**
 * Get 5-star pulls for a specific player
 */
export async function getFiveStarPulls(playerUid: string): Promise<StoredPull[]> {
  const pulls = await getAllPulls(playerUid);
  return pulls.filter(pull => pull.qualityLevel === 5);
}

/**
 * Get 5-star pulls by pool type
 */
export async function getFiveStarPullsByPool(
  playerUid: string,
  cardPoolType: number
): Promise<StoredPull[]> {
  const pulls = await getPullsByPool(playerUid, cardPoolType);
  return pulls.filter(pull => pull.qualityLevel === 5);
}

// === PROFILE OPERATIONS ===

/**
 * Create or update a profile
 */
export async function upsertProfile(profile: StoredProfile): Promise<void> {
  await db.profiles.put(profile);
}

/**
 * Get all profiles
 */
export async function getProfiles(): Promise<StoredProfile[]> {
  return db.profiles.toArray();
}

/**
 * Get a specific profile by playerUid
 */
export async function getProfile(playerUid: string): Promise<StoredProfile | undefined> {
  return db.profiles.get(playerUid);
}

/**
 * Delete a profile
 */
export async function deleteProfile(playerUid: string): Promise<void> {
  await db.profiles.delete(playerUid);
}

// === SETTINGS OPERATIONS ===

/**
 * Get a setting value with default fallback
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  return record ? (JSON.parse(record.value) as T) : defaultValue;
}

/**
 * Set a setting value
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({
    key,
    value: JSON.stringify(value),
  });
}

/**
 * Get theme setting
 */
export async function getTheme(): Promise<'dark' | 'light'> {
  return getSetting<'dark' | 'light'>('theme', 'dark');
}

/**
 * Set theme setting
 */
export async function setTheme(theme: 'dark' | 'light'): Promise<void> {
  await setSetting('theme', theme);
}

/**
 * Get locale setting
 */
export async function getLocale(): Promise<'en' | 'id'> {
  return getSetting<'en' | 'id'>('locale', 'en');
}

/**
 * Set locale setting
 */
export async function setLocale(locale: 'en' | 'id'): Promise<void> {
  await setSetting('locale', locale);
}

// === DELETE OPERATIONS ===

/**
 * Clear all data for a specific profile (pulls + profile)
 * WARNING: This action cannot be undone
 */
export async function clearProfileData(playerUid: string): Promise<void> {
  await db.transaction('rw', db.pulls, db.profiles, async () => {
    // Delete all pulls for this player
    await db.pulls.where('playerUid').equals(playerUid).delete();
    // Delete the profile
    await db.profiles.delete(playerUid);
  });
}

/**
 * Clear all data from the database
 * WARNING: This action cannot be undone
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.pulls, db.profiles, db.settings, async () => {
    await db.pulls.clear();
    await db.profiles.clear();
    await db.settings.clear();
  });
}

// === UTILITY OPERATIONS ===

/**
 * Check if database has any data
 */
export async function hasData(): Promise<boolean> {
  const pullCount = await db.pulls.count();
  return pullCount > 0;
}

/**
 * Check if a specific player has data
 */
export async function playerHasData(playerUid: string): Promise<boolean> {
  const count = await db.pulls.where('playerUid').equals(playerUid).count();
  return count > 0;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(playerUid: string): Promise<{
  totalPulls: number;
  total5Stars: number;
  total4Stars: number;
  total3Stars: number;
  poolsUsed: number[];
}> {
  const pulls = await getAllPulls(playerUid);
  
  const poolsUsed = new Set<number>();
  let total5Stars = 0;
  let total4Stars = 0;
  let total3Stars = 0;
  
  for (const pull of pulls) {
    poolsUsed.add(pull.cardPoolType);
    if (pull.qualityLevel === 5) total5Stars++;
    else if (pull.qualityLevel === 4) total4Stars++;
    else if (pull.qualityLevel === 3) total3Stars++;
  }
  
  return {
    totalPulls: pulls.length,
    total5Stars,
    total4Stars,
    total3Stars,
    poolsUsed: Array.from(poolsUsed).sort((a, b) => a - b),
  };
}
