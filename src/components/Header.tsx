import React, { useState } from 'react';
import { BookHeart, ShieldCheck, Database, Info, Sparkles } from 'lucide-react';
import { isFirebaseConnected } from '../lib/firebase';

interface HeaderProps {
  diaryCount: number;
  onOpenInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ diaryCount, onOpenInfoModal }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const todayStr = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-100/90 text-amber-800 flex items-center justify-center shadow-xs border border-amber-200/60">
            <BookHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-semibold text-stone-900 tracking-tight">
                따뜻한 하루 일기
              </h1>
              <span className="text-[11px] font-sans font-medium text-amber-900/80 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded">
                AI 마음 비서
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans">
              오늘의 감정을 털어놓고 내일을 위한 다정한 응원을 받아보세요
            </p>
          </div>
        </div>

        {/* Right side status & action items */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs text-stone-600">
          {/* Today date */}
          <span className="text-stone-500 font-sans hidden md:inline">
            {todayStr}
          </span>

          <span className="hidden md:inline text-stone-300" aria-hidden="true">·</span>

          {/* Database & Security info triggers */}
          <button
            onClick={onOpenInfoModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 text-stone-600 transition-colors"
            title="보안 및 Firebase 데이터베이스 설정 안내"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-[11px]">보안 & DB 연동</span>
          </button>

          {/* Diary count indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100/80 text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-sans text-[11px]">
              기록 <strong className="text-stone-900 font-semibold">{diaryCount}</strong>편
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
