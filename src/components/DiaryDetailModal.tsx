import React, { useState } from 'react';
import { X, Calendar, Trash2, Heart, Volume2, VolumeX, Copy, Check, Quote, Compass } from 'lucide-react';
import { DiaryEntry } from '../types/diary';
import { EMOTIONS } from '../utils/emotions';

interface DiaryDetailModalProps {
  entry: DiaryEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({
  entry,
  onClose,
  onDelete,
}) => {
  if (!entry) return null;

  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const meta = EMOTIONS[entry.emotion] || EMOTIONS['기쁨'];

  const handleCopy = () => {
    let text = `[${entry.date} 일기: ${entry.title || '제목 없음'}]\n감정: ${entry.emotion}\n\n${entry.content}`;
    if (entry.aiResponse) {
      text += `\n\n[AI 마음이의 다정한 위로]\n${entry.aiResponse.comfortMessage}\n\n[내일을 위한 행동]\n${entry.aiResponse.actionSuggestion.title}: ${entry.aiResponse.actionSuggestion.description}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (!entry.aiResponse || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${entry.aiResponse.comfortMessage}. 내일을 위한 행동 제안. ${entry.aiResponse.actionSuggestion.title}. ${entry.aiResponse.actionSuggestion.description}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={meta.label}>
              {meta.emoji}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-sans">
              <span className="font-semibold text-stone-900">{meta.label}</span>
              <span aria-hidden="true">·</span>
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{entry.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
              title="일기 및 위로 내용 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Diary Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-900">
              {entry.title || `${entry.date}의 마음 일기`}
            </h3>
            <div className="p-5 rounded-xl bg-stone-50/80 border border-stone-200/80 font-serif text-stone-800 text-sm leading-relaxed whitespace-pre-line">
              {entry.content}
            </div>
          </div>

          {/* AI Response Section */}
          {entry.aiResponse ? (
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h4 className="font-sans font-semibold text-stone-900 text-sm">
                    AI 마음이의 다정한 답장
                  </h4>
                </div>
                <button
                  onClick={handleToggleVoice}
                  className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                    isPlayingAudio
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                      <span>중지</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>음성 듣기</span>
                    </>
                  )}
                </button>
              </div>

              {/* Comfort message */}
              <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200/70 font-serif text-stone-800 text-sm leading-relaxed whitespace-pre-line">
                {entry.aiResponse.comfortMessage}
              </div>

              {/* Action suggestion */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-xl shrink-0">
                  {entry.aiResponse.actionSuggestion.icon || '🌱'}
                </div>
                <div>
                  <h5 className="font-semibold text-stone-900 text-sm font-sans">
                    [내일을 위한 행동] {entry.aiResponse.actionSuggestion.title}
                  </h5>
                  <p className="text-xs text-stone-600 font-sans mt-0.5 leading-relaxed">
                    {entry.aiResponse.actionSuggestion.description}
                  </p>
                </div>
              </div>

              {entry.aiResponse.quote && (
                <div className="bg-stone-100/50 rounded-lg px-4 py-2.5 border border-stone-200/60 flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-xs font-serif italic text-stone-600">
                    "{entry.aiResponse.quote}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-stone-400 font-sans">
              AI 비서의 답장이 아직 기록되지 않은 일기입니다.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between">
          {showConfirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium font-sans">
                정말 이 일기를 삭제할까요?
              </span>
              <button
                onClick={() => {
                  onDelete(entry.id);
                  onClose();
                }}
                className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md font-sans font-medium transition-colors"
              >
                삭제 확인
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2.5 py-1 text-xs bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-md font-sans transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-600 transition-colors font-sans"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>일기 삭제</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg font-sans transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
