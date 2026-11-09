export type FocusMode =
  | 'tech-interview'
  | 'toeic-business'
  | 'daily-idioms'
  | 'academic-ted';

export type SubtitleDisplayMode = 'bilingual' | 'en-only' | 'cloze-blur' | 'blind-listen';

export type PlayerEngineMode = 'youtube' | 'tts-simulator';

export interface KeywordItem {
  word: string;
  lemma: string;
  pos: string;
  phonetic: string;
  meaning: string;
  level?: string;
  exampleEn: string;
  exampleZh: string;
}

export interface SubtitleItem {
  id: number;
  start: number;
  end: number;
  en: string;
  zh: string;
  grammarNote?: string;
  keywords: KeywordItem[];
}

export interface QuizQuestion {
  question: string;
  questionZh?: string;
  options: string[];
  answer: number;
  explanation: string;
  relatedTimestamp?: number;
}

export interface VideoSummary {
  overviewZh: string;
  keyTakeaways: string[];
  difficultyLevel: string;
  topicTags: string[];
}

export interface VideoLesson {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: number;
  focusMode: FocusMode;
  transcriptSource?: string;
  analysisSource?: string;
  cached?: boolean;
  cachedAt?: string;
  summary: VideoSummary;
  subtitles: SubtitleItem[];
  quiz: QuizQuestion[];
}

export interface SavedWordItem extends KeywordItem {
  savedAt: string;
  sourceVideoId: string;
  sourceVideoTitle: string;
  sourceSentenceEn: string;
  sourceSentenceZh: string;
  sourceTimestamp: number;
  mastered?: boolean;
}

export interface SentenceTutorBreakdown {
  structureBreakdown: string;
  pronunciationTips: string;
  workplaceParaphrases: Array<{
    en: string;
    zh: string;
    nuance: string;
  }>;
  tutorReply: string;
}
