'use client';

import { useState, useEffect } from 'react';
import { 
  UserRound, MapPin, Lock, BookOpen, Sparkles, 
  X, ChevronLeft, ChevronRight, Download, Heart,
  Users, Calendar, CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function OpenedState({ capsule }: { capsule: any }) {
  const [selectedImages, setSelectedImages] = useState<any[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const contents = capsule?.contents || [];
  const participants = capsule?.participants || [];
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 🎊 1. 개봉 축하 효과 (라벤더 톤)
  useEffect(() => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#8B7FD4', '#C4B5FD', '#FFFFFF'];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  // 💾 2. 이미지 다운로드 핸들러
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `goidama-memory-${Date.now()}.jpg`;
      link.click();
    } catch (err) { alert('이미지 다운로드에 실패했습니다.'); }
  };

  if (!capsule) return null;

  return (
    <div className="min-h-[80vh] bg-white px-6 pb-20 relative">
      
      {/* ── 1. 상단 비주얼 영역 (LockedState와 동일한 틀) ── */}
      <section className="pt-12 pb-10 flex flex-col items-center relative">
        <div className="absolute top-10 w-32 h-32 bg-brand-lavender-100/40 blur-[50px] -z-10 rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-6"
        >
          {/* 캡슐 아이콘 박스: 개봉된 스킨 적용 */}
          <div className="w-28 h-28 bg-white rounded-[32px] border border-brand-lavender-100 shadow-card flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-surface opacity-50" />
            <img
              src={`/images/skins/skin-${capsule.skin_id || 1}-opened.png`}
              alt="capsule"
              className="w-24 h-24 object-contain relative z-10 drop-shadow-md"
            />
          </div>
          
          {/* 하단 배지: 하트 아이콘으로 교체 (열린 추억 상징) */}
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-brand-lavender-600 flex items-center justify-center text-white border-[3px] border-white shadow-sm">
            <Heart size={14} fill="currentColor" strokeWidth={2.5} />
          </div>
        </motion.div>

        <div className="text-center space-y-1">
          <h1 className="text-[22px] font-bold text-brand-text tracking-tighter">
            {capsule.title}
          </h1>
          <p className="text-[12px] text-brand-lavender-400 font-bold uppercase tracking-widest">
            Memory Unlocked
          </p>
        </div>
      </section>

      {/* ── 2. 정보 바 (개봉일 | 위치 | 인연) ── */}
      <section className="max-w-md mx-auto mb-10">
        <div className="bg-brand-surface border border-brand-lavender-100 rounded-2xl py-5 flex items-center shadow-sm">
          {/* 개봉일 */}
          <div className="flex-1 flex flex-col items-center border-r border-brand-lavender-100/50">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <CalendarCheck size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Open Date</span>
            </div>
            <p className="text-[13px] font-bold text-brand-text">
              {new Date(capsule.open_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* 위치 */}
          <div className="flex-1 flex flex-col items-center border-r border-brand-lavender-100/50 px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <MapPin size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
            </div>
            <p className="text-[13px] font-bold text-brand-text truncate w-full text-center">
              {capsule.address?.split(' ')[1] || '장소'}
            </p>
          </div>

          {/* 함께한 인연 */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-brand-light">
              <Users size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">With</span>
            </div>
            <div className="flex -space-x-1.5">
              {participants.slice(0, 3).map((p: any, i: number) => (
                <div key={i} className="w-5 h-5 rounded-full border border-white bg-brand-surface overflow-hidden">
                  {p.profile_image_url ? (
                    <img src={getFullUrl(p.profile_image_url)} className="w-full h-full object-cover" />
                  ) : ( <UserRound size={10} className="text-brand-lavender-200 mx-auto mt-0.5" /> )}
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-5 h-5 rounded-full border border-white bg-brand-lavender-600 flex items-center justify-center text-[7px] text-white font-bold">
                  +{participants.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 본문 피드 리스트 ── */}
      <main className="max-w-md mx-auto space-y-12">
        {contents.map((content: any, index: number) => (
          <motion.article 
            key={content.id || index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* 📸 페이스북 스타일 포토 그리드 */}
            <PhotoGrid 
              images={content.images || []} 
              getFullUrl={getFullUrl} 
              onImageClick={(idx) => {
                setSelectedImages(content.images);
                setCurrentIndex(idx);
              }} 
            />

            {/* ✍️ 메시지 영역 (LockedState의 카드 스타일 응용) */}
            <div className="px-1 relative">
              <div className="w-8 h-[2.5px] bg-brand-lavender-600 rounded-full mb-4" />
              <p className="text-[16px] leading-[1.8] text-brand-text/90 whitespace-pre-wrap font-medium tracking-tight">
                {content.text}
              </p>
            </div>
          </motion.article>
        ))}
      </main>

      {/* ── 🔍 풀스크린 라이트박스 ── */}
      <AnimatePresence>
        {selectedImages && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* 라이트박스 상단 컨트롤 */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-[110] pt-safe">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {selectedImages.length}
              </span>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleDownload(getFullUrl(selectedImages[currentIndex].image_url))}
                  className="p-2 text-white/70 hover:text-white"
                >
                  <Download size={24} />
                </button>
                <button onClick={() => setSelectedImages(null)} className="p-2 text-white/70 hover:text-white">
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* 좌우 내비게이션 */}
            {selectedImages.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : selectedImages.length - 1))}
                  className="absolute left-4 p-3 text-white/50 hover:text-white z-[110]"
                >
                  <ChevronLeft size={40} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setCurrentIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 p-3 text-white/50 hover:text-white z-[110]"
                >
                  <ChevronRight size={40} strokeWidth={1.5} />
                </button>
              </>
            )}

            {/* 메인 이미지 */}
            <motion.img 
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              src={getFullUrl(selectedImages[currentIndex].image_url)}
              className="max-w-[95%] max-h-[75vh] object-contain select-none shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 📸 PhotoGrid 컴포넌트 (페이스북 스타일) ──
function PhotoGrid({ images, getFullUrl, onImageClick }: { images: any[], getFullUrl: (u: string) => string, onImageClick: (i: number) => void }) {
  const count = images.length;
  if (count === 0) return null;

  const baseStyle = "relative w-full rounded-[28px] overflow-hidden border border-brand-lavender-100 bg-brand-surface grid gap-1 cursor-pointer shadow-card";

  if (count === 1) {
    return (
      <div className={baseStyle} onClick={() => onImageClick(0)}>
        <img src={getFullUrl(images[0].image_url)} className="w-full h-auto max-h-[500px] object-cover" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={`${baseStyle} grid-cols-2 aspect-[4/3]`} onClick={() => onImageClick(0)}>
        {images.map((img, i) => (
          <img key={i} src={getFullUrl(img.image_url)} className="w-full h-full object-cover" onClick={(e) => { e.stopPropagation(); onImageClick(i); }} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={`${baseStyle} grid-cols-2 grid-rows-2 aspect-[4/3]`}>
        <img src={getFullUrl(images[0].image_url)} className="w-full h-full object-cover col-span-2" onClick={() => onImageClick(0)} />
        <img src={getFullUrl(images[1].image_url)} className="w-full h-full object-cover" onClick={() => onImageClick(1)} />
        <img src={getFullUrl(images[2].image_url)} className="w-full h-full object-cover" onClick={() => onImageClick(2)} />
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className={`${baseStyle} grid-cols-2 grid-rows-2 aspect-square`}>
        {images.map((img, i) => (
          <img key={i} src={getFullUrl(img.image_url)} className="w-full h-full object-cover" onClick={() => onImageClick(i)} />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseStyle} grid-cols-6 grid-rows-2 aspect-[4/3]`}>
      <img src={getFullUrl(images[0].image_url)} className="w-full h-full object-cover col-span-3 row-span-2" onClick={() => onImageClick(0)} />
      <img src={getFullUrl(images[1].image_url)} className="w-full h-full object-cover col-span-3 row-span-1" onClick={() => onImageClick(1)} />
      <img src={getFullUrl(images[2].image_url)} className="w-full h-full object-cover col-span-1 row-span-1" onClick={() => onImageClick(2)} />
      <img src={getFullUrl(images[3].image_url)} className="w-full h-full object-cover col-span-1 row-span-1" onClick={() => onImageClick(3)} />
      <div className="relative col-span-1 row-span-1" onClick={() => onImageClick(4)}>
        <img src={getFullUrl(images[4].image_url)} className="w-full h-full object-cover" />
        {count > 5 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">+{count - 5}</div>
        )}
      </div>
    </div>
  );
}