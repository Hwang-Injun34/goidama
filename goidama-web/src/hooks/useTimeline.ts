import { useState, useEffect, useCallback } from 'react';
import { capsuleService } from '@/services/capsule.service';
import { MonthlyTimelineResponse, CapsuleStatus } from '@/types/capsule';

/**
 * 월별로 그룹화된 타임라인 데이터를 관리하는 훅
 */
export const useTimeline = () => {
  const [data, setData] = useState<MonthlyTimelineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 정렬 기준: latest(최신순), dday(남은 시간순)
  const [sort, setSort] = useState<'latest' | 'dday'>('latest');
  
  // 상태 필터: ALL 또는 특정 CapsuleStatus
  const [filterStatus, setFilterStatus] = useState<CapsuleStatus | 'ALL'>('ALL');

  /**
   * 서버로부터 필터 및 정렬 조건에 맞는 타임라인 데이터를 호출합니다.
   */
  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      
      // ALL인 경우 서버에 status를 보내지 않음 (전체 조회)
      const statusParam = filterStatus === 'ALL' ? undefined : filterStatus;
      
      const res = await capsuleService.getTimeline({ 
        sort, 
        status: statusParam 
      });
      
      setData(res || []);
    } catch (err) {
      console.error("Timeline data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [sort, filterStatus]);

  /**
   * 정렬 조건이나 필터가 변경될 때마다 데이터를 동기화합니다.
   */
  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return { 
    data, 
    loading, 
    sort, 
    setSort, 
    filterStatus, 
    setFilterStatus, 
    refresh: fetchTimeline 
  };
};