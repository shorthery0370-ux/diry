export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

export interface EmotionMeta {
  type: EmotionType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  textColor: string;
  description: string;
}

export interface ActionSuggestion {
  title: string;
  description: string;
  icon?: string;
}

export interface AiEncouragement {
  comfortMessage: string;
  actionSuggestion: ActionSuggestion;
  quote?: string;
  sentimentInsight?: string;
  createdAt?: string;
}

export interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  emotion: EmotionType;
  date: string; // YYYY-MM-DD
  createdAt: number; // timestamp
  aiResponse?: AiEncouragement;
  favorite?: boolean;
}
