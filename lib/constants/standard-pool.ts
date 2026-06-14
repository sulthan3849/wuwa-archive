// ============================================================================
// Wuwa Archive — Standard 5★ Pool
// Characters that can be obtained on any banner (used for 50/50 detection)
// ============================================================================

/**
 * Standard 5★ Resonators that appear in the permanent pool.
 * When a player gets one of these on the Featured Resonator banner (cardPoolType=4),
 * it counts as a 50/50 LOSS, and the next 5★ is GUARANTEED to be the featured character.
 */
export const STANDARD_5STAR_RESONATORS = [
  'Calcharo',
  'Encore',
  'Jianxin',
  'Lingyang',
  'Verina',
] as const;

export type Standard5StarResonator = typeof STANDARD_5STAR_RESONATORS[number];

/**
 * Check if a character name is a standard 5★ resonator
 */
export function isStandard5Star(name: string): boolean {
  return STANDARD_5STAR_RESONATORS.includes(name as Standard5StarResonator);
}
