'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // 개발 도구 (옵션)
import { queryClient } from '@/lib/queryClient';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 보이는 쿼리 디버깅 도구 (나중에 삭제 가능) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}