// ============================================================================
// Wuwa Archive — Shared TypeScript Types
// Reflects the ACTUAL Kuro Games API response structure
// ============================================================================

// === What Kuro API actually returns per pull ===
export interface KuroApiPull {
  cardPoolType: string;   // e.g. "Resonators Accurate Modulation" (STRING, not number!)
  resourceId: number;     // Internal item ID (e.g. 1404)
  qualityLevel: number;   // 3, 4, or 5
  resourceType: string;   // "Resonator" or "Weapon" (STRING, not number!)
  name: string;           // Item name in English (e.g. "Jiyan")
  count: number;          // Always 1
  time: string;           // "YYYY-MM-DD HH:mm:ss"
}

// === Kuro API response wrapper ===
export interface KuroApiResponse {
  code: number;           // 0 = success, non-zero = error
  msg: string;
  data: KuroApiPull[];    // DIRECTLY an array — NOT data.list!
}

// === Parse request from client to our proxy ===
export interface ParseRequest {
  conveneUrl: string;
  cardPoolType: number;   // 1-8 (we use numeric on our side)
}

// === Parse response from our proxy to client ===
export interface ParseResponse {
  success: boolean;
  playerUid?: string;
  serverId?: string;
  serverArea?: string;
  cardPoolType?: number;
  pulls?: KuroApiPull[];
  pullCount?: number;
  fetchedAt?: string;
  error?: string;
  message?: string;
  retryAfter?: number;
}

// === URL params extracted from convene URL ===
export interface ConveneUrlParams {
  playerId: string;
  recordId: string;
  serverId: string;
  languageCode: string;
  svrArea: string;
}

// === Normalization helpers ===

/**
 * Convert resourceType string from API to number for storage
 * "Resonator" → 1, "Weapon" → 2
 */
export function normalizeResourceType(type: string): number {
  if (type.toLowerCase() === 'resonator') return 1;
  if (type.toLowerCase() === 'weapon') return 2;
  return 0; // unknown
}

/**
 * Generate a deterministic unique ID for each pull.
 * Since Kuro API does NOT provide a unique ID per pull,
 * we generate one from: playerUid + cardPoolType(number) + time + index
 */
export function generatePullId(
  playerUid: string,
  cardPoolType: number,
  time: string,
  name: string,
  index: number
): string {
  // Use name + time + index for uniqueness within same second
  const sanitizedTime = time.replace(/[\s:-]/g, '');
  return `${playerUid}_${cardPoolType}_${sanitizedTime}_${name.replace(/\s+/g, '')}_${index}`;
}
