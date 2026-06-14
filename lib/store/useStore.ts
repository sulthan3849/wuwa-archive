import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  activeUid: string | null;
  activeBannerTab: number;
  setActiveUid: (uid: string) => void;
  setActiveBannerTab: (tabId: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeUid: null,
      activeBannerTab: 4, // Default to Featured Resonator
      setActiveUid: (uid) => set({ activeUid: uid }),
      setActiveBannerTab: (tabId) => set({ activeBannerTab: tabId }),
    }),
    {
      name: 'wuwa-archive-storage',
    }
  )
);
