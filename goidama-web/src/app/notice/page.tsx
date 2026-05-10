'use client';

import { ChevronLeft, Bell, Info, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link'; // 1. Link 추가

export default function NoticePage() {
  const router = useRouter();

  const notices = [
    { 
      id: 1, 
      category: '업데이트', 
      title: '버전 1.2.0 업데이트 안내', 
      content: '그룹 캡슐 초대 기능 및 음성 메시지 안정화 작업이 완료되었습니다.',
      date: '2024.03.20',
      icon: <Bell size={18} className="text-blue-500" />
    },
    { 
      id: 2, 
      category: '공지', 
      title: '서비스 정기 점검 안내 (03/25)', 
      content: '더 나은 서비스를 위해 새벽 2시부터 4시까지 점검이 예정되어 있습니다.',
      date: '2024.03.15',
      icon: <Info size={18} className="text-amber-500" />
    },
    { 
      id: 3, 
      category: '이벤트', 
      title: '신규 가입자 웰컴 스킨 증정', 
      content: '지금 첫 캡슐을 만들면 한정판 스킨을 드립니다.',
      date: '2024.03.10',
      icon: <Megaphone size={18} className="text-pink-500" />
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center px-4 h-16">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} className="text-[#111B27]" />
          </button>
          <h1 className="flex-1 text-center font-[900] text-[17px] text-[#111B27] mr-10">
            공지사항
          </h1>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="p-5 space-y-4">
        {notices.map((item, index) => (
          // 2. 각 아이템을 Link로 감싸기 (href 경로 주의)
          <Link href={`/notice/${item.id}`} key={item.id} className="block">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[11px] font-black tracking-widest text-gray-300 uppercase">
                  {item.category}
                </span>
                <span className="ml-auto text-[12px] text-gray-400 font-medium">
                  {item.date}
                </span>
              </div>
              
              <h2 className="font-[800] text-[17px] text-[#111B27] leading-tight">
                {item.title}
              </h2>
              
              <p className="mt-2 text-[14px] text-gray-500 leading-relaxed font-medium">
                {item.content}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="h-20" />
    </div>
  );
}