import type { StoredPull, StoredProfile } from '@/lib/db/database';

export const MOCK_PROFILE: StoredProfile = {
  playerUid: '800123456',
  serverId: '76402e5b',
  serverArea: 'global',
  lastImportAt: new Date().toISOString(),
  lastImportUrl: 'https://aki-gm-resources.aki-game.net/aki/gacha/index.html#/record?player_id=800123456',
};

const CHARACTERS = ['Jiyan', 'Yinlin', 'Jinhsi', 'Changli', 'Calcharo', 'Verina', 'Encore', 'Jianxin', 'Lingyang'];
const WEAPONS = ['Verdant Summit', 'Stringmaster', 'Ages of Harvest', 'Blazing Brilliance', 'Lustrous Razor'];
const FOUR_STARS = ['Sanjua', 'Mortefi', 'Baizhi', 'Chixia', 'Yangyang', 'Taoqi', 'Aalto', 'Danjin', 'Yuanwu'];
const THREE_STARS = ['Broadblade#26', 'Sword#18', 'Pistols#26', 'Gauntlets#21', 'Rectifier#25'];

// Generate 10000 mock pulls for performance testing
export function generateMockPulls(): StoredPull[] {
  const pulls: StoredPull[] = [];
  let pity5 = 0;
  
  // Starting from 6 months ago
  const startTime = new Date();
  startTime.setMonth(startTime.getMonth() - 6);
  let currentTime = startTime.getTime();

  for (let i = 10000; i >= 1; i--) {
    pity5++;
    currentTime += 1000 * 60 * 30; // Every 30 mins

    let qualityLevel = 3;
    let name = THREE_STARS[Math.floor(Math.random() * THREE_STARS.length)];
    let resourceType = 2; // Weapon

    // 5-star chance: soft pity at 66, hard pity at 80
    let is5Star = false;
    if (pity5 >= 80) is5Star = true;
    else if (pity5 >= 66) is5Star = Math.random() < 0.2; // 20% chance in soft pity
    else is5Star = Math.random() < 0.008; // 0.8% base chance

    if (is5Star) {
      qualityLevel = 5;
      resourceType = 1;
      name = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      pity5 = 0; // Reset pity
    } else if (Math.random() < 0.06 || i % 10 === 0) { // Guarantee 4-star every 10 pulls
      qualityLevel = 4;
      resourceType = 1;
      name = FOUR_STARS[Math.floor(Math.random() * FOUR_STARS.length)];
    }

    pulls.push({
      id: `mock_id_${i}`,
      playerUid: '800123456',
      cardPoolType: 4, // Featured Resonator
      name,
      qualityLevel,
      resourceType,
      resourceId: 1000 + i,
      time: new Date(currentTime).toISOString().replace('T', ' ').substring(0, 19),
      isNew: Math.random() > 0.8,
      pityCount: is5Star ? pity5 : (pity5 === 0 ? 0 : pity5), // Just an approximation for mock data
      isFiftyFiftyWin: qualityLevel === 5 ? Math.random() > 0.5 : null,
    });
  }

  // Sort descending by time
  return pulls.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export const MOCK_PULLS = generateMockPulls();
