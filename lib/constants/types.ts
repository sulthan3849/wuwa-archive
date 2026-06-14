export interface CharacterMeta {
  id: string; // The numeric ID or exactly matching name string from API
  name: string;
  rarity: number;
  element: 'Aero' | 'Glacio' | 'Fusion' | 'Electro' | 'Spectro' | 'Havoc' | 'Unknown';
  weaponType: 'Sword' | 'Broadblade' | 'Pistols' | 'Gauntlets' | 'Rectifier' | 'Unknown';
  iconUrl: string;
}

export interface WeaponMeta {
  id: string;
  name: string;
  rarity: number;
  weaponType: 'Sword' | 'Broadblade' | 'Pistols' | 'Gauntlets' | 'Rectifier' | 'Unknown';
  iconUrl: string;
}
