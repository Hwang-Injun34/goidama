'use client';

import { useState } from 'react';
import { capsuleService } from '@/services/capsule.service';
import { useCapsuleStore } from '@/store/capsuleStore';
import { useUIStore } from '@/store/uiStore'; 
import { useRouter } from 'next/navigation';

/**
 * 캡슐 생성 프로세스(기본 생성, 콘텐츠 업로드, 최종 봉인)를 관리하는 훅
 */
export const useCapsuleCreate = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // 스토어에서 capsuleId와 setCapsuleId를 직접 가져옵니다.
  const { 
    setTempData, 
    setCapsuleId, 
    resetTempData, 
    tempData, 
    capsuleId 
  } = useCapsuleStore();
  
  const { setActiveTab } = useUIStore();

  /**
   * 1. 캡슐 기본 정보 생성
   * 제목, 개봉일, 참여자 등을 서버에 등록합니다.
   */
  const createBase = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        title: data.title.trim(),
        open_at: data.openAt,
        is_group: data.isGroup,
        friend_ids: data.isGroup ? (data.friendIds || []) : [], 
        skin_id: Number(data.skinId) || 1,
        visibility: data.visibility || "friends",
        latitude: null,
        longitude: null
      };

      const res = await capsuleService.create(payload);
      
      // 서비스 레이어의 반환 타입에 맞춰 ID 추출
      const newId = res?.id;
      
      if (newId) {
        // [에러 해결] setTempData가 아니라 setCapsuleId를 사용합니다.
        setCapsuleId(newId); 
        return newId;
      }
      return null;
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = "입력값이 올바르지 않습니다.";
      
      if (errorData?.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail[0]?.msg || errorMessage;
        }
      }
      
      console.log("Capsule creation failed:", errorData?.detail);
      alert(errorMessage); 
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. 추억 내용 업로드
   * 작성한 글과 선택한 사진들을 서버에 전송합니다.
   */
  const addContent = async (id: string, text: string, images: File[], repIndex: number) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('rep_index', repIndex.toString());
      images.forEach(img => formData.append('files', img));
      
      await capsuleService.addContent(id, formData);
      return true;
    } catch (err) {
      console.log("Content upload failed:", err);
      alert("추억을 저장하지 못했습니다.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. 생성 프로세스 최종 완료
   * 개인은 즉시 봉인, 공동은 초대장 발송 처리를 수행합니다.
   */
  const finishCreation = async (lat?: number, lon?: number) => {
    // [에러 해결] tempData.capsuleId 대신 스토어의 capsuleId를 직접 사용합니다.
    const targetId = capsuleId; 
    if (!targetId) return;

    setLoading(true);
    try {
      if (!tempData.isGroup) {
        // --- 개인 캡슐: 위치 정보와 함께 즉시 봉인 ---
        if (!lat || !lon) {
          alert("위치 정보가 필요합니다.");
          return;
        }
        await capsuleService.lock(targetId, lat, lon);
        alert("나만의 추억이 안전하게 봉인되었습니다.");
        setActiveTab('map'); 
      } else {
        // --- 공동 캡슐: 초대장 발송 후 수락 대기 상태로 전환 ---
        alert("친구들에게 초대장을 보냈습니다. 모든 멤버가 수락하면 봉인이 가능합니다.");
        setActiveTab('timeline'); 
      }

      // 4. 스토어 초기화 및 홈 리다이렉트
      resetTempData();
      router.replace('/home');
      return true;
    } catch (err: any) {
      console.log("Final processing failed:", err);
      const msg = err.response?.data?.detail || "처리에 실패했습니다. 다시 시도해 주세요.";
      alert(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    createBase, 
    addContent, 
    finishCreation, 
    loading, 
    capsuleId // 스토어의 현재 ID 값을 반환
  };
};