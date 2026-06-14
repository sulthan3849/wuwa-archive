// ============================================================================
// Wuwa Archive — Banner Configuration
// Maps cardPoolType numbers to banner metadata
// ============================================================================

export interface BannerConfig {
  id: number;
  label: string;
  shortLabel: string;
  hardPity: number;
  has5050: boolean;
  isPermanent: boolean;
}

/**
 * Master banner configuration.
 * cardPoolType numbers match what we send to Kuro API.
 * Note: Kuro API RETURNS string names, but we REQUEST by number.
 */
export const BANNER_CONFIG: Record<number, BannerConfig> = {
  1: {
    id: 1,
    label: 'Novice Convene',
    shortLabel: 'Novice',
    hardPity: 50,
    has5050: false,
    isPermanent: false,
  },
  2: {
    id: 2,
    label: 'Permanent Resonator',
    shortLabel: 'Perm. Resonator',
    hardPity: 80,
    has5050: false,
    isPermanent: true,
  },
  3: {
    id: 3,
    label: 'Permanent Weapon',
    shortLabel: 'Perm. Weapon',
    hardPity: 80,
    has5050: false,
    isPermanent: true,
  },
  4: {
    id: 4,
    label: 'Featured Resonator',
    shortLabel: 'Feat. Resonator',
    hardPity: 80,
    has5050: true,
    isPermanent: false,
  },
  5: {
    id: 5,
    label: 'Featured Weapon',
    shortLabel: 'Feat. Weapon',
    hardPity: 80,
    has5050: false,
    isPermanent: false,
  },
  6: {
    id: 6,
    label: "Beginner's Choice",
    shortLabel: "Beginner's",
    hardPity: 80,
    has5050: false,
    isPermanent: false,
  },
  7: {
    id: 7,
    label: 'New Voyage Resonator',
    shortLabel: 'New Voyage Res.',
    hardPity: 80,
    has5050: false,
    isPermanent: false,
  },
  8: {
    id: 8,
    label: 'New Voyage Weapon',
    shortLabel: 'New Voyage Wep.',
    hardPity: 80,
    has5050: false,
    isPermanent: false,
  },
};

/** Get all banner IDs as an array [1,2,3,4,5,6,7,8] */
export const ALL_BANNER_IDS = Object.keys(BANNER_CONFIG).map(Number);

/** Get banner label by cardPoolType number */
export function getBannerLabel(cardPoolType: number): string {
  return BANNER_CONFIG[cardPoolType]?.label ?? `Unknown Banner (${cardPoolType})`;
}
