import React, { useState } from 'react';
import { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTIONS } from '../utils/emotions';
import { Search, Heart, Sparkles, BookOpen, Compass, ChevronRight, Star } from 'lucide-react';

interface DiaryListProps {
  entries: DiaryEntry[];
  onSelectEntry: (entry: DiaryEntry) => void;
  onToggleFavorite: (id: string, currentFav: boolean) => void;
}

export const DiaryList: React.FC<DiaryListProps> = ({
  entries,
  onSelectEntry,
  onToggleFavorite,
}) => {
  const [filterEmotion, setFilterEmotion] = useState<EmotionType | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(entry => {
    const matchesEmotion = filterEmotion === '전체' || entry.emotion === filterEmotion;
    const matchesQuery =
      !searchQuery.trim() ||
      (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.aiResponse && entry.aiResponse.comfortMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesEmotion && matchesQuery;
  });

  return (
    <section className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs">
        {/* Emotion Filter segmented tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterEmotion('전체')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterEmotion === '전체'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            전체 ({entries.length})
          </button>
          {(Object.keys(EMOTIONS) as EmotionType[]).map(emotion => {
            const meta = EMOTIONS[emotion];
            const count = entries.filter(e => e.emotion === emotion).length;
            const isSelected = filterEmotion === emotion;

            return (
              <button
                key={emotion}
                onClick={() => setFilterEmotion(emotion)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-100/90 text-amber-950 font-semibold border border-amber-300/80 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="일기 내용 또는 검색어..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>
      </div>

      {/* Diary Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 mx-auto flex items-center justify-center text-amber-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-semibold text-stone-800 text-base">
            {searchQuery || filterEmotion !== '전체'
              ? '조건에 맞는 일기가 없습니다.'
              : '아직 작성된 일기가 없습니다.'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
            {searchQuery || filterEmotion !== '전체'
              ? '다른 감정이나 검색어로 찾아보세요.'
              : '오늘 하루 마음에 담아두었던 생각들을 위의 작성창에 편안하게 적어보세요. AI 비서가 다정하게 기다리고 있어요.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map(entry => {
            const meta = EMOTIONS[entry.emotion] || EMOTIONS['기쁨'];

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-300 hover:shadow-md p-5 transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Metadata Row: Clean unboxed typography with separator discipline */}
                  <div className="flex items-center justify-between text-xs text-stone-500 pb-2.5 mb-2.5 border-b border-stone-100 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span>{meta.emoji}</span>
                      <span className="font-semibold text-stone-800">{meta.label}</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span>{entry.date}</span>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onToggleFavorite(entry.id, !!entry.favorite);
                      }}
                      className="text-stone-300 hover:text-amber-500 transition-colors p-1"
                      title={entry.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          entry.favorite ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & snippet */}
                  <h4 className="font-serif font-semibold text-stone-900 text-sm group-hover:text-amber-900 transition-colors line-clamp-1 mb-1.5">
                    {entry.title || `${entry.date}의 마음`}
                  </h4>

                  <p className="text-xs text-stone-600 font-serif leading-relaxed line-clamp-3 mb-4">
                    {entry.content}
                  </p>
                </div>

                {/* AI Warm Snippet Footer */}
                {entry.aiResponse ? (
                  <div className="pt-3 border-t border-stone-100 bg-amber-50/40 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden text-stone-700">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate font-sans font-medium text-[11px] text-amber-950">
                        {entry.aiResponse.actionSuggestion.title || entry.aiResponse.quote}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 font-sans font-medium shrink-0 flex items-center group-hover:translate-x-0.5 transition-transform">
                      답장 읽기 <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                ) : (
                  <div className="pt-2 text-[11px] text-stone-400 font-sans text-right">
                    일기 펼쳐보기 →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
