'use client';

import { useState } from 'react';
import ScreenHeader from '@/components/layout/ScreenHeader';
import Button from '@/components/ui/Button';
import { MessageSquareShare } from 'lucide-react';

export default function FeedbackPage() {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    alert("소중한 의견 감사합니다! 검토 후 반영하겠습니다.");
    setText('');
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScreenHeader title="피드백" />
      <div className="flex-1 p-8 space-y-8">
        <div className="text-center py-10 space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto">
            <MessageSquareShare size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">어떤 점이 궁금하거나<br/>불편하셨나요?</h2>
          <p className="text-gray-400 text-sm font-medium">보내주신 의견은 서비스 개선에 큰 도움이 됩니다.</p>
        </div>

        <textarea
          className="w-full h-64 p-6 bg-gray-50 rounded-[32px] outline-none resize-none font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 transition-all border border-transparent"
          placeholder="자유롭게 의견을 남겨주세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="p-8">
        <Button onClick={handleSubmit} disabled={!text.trim()}>의견 보내기</Button>
      </div>
    </div>
  );
}