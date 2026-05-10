import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TabType = 'home' | 'map' | 'create' | 'timeline' | 'friends' | 'profile';

interface UIState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  prevTab: TabType | null;
  isHeaderVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;
  isBottomTabVisible: boolean;
  setBottomTabVisible: (visible: boolean) => void;
  isGlobalLoading: boolean;
  setGlobalLoading: (isLoading: boolean) => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activeTab: 'home',
      prevTab: null,

      setActiveTab: (tab) => {
        const currentTab = get().activeTab;
        if (currentTab === tab) return;
        
        set({ 
          prevTab: currentTab,
          activeTab: tab 
        });
      },

      isHeaderVisible: true,
      setHeaderVisible: (visible) => set({ isHeaderVisible: visible }),

      isBottomTabVisible: true,
      setBottomTabVisible: (visible) => set({ isBottomTabVisible: visible }),

      isGlobalLoading: false,
      setGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),

      unreadNotificationCount: 0,
      setUnreadNotificationCount: (count) => set({ unreadNotificationCount: count }),
    }),
    {
      name: 'goidama-ui-storage', // 브라우저 저장소에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // localStorage 사용
      // 보관하고 싶은 상태만 골라서 저장 (로딩 상태 등은 제외 가능)
      partialize: (state) => ({ 
        activeTab: state.activeTab 
      }), 
    }
  )
);