import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DiaryForm } from './components/DiaryForm';
import { AiResponseCard } from './components/AiResponseCard';
import { DiaryList } from './components/DiaryList';
import { EmotionStats } from './components/EmotionStats';
import { DiaryDetailModal } from './components/DiaryDetailModal';
import { SecurityInfoModal } from './components/SecurityInfoModal';
import { DiaryEntry, EmotionType, AiEncouragement } from './types/diary';
import { fetchDiaryEntries, saveDiaryEntry, deleteDiaryEntry, toggleFavoriteEntry } from './lib/firebase';
import { generateAiEncouragement } from './lib/gemini';
import { BookHeart, Sparkles, Heart, Sun, Feather, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('기쁨');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<{
    response: AiEncouragement;
    emotion: EmotionType;
    date: string;
  } | null>(null);
  const [lastSubmittedDiary, setLastSubmittedDiary] = useState<{
    id: string;
    title: string;
    content: string;
    emotion: EmotionType;
    date: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');

  const responseSectionRef = useRef<HTMLDivElement>(null);

  // Show toast utility
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    async function loadInitialDiaries() {
      try {
        const fetched = await fetchDiaryEntries();
        if (fetched.length > 0) {
          setDiaries(fetched);
        } else {
          // Provide an initial sample diary to welcome the user
          const sampleDate = new Date().toISOString().split('T')[0];
          const sample: DiaryEntry = {
            id: 'sample_welcome_entry',
            title: '새로운 일기장을 시작하는 날',
            content: '오늘 따뜻한 하루 일기를 처음 열어보았다. 매일 바쁘게 지나가는 일상 속에서 내 마음을 솔직하게 털어놓고 쉴 수 있는 작은 안식처가 생긴 것 같아 마음이 든든하다.',
            emotion: '설렘',
            date: sampleDate,
            createdAt: Date.now(),
            aiResponse: {
              comfortMessage: '따뜻한 하루 일기에 오신 것을 진심으로 환영해요! 새로운 시작을 앞둔 설렘은 삶에 생기를 불어넣어 주는 참 귀한 감정입니다.\n\n여기서는 그 어떤 감정도 평가받지 않아요. 기쁜 날은 함께 기뻐하고, 지치고 불안한 날은 든든한 온기로 꼭 안아드릴게요.',
              actionSuggestion: {
                title: '오늘 밤 5분 감사한 일 1가지 적어보기',
                description: '잠들기 전, 오늘 나를 편안하게 해 주었던 사소한 순간 하나를 떠올려보세요.',
                icon: '✨',
              },
              quote: '당신의 하루는 언제나 소중하고 가치 있습니다.',
              sentimentInsight: '기대와 온기가 피어나는 따스한 첫걸음',
            },
            favorite: true,
          };
          setDiaries([sample]);
        }
      } catch (err) {
        console.error('Failed to load diaries:', err);
      }
    }
    loadInitialDiaries();
  }, []);

  // Handle Diary Submission
  const handleSubmitDiary = async (entryData: {
    title: string;
    content: string;
    emotion: EmotionType;
    date: string;
  }) => {
    setIsLoading(true);

    try {
      // 1. Generate Warm Encouragement & Next-day Action from Gemini
      const aiResponse = await generateAiEncouragement(
        entryData.content,
        entryData.emotion,
        entryData.date
      );

      // 2. Save to Firestore & local state
      const savedEntry = await saveDiaryEntry({
        title: entryData.title,
        content: entryData.content,
        emotion: entryData.emotion,
        date: entryData.date,
        aiResponse,
      });

      // 3. Update state
      setDiaries(prev => [savedEntry, ...prev.filter(d => d.id !== savedEntry.id)]);
      setCurrentAiResponse({
        response: aiResponse,
        emotion: entryData.emotion,
        date: entryData.date,
      });
      setLastSubmittedDiary({
        id: savedEntry.id,
        title: entryData.title,
        content: entryData.content,
        emotion: entryData.emotion,
        date: entryData.date,
      });

      showToast('AI 비서의 따뜻한 답장과 일기가 저장되었습니다 ✨');

      // Scroll to response view
      setTimeout(() => {
        responseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to process diary:', err);
      showToast('답장을 작성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Regenerate for another perspective/comfort
  const handleRegenerateAiResponse = async () => {
    if (!lastSubmittedDiary || isRegenerating) return;
    setIsRegenerating(true);
    try {
      const freshResponse = await generateAiEncouragement(
        lastSubmittedDiary.content,
        lastSubmittedDiary.emotion,
        lastSubmittedDiary.date
      );

      setCurrentAiResponse({
        response: freshResponse,
        emotion: lastSubmittedDiary.emotion,
        date: lastSubmittedDiary.date,
      });

      await saveDiaryEntry({
        id: lastSubmittedDiary.id,
        title: lastSubmittedDiary.title,
        content: lastSubmittedDiary.content,
        emotion: lastSubmittedDiary.emotion,
        date: lastSubmittedDiary.date,
        aiResponse: freshResponse,
      });

      setDiaries(prev =>
        prev.map(d =>
          d.id === lastSubmittedDiary.id ? { ...d, aiResponse: freshResponse } : d
        )
      );

      showToast('새로운 따뜻한 위로와 행동 제안을 불러왔습니다 ✨');
    } catch (err) {
      console.error('Failed to regenerate response:', err);
      showToast('새로운 답장을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle delete
  const handleDeleteDiary = async (id: string) => {
    try {
      await deleteDiaryEntry(id);
      setDiaries(prev => prev.filter(d => d.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
      showToast('일기가 삭제되었습니다.');
    } catch (err) {
      console.error('Failed to delete diary:', err);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      await toggleFavoriteEntry(id, currentFav);
      setDiaries(prev =>
        prev.map(d => (d.id === id ? { ...d, favorite: !currentFav } : d))
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        diaryCount={diaries.length}
        onOpenInfoModal={() => setIsSecurityModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Warm Intro Banner */}
        <section className="bg-gradient-to-r from-amber-100/70 via-stone-100/50 to-rose-100/50 rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>오늘 하루도 정말 고생 많으셨습니다</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-tight">
              기쁨도, 지침도, 설렘도, 불안도<br />
              이곳에 편안하게 내려놓으세요.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed pt-1">
              솔직한 마음을 적고 <strong>[AI 비서에게 일기 보여주기]</strong>를 누르면,
              당신의 마음을 보듬는 다정한 위로와 <strong>내일을 위한 긍정 행동 1가지</strong>가 도착합니다.
            </p>
          </div>
        </section>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-stone-200/90 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('write')}
              className={`pb-3 px-3 text-sm font-semibold transition-all relative ${
                activeTab === 'write'
                  ? 'text-stone-900 font-sans'
                  : 'text-stone-400 hover:text-stone-700 font-sans'
              }`}
            >
              오늘의 일기 쓰기 & 답장
              {activeTab === 'write' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-3 text-sm font-semibold transition-all relative ${
                activeTab === 'history'
                  ? 'text-stone-900 font-sans'
                  : 'text-stone-400 hover:text-stone-700 font-sans'
              }`}
            >
              나의 일기장 & 감정 통계 ({diaries.length})
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 rounded-full" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="text-xs text-stone-500 hover:text-amber-800 transition-colors hidden sm:flex items-center gap-1 font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Firebase &amp; API 안전 설정</span>
          </button>
        </div>

        {/* Tab 1: Write Diary & View Response */}
        {activeTab === 'write' && (
          <div className="space-y-8">
            {/* The Latest AI Response Card if just generated */}
            {currentAiResponse && (
              <div ref={responseSectionRef} className="scroll-mt-20">
                <AiResponseCard
                  response={currentAiResponse.response}
                  emotion={currentAiResponse.emotion}
                  date={currentAiResponse.date}
                  onClose={() => setCurrentAiResponse(null)}
                  onRegenerate={handleRegenerateAiResponse}
                  isRegenerating={isRegenerating}
                />
              </div>
            )}

            {/* Diary Input Form */}
            <DiaryForm
              onSubmit={handleSubmitDiary}
              isLoading={isLoading}
              selectedEmotion={selectedEmotion}
              onEmotionChange={setSelectedEmotion}
            />

            {/* Recent 2 diaries preview */}
            {diaries.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-800 font-sans">
                    최근 기록한 일기
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-amber-800 hover:underline font-medium font-sans"
                  >
                    전체 일기 보기 ({diaries.length}편) →
                  </button>
                </div>
                <DiaryList
                  entries={diaries.slice(0, 2)}
                  onSelectEntry={entry => setSelectedEntry(entry)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History & Stats */}
        {activeTab === 'history' && (
          <div className="space-y-8">
            {/* Emotion Rhythm Statistics */}
            <EmotionStats entries={diaries} />

            {/* Full Diary List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-800 font-sans">
                지난 마음 기록 모아보기
              </h3>
              <DiaryList
                entries={diaries}
                onSelectEntry={entry => setSelectedEntry(entry)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <DiaryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={handleDeleteDiary}
      />

      {/* Security & Database Info Modal */}
      <SecurityInfoModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-sans border border-stone-700 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/40 py-6 mt-12 text-center text-xs text-stone-500 font-sans space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <span>따뜻한 하루 일기</span>
          <span aria-hidden="true">·</span>
          <span>Google Gemini API 연동</span>
          <span aria-hidden="true">·</span>
          <span>Firebase Firestore 저장소</span>
        </p>
        <p className="text-[11px] text-stone-400">
          모든 API 키는 환경 변수로 안전하게 격리되어 관리됩니다.
        </p>
      </footer>
    </div>
  );
}
