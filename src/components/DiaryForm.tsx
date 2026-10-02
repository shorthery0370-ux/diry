import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, HeartHandshake, Loader2, PenLine, Lightbulb } from 'lucide-react';
import { EmotionType, DiaryEntry } from '../types/diary';
import { EMOTIONS, PROMPT_QUESTIONS } from '../utils/emotions';

interface DiaryFormProps {
  onSubmit: (entry: { title: string; content: string; emotion: EmotionType; date: string }) => Promise<void>;
  isLoading: boolean;
  selectedEmotion: EmotionType;
  onEmotionChange: (emotion: EmotionType) => void;
}

export const DiaryForm: React.FC<DiaryFormProps> = ({
  onSubmit,
  isLoading,
  selectedEmotion,
  onEmotionChange,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    '당신의 오늘 하루를 찬찬히 읽고 있어요...',
    '마음을 담은 다정한 위로를 적는 중입니다...',
    '내일을 위한 작은 긍정 행동을 정성스레 찾고 있어요...',
    '따뜻한 온기를 담아 답장을 완성하고 있어요...',
  ];

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    await onSubmit({
      title: title.trim() || `${date}의 마음 일기`,
      content: content.trim(),
      emotion: selectedEmotion,
      date,
    });
  };

  const handlePromptClick = (question: string) => {
    setContent(prev => {
      if (!prev.trim()) return question + '\n';
      return `${prev}\n\nQ. ${question}\n`;
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden transition-all">
      {/* Form header strip */}
      <div className="bg-stone-50/70 border-b border-stone-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-amber-700" />
          <h2 className="text-sm font-semibold text-stone-900 font-sans">
            오늘의 마음 일기 작성하기
          </h2>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-white px-3 py-1.5 rounded-lg border border-stone-200">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-stone-700 font-sans focus:outline-none cursor-pointer"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Step 1: Emotion Selection */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-sans">
            1. 오늘의 내 감정 선택하기
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(EMOTIONS) as EmotionType[]).map(emotionKey => {
              const meta = EMOTIONS[emotionKey];
              const isSelected = selectedEmotion === emotionKey;

              return (
                <button
                  key={emotionKey}
                  type="button"
                  onClick={() => onEmotionChange(emotionKey)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? `${meta.bgColor} ${meta.borderColor} ring-2 ring-amber-400/40 shadow-xs font-semibold`
                      : 'border-stone-200/90 bg-white hover:bg-stone-50/80 text-stone-600'
                  }`}
                >
                  <span className="text-2xl mb-1 select-none" role="img" aria-label={meta.label}>
                    {meta.emoji}
                  </span>
                  <span className={`text-sm ${isSelected ? meta.textColor : 'text-stone-800'}`}>
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5 font-normal line-clamp-1">
                    {meta.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Title & Content */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider font-sans">
              2. 오늘 있었던 일과 생각 털어놓기
            </label>
            <span className="text-xs text-stone-400 font-sans">
              {content.length}자
            </span>
          </div>

          <input
            type="text"
            placeholder="제목 (선택사항, 비워두면 오늘 날짜로 자동 지정됩니다)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-sans"
          />

          <div className="relative">
            <textarea
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isLoading}
              placeholder={`오늘 하루 어떤 일들이 있었나요?\n${EMOTIONS[selectedEmotion].emoji} ${EMOTIONS[selectedEmotion].label}의 마음이 들었던 이유나 나를 스쳐 지나간 생각들을 편안하게 적어보세요...`}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-sans resize-y leading-relaxed"
            />
          </div>

          {/* Prompt Questions Chips */}
          <div className="bg-stone-50/70 p-3 rounded-xl border border-stone-100 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>무슨 말을 적어야 할지 고민된다면 눌러보세요:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_QUESTIONS[selectedEmotion].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(q)}
                  className="text-xs text-stone-600 bg-white hover:bg-amber-50 hover:text-amber-900 border border-stone-200 hover:border-amber-300 rounded-lg px-2.5 py-1 transition-colors text-left font-sans"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Primary Action Button: [AI 비서에게 일기 보여주기] */}
        <div>
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className={`w-full py-4 px-6 rounded-xl font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2.5 ${
              isLoading || !content.trim()
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 via-amber-700 to-stone-800 hover:from-amber-700 hover:to-stone-900 text-white shadow-amber-900/10 hover:shadow-md active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-200" />
                <span className="font-sans font-medium">
                  {loadingMessages[loadingMessageIndex]}
                </span>
              </>
            ) : (
              <>
                <HeartHandshake className="w-5 h-5 text-amber-200" />
                <span className="font-sans font-semibold tracking-wide">
                  AI 비서에게 일기 보여주기
                </span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-stone-400 mt-2 font-sans">
            작성하신 일기는 Firebase와 로컬 저장소에 안전하게 보관되며, AI 비서의 따뜻한 답장이 즉시 도착합니다.
          </p>
        </div>
      </form>
    </section>
  );
};
