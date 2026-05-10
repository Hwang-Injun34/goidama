import { useRouter } from 'next/navigation';
import { capsuleService } from '@/services/capsule.service';
import { useUIStore } from '@/store/uiStore';
import { CapsuleStatus } from '@/types/capsule';

/**
 * 캡슐 관련 주요 액션을 처리하는 커스텀 훅
 */
export const useCapsule = () => {
  const router = useRouter();
  const { setActiveTab } = useUIStore();

  /**
   * 캡슐 삭제 처리
   * @param id 캡슐 UUID
   * @param status 현재 캡슐 상태
   */
  const deleteCapsule = async (id: string, status: CapsuleStatus | string) => {
    const s = status.toUpperCase() as CapsuleStatus;

    // 1. 상태 권한 체크: 봉인 중이거나 개봉 대기 중일 때는 삭제 불가 정책 적용
    if (s === 'LOCKED' || s === 'AVAILABLE') {
      alert("약속을 지키기 위해 봉인 중에는 삭제할 수 없습니다. 개봉일 이후에 삭제해 주세요.");
      return;
    }

    if (!confirm("정말로 이 기록을 삭제하시겠습니까? 담겨있던 모든 글과 사진이 영구히 삭제됩니다.")) {
      return;
    }

    try {
      await capsuleService.delete(id);
      
      if (s === 'PENDING') {
        alert("기록이 삭제되었습니다. 오늘의 생성 가능 횟수가 복구되었습니다.");
      } else {
        alert("기록이 성공적으로 삭제되었습니다.");
      }
      
      // 2. 삭제 성공 후 타임라인 탭으로 리다이렉트
      setActiveTab('timeline');
      router.replace('/home?tab=timeline');
      
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = "삭제 권한이 없거나 요청에 실패했습니다.";

      if (errorData?.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail[0]?.msg || errorMessage;
        }
      }
      alert(errorMessage);
    }
  };

  return { deleteCapsule };
};