import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Compass,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Quote,
  Smile,
  X,
  RefreshCw
} from 'lucide-react';
import { AiEncouragement, EmotionType } from '../types/diary';
import { EMOTIONS } from '../utils/emotions';

interface AiResponseCardProps {
  response: AiEncouragement;
  emotion: EmotionType;
  date?: string;
  onClose?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const AiResponseCard: React.FC<AiResponseCardProps> = ({
  response,
  emotion,
  date,
  onClose,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = EMOTIONS[emotion] || EMOTIONS['기쁨'];

  // Gentle TTS playback using Web Speech API
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 읽기 기능을 지원하지 않습니다.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${response.comfortMessage}. 내일을 위한 행동 제안. ${response.actionSuggestion.title}. ${response.actionSuggestion.description}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // Slightly slower, warm cadence
    utterance.pitch = 1.05;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopy = () => {
    const fullText = `[따뜻한 하루 일기 - AI 비서의 편지]\n\n${response.comfortMessage}\n\n[내일을 위한 작은 행동]\n${response.actionSuggestion.icon || '🌿'} ${response.actionSuggestion.title}\n${response.actionSuggestion.description}\n\n"${response.quote || ''}"`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50/60 via-stone-50/40 to-white rounded-2xl border border-amber-200/80 shadow-md p-6 sm:p-7 relative overflow-hidden transition-all animate-fadeIn">
      {/* Decorative gentle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-200/60 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                AI 마음 비서 '마음이'의 따뜻한 답장
              </h3>
              <span className="text-[11px] font-sans font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                Gemini 응답
              </span>
            </div>
            {response.sentimentInsight && (
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {response.sentimentInsight}
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                isRegenerating
                  ? 'bg-amber-100 border-amber-300 text-amber-900 cursor-not-allowed'
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
              title="새로운 위로와 다른 긍정 행동 받아보기"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-medium">다른 위로 듣기</span>
            </button>
          )}

          <button
            onClick={handleToggleVoice}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isPlayingAudio
                ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
            }`}
            title={isPlayingAudio ? '음성 읽기 중지' : '따뜻한 목소리로 듣기'}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline text-[11px] font-medium">듣는 중...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline text-[11px]">음성으로 듣기</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
            title="응원 편지 복사"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 transition-colors"
              title="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Part 1: 다정한 위로와 공감 */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
          <Smile className="w-3.5 h-3.5 text-amber-600" />
          <span>다정한 위로와 공감</span>
        </div>

        <div className="bg-white/80 rounded-xl p-5 border border-amber-100/90 shadow-2xs font-serif text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-3">
          {response.comfortMessage}
        </div>
      </div>

      {/* Part 2: 내일을 위한 긍정 행동 1가지 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>내일을 위한 작은 긍정 행동 1가지</span>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-stone-50 rounded-xl p-4 sm:p-5 border border-amber-200/90 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
            {response.actionSuggestion.icon || '🌱'}
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-stone-900 text-sm sm:text-base font-sans">
              {response.actionSuggestion.title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              {response.actionSuggestion.description}
            </p>
          </div>
        </div>
      </div>

      {/* Part 3: 마음을 밝혀주는 따뜻한 한 줄 문장 */}
      {response.quote && (
        <div className="bg-stone-100/60 rounded-xl px-4 py-3 border border-stone-200/70 flex items-center gap-3">
          <Quote className="w-4 h-4 text-amber-600 shrink-0 opacity-80" />
          <p className="text-xs sm:text-sm font-serif italic text-stone-700">
            "{response.quote}"
          </p>
        </div>
      )}
    </div>
  );
};
