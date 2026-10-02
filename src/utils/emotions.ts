import { EmotionType, EmotionMeta } from '../types/diary';

export const EMOTIONS: Record<EmotionType, EmotionMeta> = {
  기쁨: {
    type: '기쁨',
    label: '기쁨',
    emoji: '🌸',
    color: 'amber',
    bgColor: 'bg-amber-50/70',
    borderColor: 'border-amber-300',
    hoverColor: 'hover:border-amber-400 hover:bg-amber-50',
    textColor: 'text-amber-900',
    description: '햇살처럼 밝고 기분 좋은 순간',
  },
  지침: {
    type: '지침',
    label: '지침',
    emoji: '🌙',
    color: 'indigo',
    bgColor: 'bg-indigo-50/70',
    borderColor: 'border-indigo-300',
    hoverColor: 'hover:border-indigo-400 hover:bg-indigo-50',
    textColor: 'text-indigo-950',
    description: '온 힘을 다해 수고 많았던 하루',
  },
  설렘: {
    type: '설렘',
    label: '설렘',
    emoji: '✨',
    color: 'rose',
    bgColor: 'bg-rose-50/70',
    borderColor: 'border-rose-300',
    hoverColor: 'hover:border-rose-400 hover:bg-rose-50',
    textColor: 'text-rose-950',
    description: '가슴 뛰고 두근거리는 기대감',
  },
  불안: {
    type: '불안',
    label: '불안',
    emoji: '☁️',
    color: 'teal',
    bgColor: 'bg-teal-50/70',
    borderColor: 'border-teal-300',
    hoverColor: 'hover:border-teal-400 hover:bg-teal-50',
    textColor: 'text-teal-950',
    description: '마음이 일렁이고 걱정되는 밤',
  },
};

export const PROMPT_QUESTIONS: Record<EmotionType, string[]> = {
  기쁨: [
    '오늘 나를 활짝 웃게 만든 순간은 언제였나요?',
    '누구와 함께 나눈 즐거움이었나요?',
    '오늘 성취한 작은 자랑거리가 있다면 들려주세요!',
  ],
  지침: [
    '오늘 하루 어떤 일들이 가장 에너지를 소모하게 했나요?',
    '묵묵히 버텨낸 나 자신에게 건네고 싶은 한마디는?',
    '지금 가장 간절한 휴식의 모습은 무엇인가요?',
  ],
  설렘: [
    '어떤 새로운 일이나 만남이 가슴을 뛰게 하나요?',
    '그 설렘 속에서 기대하는 나의 모습은 무엇인가요?',
    '내일이 기다려지는 특별한 이유가 있나요?',
  ],
  불안: [
    '마음속을 맴도는 가장 큰 걱정거리는 무엇인가요?',
    '만약 그 걱정이 기우라면, 실제로는 어떤 가능성이 있을까요?',
    '지금 이 순간, 나를 안심시킬 수 있는 아주 작은 것은 무엇일까요?',
  ],
};
