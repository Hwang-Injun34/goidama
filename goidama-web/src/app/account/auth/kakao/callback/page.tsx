import { Suspense } from 'react';
import KakaoCallbackContent from '@/components/features/auth/KakaoCallbackContent';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: '인증 중... | 고이다마',
};

export default function KakaoCallbackPage() {
  return (
    /**
     * useSearchParams()가 포함된 컴포넌트는 Suspense로 감싸야 
     * 클라이언트 사이드에서 안전하게 파라미터를 읽어올 수 있습니다.
     */
    <Suspense 
      fallback={
        <div className="h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 text-blue-200 animate-spin" />
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}