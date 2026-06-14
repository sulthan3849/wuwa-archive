import { WeaponMeta } from './types';

export const WEAPONS: Record<string, WeaponMeta> = {
  "Verdant Summit": {"id":"2104001","name":"Verdant Summit","rarity":5,"weaponType":"Broadblade","iconUrl":"https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104001_UI.webp"},
  "Stringmaster": {"id":"2104002","name":"Stringmaster","rarity":5,"weaponType":"Rectifier","iconUrl":"https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104002_UI.webp"},
  "Ages of Harvest": {"id":"2104003","name":"Ages of Harvest","rarity":5,"weaponType":"Broadblade","iconUrl":"https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104003_UI.webp"},
  "Blazing Brilliance": {"id":"2104004","name":"Blazing Brilliance","rarity":5,"weaponType":"Sword","iconUrl":"https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2104004_UI.webp"},
  "Emerald of Genesis": {"id":"2101001","name":"Emerald of Genesis","rarity":5,"weaponType":"Sword","iconUrl":"https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon_2101001_UI.webp"}
};

export function getWeapon(nameOrId: string): WeaponMeta | undefined {
  return Object.values(WEAPONS).find(w => w.name === nameOrId || w.id === nameOrId);
}
