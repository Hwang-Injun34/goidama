'use client';

import { ChevronLeft, Calendar, Share2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams(); // URL에서 id값을 가져옵니다 (예: /notice/1 이면 1)

  // 실제로는 여기서 DB나 API에서 데이터를 가져오겠지만, 
  // 지금은 테스트용으로 가짜 데이터를 만듭니다.
  const noticeDetail = {
    title: '버전 1.2.0 업데이트 안내',
    date: '2024.03.20',
    category: '업데이트',
    content: `
      안녕하세요. 고이다마 팀입니다.
      이번 1.2.0 업데이트에서는 많은 분들이 요청해주신 기능을 추가했습니다.

      1. 그룹 캡슐 초대 기능 개선
      이제 카카오톡을 통해 친구를 더 쉽게 초대할 수 있습니다.

      2. 음성 메시지 녹음 최적화
      녹음 시 발생하던 잡음을 제거하고 음질을 개선했습니다.

      3. 기타 버그 수정
      알림이 오지 않던 문제를 해결했습니다.

      항상 소중한 추억을 고이 간직할 수 있도록 노력하겠습니다.
      감사합니다.
    `
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => router.back()} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[16px] font-[800]">공지사항</h1>
          <button className="p-2 opacity-30">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8"
      >
        {/* 제목 섹션 */}
        <div className="mb-8">
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            {noticeDetail.category}
          </span>
          <h2 className="mt-4 text-[24px] font-[900] text-[#111B27] leading-tight">
            {noticeDetail.title}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-gray-400">
            <Calendar size={14} />
            <span className="text-[13px] font-medium">{noticeDetail.date}</span>
          </div>
        </div>

        {/* 본문 섹션 */}
        <div className="prose prose-sm max-w-none">
          <p className="text-[15px] text-[#4B5563] leading-[1.8] whitespace-pre-wrap font-medium">
            {noticeDetail.content}
          </p>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <button 
            onClick={() => router.push('/notice')}
            className="w-full h-14 rounded-2xl bg-gray-50 text-gray-500 font-bold text-[15px] hover:bg-gray-100 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  );
}