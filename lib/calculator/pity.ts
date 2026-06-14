import { StoredPull } from '@/lib/db/database';
import { STANDARD_5STAR_RESONATORS } from '@/lib/constants/standard-pool';
import { BANNER_HISTORY } from '@/lib/constants/banner-history';

// === TYPES ===

export interface PityInfo {
  currentPity5: number;        // Distance since last 5★
  currentPity4: number;        // Distance since last 4★
  totalPulls: number;          // Total pull count
  total5Stars: number;        // Number of 5★ obtained
  total4Stars: number;        // Number of 4★ obtained
  total3Stars: number;        // Number of 3★ obtained
  averagePity: number;        // Average pity per 5★
  pityDistances: number[];    // Array of distances for each 5★
  fiftyFiftyWins: number;      // Number of 50/50 wins
  fiftyFiftyLosses: number;    // Number of 50/50 losses
  guaranteeActive: boolean;   // Whether guarantee is active
  maxPity: number;            // Hard pity threshold (50 or 80)
}

// === PITY STATS CALCULATOR ===

/**
 * Calculate pity statistics from pull data
 * Sorts pulls ascending by time, then calculates stats
 */
export function calculatePityStats(
  pulls: StoredPull[],
  cardPoolType: number
): PityInfo {
  // Sort ascending by time (oldest first)
  const sorted = [...pulls].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  let pity5 = 0;
  let pity4 = 0;
  let total5 = 0;
  let total4 = 0;
  let total3 = 0;
  const distances: number[] = [];
  let wins = 0;
  let losses = 0;
  let guarantee = false;

  for (const pull of sorted) {
    pity5++;
    pity4++;

    if (pull.qualityLevel === 5) {
      distances.push(pity5);
      total5++;

      // 50/50 logic only for Featured Resonator (cardPoolType=4)
      if (cardPoolType === 4) {
        if (guarantee) {
          // Guaranteed — not counted as win/lose
          guarantee = false;
        } else {
          const featured = getFeaturedCharacter(pull.time);
          if (featured && pull.name === featured) {
            wins++;
          } else if (STANDARD_5STAR_RESONATORS.includes(pull.name as any)) {
            losses++;
            guarantee = true;
          } else {
            // Edge case: unknown character → treat as win
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
    averagePity:
      distances.length > 0
        ? distances.reduce((a, b) => a + b, 0) / distances.length
        : 0,
    pityDistances: distances,
    fiftyFiftyWins: wins,
    fiftyFiftyLosses: losses,
    guaranteeActive: guarantee,
    maxPity: cardPoolType === 1 ? 50 : 80,
  };
}

/**
 * Get featured character based on pull time
 */
function getFeaturedCharacter(pullTime: string): string | null {
  for (const banner of BANNER_HISTORY) {
    if (pullTime >= banner.startDate && pullTime < banner.endDate) {
      return banner.featuredResonator;
    }
  }
  return null;
}

// === LEGACY FORMATTER (keep for backward compatibility) ===

/**
 * Format pulls with pity counts (legacy function)
 * Sorts pulls ascending by time, adds pityCount, returns newest first
 */
export function calculatePity(
  pulls: any[],
  playerUid: string,
  cardPoolType: number
): StoredPull[] {
  // Data from Kuro API is usually ordered newest to oldest
  // To calculate pity linearly (1, 2, 3..), we must sort oldest to newest
  const sorted = [...pulls].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  let currentPity = 0;

  const formattedPulls: StoredPull[] = sorted.map((pull) => {
    currentPity++;

    const formatted: StoredPull = {
      id: pull.id || `${playerUid}_${cardPoolType}_${pull.time}_${currentPity}`,
      playerUid: playerUid,
      cardPoolType: cardPoolType,
      name: pull.name,
      qualityLevel: pull.qualityLevel,
      resourceType: pull.resourceType,
      resourceId: pull.resourceId || pull.name,
      time: pull.time,
      isNew: false,
      pityCount: currentPity,
      isFiftyFiftyWin: null,
    };

    if (pull.qualityLevel === 5) {
      currentPity = 0; // Reset pity after getting a 5-star
    }

    return formatted;
  });

  // Return in newest to oldest order (for UI DataGrid)
  return formattedPulls.reverse();
}
