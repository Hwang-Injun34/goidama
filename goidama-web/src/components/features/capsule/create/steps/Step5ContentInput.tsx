'use client';

import { Plus, X, Star, AlertCircle, Image as ImageIcon, MessageSquare, Sparkles} from 'lucide-react';
import { useCapsuleStore } from '@/store/capsuleStore';
import { useCapsuleCreate } from '@/hooks/useCapsuleCreate';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onNext: () => void;
}

export default function Step5ContentInput({ onNext }: Props) {
  const { tempData, setTempData } = useCapsuleStore();
  const { addContent, loading, capsuleId } = useCapsuleCreate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (tempData.images.length + files.length > 5) {
      alert('사진은 최대 5장까지 업로드할 수 있습니다.');
      return;
    }
    setTempData({ images: [...tempData.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = tempData.images.filter((_, i) => i !== index);
    const newRepIndex = tempData.repIndex >= newImages.length ? 0 : tempData.repIndex;
    setTempData({ images: newImages, repIndex: newRepIndex });
  };

  const handleUpload = async () => {
    if (!capsuleId) {
      alert('캡슐 정보가 유실되었습니다. 처음부터 다시 진행해주세요.');
      return;
    }
    const success = await addContent(capsuleId, tempData.text, tempData.images, tempData.repIndex);
    if (success) onNext();
  };

  const isDisabled = tempData.images.length === 0 || !tempData.text.trim() || !capsuleId;

  return (
    <div className="flex flex-col h-full py-4">
      {/* ── 상단 텍스트 영역 ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-lavender-50 text-brand-lavender-600 mb-3">
          <Sparkles size={12} strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Final Step</span>
        </div>
        <h2 className="text-[28px] font-bold leading-[1.3] text-brand-text tracking-tighter">
          마지막으로<br />
          <span className="text-brand-lavender-600">추억을 고이 채워주세요</span>
        </h2>
        <p className="mt-2 text-brand-subtext text-[15px] font-medium leading-relaxed">
          소중한 순간이 담긴 사진과<br />진심 어린 메시지를 남겨보세요.
        </p>
      </div>

      {/* ── 에러 알림 ── */}
      {!capsuleId && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-500 animate-pulse">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-[12px] font-bold leading-tight">
            캡슐 정보가 유실되었습니다.<br />이전 단계로 돌아가 다시 시도해주세요.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-6">
        {/* ── 사진 갤러리 영역 ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-brand-lavender-400">
              <ImageIcon size={14} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Gallery ({tempData.images.length}/5)</span>
            </div>
            {tempData.images.length > 0 && (
              <span className="text-[10px] font-bold text-brand-lavender-600 uppercase tracking-tighter">★ 대표 사진 선택</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <AnimatePresence>
              {tempData.images.map((file, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-2xl overflow-hidden group border border-brand-lavender-100 shadow-sm bg-brand-surface"
                >
                  <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  
                  {/* 대표 이미지 선택용 별 버튼 */}
                  <button
                    type="button"
                    onClick={() => setTempData({ repIndex: idx })}
                    className={`absolute left-2 top-2 rounded-full p-1.5 shadow-md transition-all ${
                      tempData.repIndex === idx ? 'bg-brand-lavender-600 text-white scale-110' : 'bg-white/90 text-brand-lavender-400'
                    }`}
                  >
                    <Star size={10} fill={tempData.repIndex === idx ? 'currentColor' : 'none'} strokeWidth={3} />
                  </button>

                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-2 top-2 rounded-full bg-black/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>

                  {tempData.repIndex === idx && (
                    <div className="absolute bottom-0 left-0 right-0 bg-brand-lavender-600/90 backdrop-blur-sm py-1 text-center">
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Main</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 사진 추가 버튼 */}
            {tempData.images.length < 5 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-lavender-100 bg-brand-surface text-brand-lavender-300 transition-all hover:border-brand-lavender-300 hover:text-brand-lavender-600 active:scale-95">
                <Plus size={24} strokeWidth={2} />
                <span className="mt-1 text-[10px] font-bold uppercase tracking-tighter">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </section>

        {/* ── 메시지 입력 영역 ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-brand-lavender-400 px-1">
            <MessageSquare size={14} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Message</span>
          </div>
          <textarea
            value={tempData.text}
            onChange={(e) => setTempData({ text: e.target.value })}
            placeholder="미래의 나에게 혹은 인연에게 전하고 싶은 진심을 고이 담아주세요."
            className="h-44 w-full resize-none rounded-[24px] border border-brand-lavender-100 bg-brand-surface p-6 font-medium text-brand-text placeholder:text-brand-light outline-none transition-all focus:bg-white focus:ring-2 focus:ring-brand-lavender-100 text-[15px] leading-relaxed"
          />
        </section>
      </div>

      {/* ── 하단 버튼 영역 ── */}
      <div className="pt-6 pb-10">
        <Button
          variant="primary"
          onClick={handleUpload}
          isLoading={loading}
          disabled={isDisabled}
        >
          {loading ? '추억을 고이 담는 중...' : '추억 담기 완료'}
        </Button>
        <p className="mt-4 text-center text-[10px] font-bold text-brand-light uppercase tracking-[0.3em]">
          Ready to Seal your moment
        </p>
      </div>
    </div>
  );
}