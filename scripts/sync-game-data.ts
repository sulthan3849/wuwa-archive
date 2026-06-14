import fs from 'fs';
import path from 'path';

// This is a simulation of fetching from an external API
async function fetchProviderData() {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    characters: [
      { id: "1404", name: "Jiyan", rarity: 5, element: "Aero", weaponType: "Broadblade", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1404_UI.webp" },
      { id: "1405", name: "Yinlin", rarity: 5, element: "Electro", weaponType: "Rectifier", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1405_UI.webp" },
      { id: "1402", name: "Rover", rarity: 5, element: "Spectro", weaponType: "Sword", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1402_UI.webp" },
      { id: "1301", name: "Baizhi", rarity: 4, element: "Glacio", weaponType: "Rectifier", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1301_UI.webp" },
      { id: "1302", name: "Chixia", rarity: 4, element: "Fusion", weaponType: "Pistols", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1302_UI.webp" },
      { id: "1403", name: "Calcharo", rarity: 5, element: "Electro", weaponType: "Broadblade", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1403_UI.webp" },
      { id: "1303", name: "Jianxin", rarity: 5, element: "Aero", weaponType: "Gauntlets", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1303_UI.webp" },
      { id: "1304", name: "Encore", rarity: 5, element: "Fusion", weaponType: "Rectifier", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1304_UI.webp" },
      { id: "1305", name: "Verina", rarity: 5, element: "Spectro", weaponType: "Rectifier", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1305_UI.webp" },
      { id: "1501", name: "Jinhsi", rarity: 5, element: "Spectro", weaponType: "Broadblade", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1501_UI.webp" },
      { id: "1502", name: "Changli", rarity: 5, element: "Fusion", weaponType: "Sword", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconRoleHead256/T_IconRoleHead_1502_UI.webp" }
    ],
    weapons: [
      { id: "2104001", name: "Verdant Summit", rarity: 5, weaponType: "Broadblade", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104001_UI.webp" },
      { id: "2104002", name: "Stringmaster", rarity: 5, weaponType: "Rectifier", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104002_UI.webp" },
      { id: "2104003", name: "Ages of Harvest", rarity: 5, weaponType: "Broadblade", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104003_UI.webp" },
      { id: "2104004", name: "Blazing Brilliance", rarity: 5, weaponType: "Sword", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104004_UI.webp" },
      { id: "2101001", name: "Emerald of Genesis", rarity: 5, weaponType: "Sword", iconUrl: "https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2101001_UI.webp" }
    ]
  };
}

async function run() {
  console.log("Fetching game metadata from external provider...");
  const data = await fetchProviderData();
  
  const constantsDir = path.join(process.cwd(), 'lib', 'constants');
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }

  const charOutput = `import { CharacterMeta } from './types';

export const CHARACTERS: Record<string, CharacterMeta> = {
${data.characters.map(c => `  "${c.name}": ${JSON.stringify(c)}`).join(',\n')}
};

export function getCharacter(nameOrId: string): CharacterMeta | undefined {
  return Object.values(CHARACTERS).find(c => c.name === nameOrId || c.id === nameOrId);
}
`;

  const wepOutput = `import { WeaponMeta } from './types';

export const WEAPONS: Record<string, WeaponMeta> = {
${data.weapons.map(w => `  "${w.name}": ${JSON.stringify(w)}`).join(',\n')}
};

export function getWeapon(nameOrId: string): WeaponMeta | undefined {
  return Object.values(WEAPONS).find(w => w.name === nameOrId || w.id === nameOrId);
}
`;

  fs.writeFileSync(path.join(constantsDir, 'characters.ts'), charOutput);
  console.log("✅ Successfully generated lib/constants/characters.ts");

  fs.writeFileSync(path.join(constantsDir, 'weapons.ts'), wepOutput);
  console.log("✅ Successfully generated lib/constants/weapons.ts");
}

run().catch(console.error);
