import CapsuleDetailView from '@/components/features/capsule/detail/CapsuleDetailView';

// 1. Props 타입을 Promise로 정의
interface PageProps {
  params: Promise<{ id: string }>;
}

// 2. async 함수로 변경하여 params를 await 함
export default async function CapsuleDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 디버깅: 서버 터미널에 ID가 잘 찍히는지 확인
  console.log("📍 진입하려는 캡슐 ID:", id);

  if (!id || id === 'undefined') {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 font-bold">
        잘못된 접근입니다. (ID 미전달)
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <CapsuleDetailView id={id} />
    </main>
  );
}