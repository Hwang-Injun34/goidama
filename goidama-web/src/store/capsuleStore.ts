import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { capsuleService } from '@/services/capsule.service';
import { InvitationResponse } from '@/types/capsule';

// 1. 캡슐 생성 중 임시 보관할 데이터 구조
interface CapsuleTempData {
  title: string;
  openAt: string;     // ISO String
  isGroup: boolean;
  visibility: 'friends' | 'private';
  skinId: number;
  text: string;
  images: File[];      // 로컬 업로드용 파일 객체 (저장 대상 제외)
  repIndex: number;
  friendIds: string[]; // 초대할 친구들의 UUID 목록
}

// 2. 스토어 전체 인터페이스
interface CapsuleStore {
  // 생성 관련
  tempData: CapsuleTempData;
  capsuleId: string | null; 
  setTempData: (data: Partial<CapsuleTempData>) => void;
  setCapsuleId: (id: string | null) => void;
  resetTempData: () => void;

  // 초대 관리 관련
  invitations: InvitationResponse[];
  isLoadingInvitations: boolean;
  fetchInvitations: () => Promise<void>;
  respondToInvitation: (participantId: number, accept: boolean) => Promise<void>;
}

const initialData: CapsuleTempData = {
  title: '',
  openAt: '',
  isGroup: false,
  visibility: 'friends',
  skinId: 1,
  text: '',
  images: [],
  repIndex: 0,
  friendIds: [],
};

export const useCapsuleStore = create<CapsuleStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      tempData: initialData,
      capsuleId: null,
      invitations: [],
      isLoadingInvitations: false,

      // 3. 생성 액션 구현
      setTempData: (data) => 
        set((state) => ({ tempData: { ...state.tempData, ...data } })),

      setCapsuleId: (id) => set({ capsuleId: id }),

      resetTempData: () => set({ 
        tempData: initialData, 
        capsuleId: null 
      }),

      // 4. 초대 관리 액션 구현
      fetchInvitations: async () => {
        set({ isLoadingInvitations: true });
        try {
          const data = await capsuleService.getInvitations();
          set({ invitations: data });
        } catch (error) {
          console.error("Failed to fetch invitations:", error);
        } finally {
          set({ isLoadingInvitations: false });
        }
      },

      respondToInvitation: async (participantId: number, accept: boolean) => {
        try {
          await capsuleService.respondInvitation(participantId, accept);
          // 성공 시 로컬 상태 업데이트 (목록에서 제거)
          set((state) => ({
            invitations: state.invitations.filter(i => i.participant_id !== participantId)
          }));
        } catch (error) {
          console.error("Failed to respond to invitation:", error);
          throw error;
        }
      },
    }),
    {
      name: 'capsule-creation-session',
      // 💡 핵심: File 객체는 스토리지에 저장 불가하므로 images는 제외
      // invitations와 로딩 상태 역시 실시간 데이터이므로 제외
      partialize: (state) => ({
        tempData: { 
          ...state.tempData, 
          images: [] 
        },
        capsuleId: state.capsuleId, 
      }),
    }
  )
);