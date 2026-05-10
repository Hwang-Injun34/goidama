import NotificationView from '@/components/features/notification/NotificationView';

export const metadata = {
  title: '알림 | 고이다마',
};

export default function NotificationPage() {
  return (
    /**
     * 레이아웃 상 필요한 래퍼(Wrapper) 정도만 여기서 처리합니다.
     */
    <main className="h-screen bg-white">
      <NotificationView />
    </main>
  );
}