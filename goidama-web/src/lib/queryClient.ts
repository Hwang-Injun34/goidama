import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터가 "신선하다"고 간주되는 시간 (단위: 밀리초)
      // 1분(60000ms) 동안은 서버에 다시 묻지 않고 캐시된 데이터를 사용합니다.
      staleTime: 60 * 1000, 

      // 데이터 캐시 유지 시간
      // 해당 데이터를 사용하는 컴포넌트가 없어져도 5분간은 메모리에 보관합니다.
      gcTime: 5 * 60 * 1000, 

      // API 요청 실패 시 재시도 횟수
      // 네트워크 일시 오류 등을 대비해 1번 더 시도합니다.
      retry: 1,

      // 윈도우 포커스 시 자동 새로고침 방지
      // 사용자가 브라우저 탭을 나갔다 들어올 때마다 API를 쏘는 것을 막습니다.
      refetchOnWindowFocus: false,
      
      // 네트워크 재연결 시 자동 새로고침
      refetchOnReconnect: true,
    },
    mutations: {
      // 생성/수정/삭제 시 에러가 나면 굳이 재시도하지 않습니다. (사용자 중복 클릭 방지)
      retry: false,
    },
  },
});