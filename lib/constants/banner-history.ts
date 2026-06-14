// ============================================================================
// Wuwa Archive — Banner History
// Tracks which featured character was available during each banner period
// Used for 50/50 win/loss detection on Featured Resonator banner (cardPoolType=4)
// ============================================================================

export interface BannerPeriod {
  startDate: string;          // "YYYY-MM-DD HH:mm:ss" (UTC+8 server time)
  endDate: string;
  featuredResonator: string;  // Character name exactly as returned by API
  version: string;
  phase: number;
}

/**
 * Complete banner history for Featured Resonator (cardPoolType=4).
 * Each entry represents one featured character banner period.
 * Note: Some versions have 2 featured characters running simultaneously.
 * 
 * Data sourced from Wuthering Waves wiki and community records.
 * Dates are approximate (UTC+8 server time).
 */
export const BANNER_HISTORY: BannerPeriod[] = [
  // === Version 1.0 ===
  { startDate: '2024-05-23 10:00:00', endDate: '2024-06-13 09:59:59', featuredResonator: 'Jiyan', version: '1.0', phase: 1 },
  { startDate: '2024-05-23 10:00:00', endDate: '2024-06-13 09:59:59', featuredResonator: 'Yinlin', version: '1.0', phase: 1 },
  { startDate: '2024-06-13 10:00:00', endDate: '2024-06-28 09:59:59', featuredResonator: 'Jinhsi', version: '1.0', phase: 2 },

  // === Version 1.1 ===
  { startDate: '2024-06-28 10:00:00', endDate: '2024-07-22 09:59:59', featuredResonator: 'Changli', version: '1.1', phase: 1 },
  { startDate: '2024-07-22 10:00:00', endDate: '2024-08-15 09:59:59', featuredResonator: 'Zhezhi', version: '1.1', phase: 2 },

  // === Version 1.2 ===
  { startDate: '2024-08-15 10:00:00', endDate: '2024-09-06 09:59:59', featuredResonator: 'Xiangli Yao', version: '1.2', phase: 1 },
  { startDate: '2024-09-06 10:00:00', endDate: '2024-09-29 09:59:59', featuredResonator: 'Shorekeeper', version: '1.2', phase: 2 },

  // === Version 1.3 ===
  { startDate: '2024-09-29 10:00:00', endDate: '2024-10-24 09:59:59', featuredResonator: 'Camellya', version: '1.3', phase: 1 },
  { startDate: '2024-10-24 10:00:00', endDate: '2024-11-14 09:59:59', featuredResonator: 'Lumi', version: '1.3', phase: 2 },

  // === Version 1.4 ===
  { startDate: '2024-11-14 10:00:00', endDate: '2024-12-05 09:59:59', featuredResonator: 'Carlotta', version: '1.4', phase: 1 },
  { startDate: '2024-12-05 10:00:00', endDate: '2024-12-26 09:59:59', featuredResonator: 'Roccia', version: '1.4', phase: 2 },

  // === Version 2.0 ===
  { startDate: '2024-12-26 10:00:00', endDate: '2025-01-16 09:59:59', featuredResonator: 'Brant', version: '2.0', phase: 1 },
  { startDate: '2025-01-16 10:00:00', endDate: '2025-02-13 09:59:59', featuredResonator: 'Phoebe', version: '2.0', phase: 2 },

  // === Version 2.1 ===
  { startDate: '2025-02-13 10:00:00', endDate: '2025-03-06 09:59:59', featuredResonator: 'Zani', version: '2.1', phase: 1 },
  { startDate: '2025-03-06 10:00:00', endDate: '2025-03-27 09:59:59', featuredResonator: 'Ciaccona', version: '2.1', phase: 2 },

  // === Version 2.2 ===
  { startDate: '2025-03-27 10:00:00', endDate: '2025-04-17 09:59:59', featuredResonator: 'Cantarella', version: '2.2', phase: 1 },
  { startDate: '2025-04-17 10:00:00', endDate: '2025-05-08 09:59:59', featuredResonator: 'Cartethyia', version: '2.2', phase: 2 },

  // === Version 2.3 ===
  { startDate: '2025-05-08 10:00:00', endDate: '2025-05-29 09:59:59', featuredResonator: 'Youhu', version: '2.3', phase: 1 },
  { startDate: '2025-05-29 10:00:00', endDate: '2025-06-19 09:59:59', featuredResonator: 'Coleda', version: '2.3', phase: 2 },

  // === Version 2.4 (current / upcoming) ===
  { startDate: '2025-06-19 10:00:00', endDate: '2025-07-10 09:59:59', featuredResonator: 'Scar', version: '2.4', phase: 1 },
];

/**
 * Find the featured character for a given pull time on Featured Resonator banner.
 * Returns null if no matching banner period is found.
 */
export function getFeaturedCharacter(pullTime: string): string | null {
  for (const banner of BANNER_HISTORY) {
    if (pullTime >= banner.startDate && pullTime < banner.endDate) {
      return banner.featuredResonator;
    }
  }
  return null;
}

/**
 * Find ALL featured characters active at a given time.
 * (Some versions run 2 featured banners simultaneously)
 */
export function getAllFeaturedCharacters(pullTime: string): string[] {
  return BANNER_HISTORY
    .filter(b => pullTime >= b.startDate && pullTime < b.endDate)
    .map(b => b.featuredResonator);
}
