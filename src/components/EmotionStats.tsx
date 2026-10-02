import React from 'react';
import { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTIONS } from '../utils/emotions';
import { HeartPulse, Sparkles } from 'lucide-react';

interface EmotionStatsProps {
  entries: DiaryEntry[];
}

export const EmotionStats: React.FC<EmotionStatsProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  const emotionCounts: Record<EmotionType, number> = {
    기쁨: 0,
    지침: 0,
    설렘: 0,
    불안: 0,
  };

  entries.forEach(entry => {
    if (emotionCounts[entry.emotion] !== undefined) {
      emotionCounts[entry.emotion]++;
    }
  });

  const total = entries.length;

  // Find dominant emotion
  const sortedEmotions = (Object.keys(emotionCounts) as EmotionType[]).sort(
    (a, b) => emotionCounts[b] - emotionCounts[a]
  );
  const dominantEmotion = sortedEmotions[0];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider font-sans">
            나의 최근 마음 리듬 & 통계
          </h3>
        </div>
        <span className="text-xs text-stone-500 font-sans">
          총 {total}편의 기록
        </span>
      </div>

      {/* Dominant emotion note */}
      <div className="mb-4 text-xs text-stone-600 bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-stone-800">
            최근 내 마음에 가장 자주 머문 감정은 '{dominantEmotion}'({emotionCounts[dominantEmotion]}회)입니다.
          </span>
          <p className="text-stone-500 mt-0.5">
            어떤 감정이든 자연스럽게 흘러가는 과정입니다. 스스로의 감정을 관찰하고 인정해 준 것만으로도 충분히 훌륭해요.
          </p>
        </div>
      </div>

      {/* Emotion distribution bars */}
      <div className="space-y-3">
        {(Object.keys(EMOTIONS) as EmotionType[]).map(emotion => {
          const count = emotionCounts[emotion];
          const pct = Math.round((count / total) * 100);
          const meta = EMOTIONS[emotion];

          return (
            <div key={emotion} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="flex items-center gap-1.5 font-medium text-stone-700">
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </span>
                <span className="text-stone-500">
                  {count}회 · <span className="font-medium text-stone-800">{pct}%</span>
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    emotion === '기쁨'
                      ? 'bg-amber-400'
                      : emotion === '지침'
                      ? 'bg-indigo-400'
                      : emotion === '설렘'
                      ? 'bg-rose-400'
                      : 'bg-teal-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
