// ============================================================================
// Wuwa Archive — Pity Thresholds
// Defines soft pity, hard pity, and color coding ranges
// ============================================================================

export const PITY_THRESHOLDS = {
  /** Novice Convene (cardPoolType=1) — hard pity at 50 */
  NOVICE: {
    hardPity: 50,
    softPityStart: 35,
    cautionStart: 25,
  },
  /** All other banners (cardPoolType 2-8) — hard pity at 80 */
  STANDARD: {
    hardPity: 80,
    softPityStart: 62,
    cautionStart: 50,
  },
} as const;

/**
 * Get the pity threshold config for a given banner type
 */
export function getPityThreshold(cardPoolType: number) {
  return cardPoolType === 1 ? PITY_THRESHOLDS.NOVICE : PITY_THRESHOLDS.STANDARD;
}

/**
 * Get the color for a pity value based on banner type.
 * Green = safe, Yellow = caution, Red = danger (soft/hard pity zone)
 */
export function getPityColor(pity: number, cardPoolType: number): string {
  const threshold = getPityThreshold(cardPoolType);
  if (pity >= threshold.softPityStart) return '#e74c3c'; // 🔴 Red — danger zone
  if (pity >= threshold.cautionStart) return '#f1c40f';   // 🟡 Yellow — caution
  return '#2ecc71';                                       // 🟢 Green — safe
}

/**
 * Get a human-readable pity status label
 */
export function getPityStatus(pity: number, cardPoolType: number): string {
  const threshold = getPityThreshold(cardPoolType);
  if (pity >= threshold.softPityStart) return 'Danger';
  if (pity >= threshold.cautionStart) return 'Caution';
  return 'Safe';
}
