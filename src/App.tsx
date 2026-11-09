import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Mic,
  HelpCircle,
  Subtitles,
  Settings,
  Search,
  GraduationCap,
  Volume2,
  CheckCircle2,
  Sun,
  Moon,
  Flame,
  RefreshCw,
  Video,
  Wand2,
  Trash2,
  MonitorPlay,
  Maximize2,
  Columns,
  Rows,
  BookmarkPlus,
  BookmarkCheck,
  RotateCcw,
  Gauge,
  FileText,
  Type as TypeIcon
} from 'lucide-react';
import {
  FocusMode,
  KeywordItem,
  PlayerEngineMode,
  SavedWordItem,
  SubtitleDisplayMode,
  SubtitleItem,
  VideoLesson
} from './types';
import { CURATED_VIDEOS } from './data/curatedVideos';
import { CinemaLayoutMode, DualEnginePlayer } from './components/DualEnginePlayer';
import { InlineKeywordHighlighter } from './components/InlineKeywordHighlighter';
import { ShadowingStudio } from './components/ShadowingStudio';
import { VocabularyVault } from './components/VocabularyVault';
import { QuizArena } from './components/QuizArena';
import {
  WordCardModal,
  SentenceTutorDialog,
  SettingsAndCustomTranscriptDialog
} from './components/Dialogs';
import {
  loadCachedLessonsClientFallback,
  analyzeYoutubeInBrowser
} from './services/clientAnalyzer';

const STORAGE_KEYS = {
  SAVED_WORDS: 'tubefluent_saved_words_v1',
  API_KEY: 'tubefluent_gemini_api_key_v1',
  CUSTOM_LESSONS: 'tubefluent_custom_lessons_v3',
  THEME: 'tubefluent_theme_v1'
};

const QUICK_TRY_YOUTUBE_LINKS = [
  {
    label: '🎬 Tim Urban《拖延症大腦》TED (112句)',
    url: 'https://www.youtube.com/watch?v=arj7oStGLkU'
  },
  {
    label: '🎬 黃仁勳《NVIDIA GTC Berlin 演講》(671句)',
    url: 'https://www.youtube.com/watch?v=v-NGxyPjcrE'
  },
  {
    label: '🎬 Steve Jobs《史丹佛畢業演講》(104句)',
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc'
  }
];

type UnderVideoAnalysisTab =
  | 'live-sentence'
  | 'vocabulary'
  | 'shadowing'
  | 'quiz'
  | 'summary';

export function App() {
  const [customLessons, setCustomLessons] = useState<VideoLesson[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const allLessons = useMemo(
    () => [...customLessons, ...CURATED_VIDEOS],
    [customLessons]
  );

  const [currentLessonId, setCurrentLessonId] = useState<string>(allLessons[0].id);
  const currentLesson = useMemo(
    () => allLessons.find((v) => v.id === currentLessonId) || allLessons[0],
    [allLessons, currentLessonId]
  );

  // Player & Sync States
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sentenceLoop, setSentenceLoop] = useState(false);
  const [engineMode, setEngineMode] = useState<PlayerEngineMode>('youtube');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seekRequest, setSeekRequest] = useState<{ time: number; seq: number } | null>(null);

  // Cinema & Theater Layout Modes
  const [cinemaMode, setCinemaMode] = useState<CinemaLayoutMode>('standard');
  const [showSidebarInCinema, setShowSidebarInCinema] = useState(true);
  const [subtitleFontScale, setSubtitleFontScale] = useState<'normal' | 'large' | 'xl'>('large');

  // Under-Video Bilingual Analysis Studio Tab (Always visible below video!)
  const [underVideoTab, setUnderVideoTab] =
    useState<UnderVideoAnalysisTab>('live-sentence');

  // Right Sidebar Tab & Subtitle Display Modes
  const [activeTab, setActiveTab] = useState<'subtitles' | 'vocabulary' | 'shadowing' | 'quiz'>(
    'subtitles'
  );
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('bilingual');
  const [autoScroll, setAutoScroll] = useState(true);
  const [subtitleSearch, setSubtitleSearch] = useState('');

  // BYOV Input & Analysis States
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [focusMode, setFocusMode] = useState<FocusMode>('tech-interview');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [analyzeBanner, setAnalyzeBanner] = useState<{
    type: 'info' | 'warning' | 'success';
    text: string;
  } | null>(null);

  // User Saved Vocabulary Book
  const [savedWords, setSavedWords] = useState<SavedWordItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_WORDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Gemini API Key & Dialogs
  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.API_KEY) || ''
  );
  const [selectedKeywordModal, setSelectedKeywordModal] = useState<{
    keyword: KeywordItem;
    sentence: SubtitleItem;
  } | null>(null);
  const [tutorSentence, setTutorSentence] = useState<SubtitleItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Theme Override ('system' | 'light' | 'dark')
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as any) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_WORDS, JSON.stringify(savedWords));
    } catch {
      // ignore storage quota errors
    }
  }, [savedWords]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_LESSONS,
        JSON.stringify(customLessons.slice(0, 6))
      );
    } catch {
      // ignore storage quota errors
    }
  }, [customLessons]);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, newKey);
    } catch {
      // ignore
    }
  };

  // Sync server-side or static GitHub Pages full-length cached lessons on mount
  useEffect(() => {
    fetch('/api/cache?full=1')
      .then((r) => {
        if (!r.ok) throw new Error('STATIC_FALLBACK');
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setCustomLessons(data.items);
          setCurrentLessonId(data.items[0].id);
        }
      })
      .catch(async () => {
        const staticItems = await loadCachedLessonsClientFallback();
        if (staticItems.length > 0) {
          setCustomLessons(staticItems);
          setCurrentLessonId(staticItems[0].id);
        }
      });
  }, []);

  // Auto-upgrade built-in preview lessons (<15 sentences) to 100% full-video lessons
  useEffect(() => {
    if (currentLesson.subtitles.length < 15 && !analyzing) {
      handleAnalyzeYoutube({
        customUrl: currentLesson.videoId
      });
    }
  }, [currentLesson.id]);

  // Handle Fullscreen API sync when entering/exiting fullscreen-cinema mode
  const handleChangeCinemaMode = (nextMode: CinemaLayoutMode) => {
    setCinemaMode(nextMode);
    if (nextMode !== 'standard') {
      setShowSidebarInCinema(true);
      setActiveTab('subtitles');
    }
    if (nextMode === 'fullscreen-cinema') {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }
      } catch {
        // ignore if blocked
      }
    } else {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  };

  // Determine exact active subtitle based on currentTime
  const activeSubtitle = useMemo(() => {
    return currentLesson.subtitles.find(
      (s) => currentTime >= s.start && currentTime < s.end
    );
  }, [currentLesson.subtitles, currentTime]);

  // Latched Subtitle: Never empty! Defaults to Sentence #1 at 00:00 and holds the last spoken sentence during brief pauses
  const latchedSubtitle = useMemo(() => {
    if (activeSubtitle) return activeSubtitle;
    const subs = currentLesson.subtitles;
    if (subs.length === 0) return undefined;
    for (let i = subs.length - 1; i >= 0; i--) {
      if (subs[i].start <= currentTime) {
        return subs[i];
      }
    }
    return subs[0];
  }, [activeSubtitle, currentLesson.subtitles, currentTime]);

  // Enrich current sentence keywords with upcoming preview keywords so the 3-card grid below the video is always full
  const contextualKeywords = useMemo(() => {
    if (!latchedSubtitle) return [];
    const items: Array<{
      keyword: KeywordItem;
      sentence: SubtitleItem;
      isPreview: boolean;
    }> = [];
    const seen = new Set<string>();

    for (const kw of latchedSubtitle.keywords || []) {
      const k = kw.lemma.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        items.push({ keyword: kw, sentence: latchedSubtitle, isPreview: false });
      }
    }

    if (items.length < 3) {
      const subs = currentLesson.subtitles;
      const startIdx = subs.findIndex((s) => s.id === latchedSubtitle.id);
      for (let i = Math.max(0, startIdx + 1); i < subs.length && items.length < 3; i++) {
        for (const kw of subs[i].keywords || []) {
          const k = kw.lemma.toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            items.push({ keyword: kw, sentence: subs[i], isPreview: true });
            if (items.length >= 3) break;
          }
        }
      }
    }
    return items;
  }, [latchedSubtitle, currentLesson.subtitles]);

  // Compute speaking rate (WPM) for the latched sentence
  const latchedSentenceStats = useMemo(() => {
    if (!latchedSubtitle) return { wordCount: 0, durationSec: 0, wpm: 130 };
    const words = latchedSubtitle.en.trim().split(/\s+/).filter(Boolean).length;
    const dur = Math.max(1.2, latchedSubtitle.end - latchedSubtitle.start);
    const wpm = Math.round((words / dur) * 60);
    return { wordCount: words, durationSec: dur, wpm };
  }, [latchedSubtitle]);

  // Smooth auto-scroll subtitle container when activeSubtitle changes
  const subtitleItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  useEffect(() => {
    if (!autoScroll || activeTab !== 'subtitles' || !activeSubtitle) return;
    const node = subtitleItemRefs.current[activeSubtitle.id];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSubtitle?.id, autoScroll, activeTab]);

  // Global Keyboard Shortcuts (Space, ArrowLeft, ArrowRight, L, R, M, T, F)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const subs = currentLesson.subtitles;
        if (subs.length === 0) return;
        const currIdx = latchedSubtitle
          ? subs.findIndex((s) => s.id === latchedSubtitle.id)
          : 0;
        const target = subs[Math.max(0, currIdx - 1)];
        if (target) triggerSeek(target.start);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const subs = currentLesson.subtitles;
        if (subs.length === 0) return;
        const currIdx = latchedSubtitle
          ? subs.findIndex((s) => s.id === latchedSubtitle.id)
          : 0;
        const target = subs[Math.min(subs.length - 1, currIdx + 1)];
        if (target) triggerSeek(target.start);
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        setSentenceLoop((prev) => !prev);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setSubtitleMode((prev) =>
          prev === 'bilingual'
            ? 'en-only'
            : prev === 'en-only'
              ? 'cloze-blur'
              : prev === 'cloze-blur'
                ? 'blind-listen'
                : 'bilingual'
        );
      } else if (e.code === 'KeyR' && latchedSubtitle) {
        e.preventDefault();
        triggerSeek(latchedSubtitle.start);
        setIsPlaying(true);
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        handleChangeCinemaMode(
          cinemaMode === 'theater-split' ? 'standard' : 'theater-split'
        );
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleChangeCinemaMode(
          cinemaMode === 'fullscreen-cinema' ? 'standard' : 'fullscreen-cinema'
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [latchedSubtitle, currentLesson.subtitles, currentTime, cinemaMode]);

  const triggerSeek = (seconds: number) => {
    setSeekRequest({ time: seconds, seq: Date.now() });
  };

  const savedWordSet = useMemo(
    () => new Set(savedWords.map((w) => w.lemma.toLowerCase())),
    [savedWords]
  );

  const handleToggleSaveWord = (kw: KeywordItem, sentence: SubtitleItem) => {
    const key = kw.lemma.toLowerCase();
    setSavedWords((prev) => {
      if (prev.some((item) => item.lemma.toLowerCase() === key)) {
        return prev.filter((item) => item.lemma.toLowerCase() !== key);
      }
      return [
        {
          ...kw,
          savedAt: new Date().toISOString(),
          sourceVideoId: currentLesson.videoId,
          sourceVideoTitle: currentLesson.title,
          sourceSentenceEn: sentence.en,
          sourceSentenceZh: sentence.zh,
          sourceTimestamp: sentence.start
        },
        ...prev
      ];
    });
  };

  const handleRemoveSavedWord = (lemma: string) => {
    const key = lemma.toLowerCase();
    setSavedWords((prev) => prev.filter((w) => w.lemma.toLowerCase() !== key));
  };

  // Analyze arbitrary YouTube URL via backend /api/analyze
  const handleAnalyzeYoutube = async (options?: {
    customUrl?: string;
    customTitle?: string;
    customTranscript?: string;
    forceRefresh?: boolean;
  }) => {
    const targetUrl = (options?.customUrl ?? youtubeUrlInput).trim();
    if (!targetUrl && !options?.customTranscript) return;

    setAnalyzing(true);
    setAnalyzeStep(1);
    setAnalyzeBanner(null);

    const stepTimer1 = window.setTimeout(() => setAnalyzeStep(2), 800);
    const stepTimer2 = window.setTimeout(() => setAnalyzeStep(3), 1800);
    const stepTimer3 = window.setTimeout(() => setAnalyzeStep(4), 3000);

    try {
      let newLesson: VideoLesson | null = null;

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urlOrId: targetUrl,
            focusMode,
            apiKey,
            customTranscript: options?.customTranscript || '',
            customTitle: options?.customTitle || '',
            forceRefresh: Boolean(options?.forceRefresh)
          })
        });

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('STATIC_HOST_FALLBACK');
        }

        const data = await res.json();
        if (!res.ok) {
          if (data.error === 'CAPTION_FETCH_FAILED') {
            setAnalyzeBanner({
              type: 'warning',
              text: data.message
            });
            setSettingsOpen(true);
            return;
          }
          throw new Error(data.message || 'BACKEND_ERROR');
        }
        newLesson = data;
      } catch {
        // Fallback for GitHub Pages static deployment (runs Gemini 2.5 Flash or static cache directly in browser)
        newLesson = await analyzeYoutubeInBrowser({
          urlOrId: targetUrl,
          focusMode,
          apiKey,
          customTranscript: options?.customTranscript,
          customTitle: options?.customTitle
        });
      }

      if (!newLesson) return;

      setCustomLessons((prev) => [
        newLesson!,
        ...prev.filter((item) => item.id !== newLesson!.id)
      ]);
      setCurrentLessonId(newLesson.id);
      setCurrentTime(0);
      setIsPlaying(false);
      setEngineMode('youtube');
      setYoutubeUrlInput('');

      if (newLesson.cached) {
        setAnalyzeBanner({
          type: 'success',
          text: `⚡ 已從快取載入完整版「${newLesson.title}」（共 ${newLesson.subtitles.length} 句雙語字幕與字卡）！`
        });
      } else {
        setAnalyzeBanner({
          type: 'success',
          text: `🎉 已完成全片解析「${newLesson.title}」（共 ${newLesson.subtitles.length} 句雙語字幕、重點字音標與測驗）！`
        });
      }
    } catch (err: any) {
      if (err?.message === 'STATIC_HOST_NEEDS_API_KEY') {
        setAnalyzeBanner({
          type: 'warning',
          text: '💡 在 GitHub Pages 公開靜態網頁上解析全新 YouTube 網址時，請於「設定」填入免費 Gemini API Key（將直接由瀏覽器呼叫 Gemini 2.5 Flash 聽譯全片），或貼上 SRT 字幕文字！內建 6 部完整演講則免金鑰即可直接使用。'
        });
        setSettingsOpen(true);
      } else {
        setAnalyzeBanner({
          type: 'warning',
          text: '影片解析失敗，請於右上角「設定」填入 Gemini API Key 或貼上自訂字幕匯入。'
        });
      }
    } finally {
      window.clearTimeout(stepTimer1);
      window.clearTimeout(stepTimer2);
      window.clearTimeout(stepTimer3);
      setAnalyzing(false);
      setAnalyzeStep(0);
    }
  };

  const filteredSubtitles = useMemo(() => {
    const q = subtitleSearch.trim().toLowerCase();
    if (!q) return currentLesson.subtitles;
    return currentLesson.subtitles.filter(
      (s) =>
        s.en.toLowerCase().includes(q) ||
        s.zh.toLowerCase().includes(q) ||
        s.keywords.some(
          (k) =>
            k.lemma.toLowerCase().includes(q) || k.meaning.toLowerCase().includes(q)
        )
    );
  }, [currentLesson.subtitles, subtitleSearch]);

  const totalVideoKeywords = useMemo(
    () => currentLesson.subtitles.reduce((sum, s) => sum + (s.keywords?.length || 0), 0),
    [currentLesson.subtitles]
  );

  const isTheaterSplit = cinemaMode === 'theater-split';
  const isTheaterBottom = cinemaMode === 'theater-bottom';
  const isTheaterAny = isTheaterSplit || isTheaterBottom;
  const isFullscreenCinema = cinemaMode === 'fullscreen-cinema';

  const isRightSidebarVisible =
    cinemaMode === 'standard' ||
    cinemaMode === 'theater-bottom' ||
    showSidebarInCinema;

  // Only show the compact 1-line subtitle bar inside DualEnginePlayer when in fullscreen-cinema with sidebar hidden
  const showCompactSubtitleBar = isFullscreenCinema && !showSidebarInCinema;

  const enFontSizeClass =
    subtitleFontScale === 'xl'
      ? 'text-base sm:text-lg'
      : subtitleFontScale === 'large'
        ? 'text-[15px] sm:text-base'
        : 'text-sm sm:text-[15px]';

  const zhFontSizeClass =
    subtitleFontScale === 'xl'
      ? 'text-sm sm:text-base'
      : subtitleFontScale === 'large'
        ? 'text-xs sm:text-[14px]'
        : 'text-xs sm:text-sm';

  // Reusable Under-Video Bilingual Subtitle Analysis Studio
  const renderUnderVideoBilingualAnalysisStudio = () => (
    <section
      aria-label="影片下方雙語字幕即時深度分析工作台"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Studio Top Navigation Bar */}
      <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {[
            {
              id: 'live-sentence',
              label: '🎯 當句雙語＆單字精析',
              icon: Sparkles
            },
            {
              id: 'vocabulary',
              label: `📚 全片單字庫 (${totalVideoKeywords})`,
              icon: BookOpen
            },
            {
              id: 'shadowing',
              label: '🎙️ AI 口說跟讀',
              icon: Mic
            },
            {
              id: 'quiz',
              label: `📝 隨堂測驗 (${currentLesson.quiz.length})`,
              icon: HelpCircle
            },
            {
              id: 'summary',
              label: '✨ 全片 AI 摘要',
              icon: FileText
            }
          ].map((t) => {
            const selected = underVideoTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setUnderVideoTab(t.id as UnderVideoAnalysisTab)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {latchedSubtitle && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Gauge className="w-3 h-3 text-indigo-500" aria-hidden="true" />
              {latchedSentenceStats.wpm} WPM · {latchedSentenceStats.wordCount} 詞
            </span>
            <button
              type="button"
              onClick={() => setTutorSentence(latchedSubtitle)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/25 transition cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              AI 深度拆解此句
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Live Bilingual Sentence & Contextual Word Breakdown */}
      {underVideoTab === 'live-sentence' && latchedSubtitle && (
        <div className="p-4 space-y-4">
          {/* Current Sentence Bilingual Spotlight Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/8 via-slate-50 to-violet-500/5 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border border-indigo-500/25 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white">
                  第 #{latchedSubtitle.id} / {currentLesson.subtitles.length} 句
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {latchedSubtitle.start.toFixed(1)}s – {latchedSubtitle.end.toFixed(1)}s
                </span>
                {activeSubtitle ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ● 即時同步中
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">
                    （點擊播放即可同步跟隨）
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerSeek(latchedSubtitle.start);
                    setIsPlaying(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-500" aria-hidden="true" />
                  跳至此句播放
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(latchedSubtitle.en);
                      u.lang = 'en-US';
                      u.rate = 0.82;
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                  慢速發音 (0.8x)
                </button>
              </div>
            </div>

            {/* Bilingual English + Chinese Display */}
            <div className="text-base sm:text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
              <InlineKeywordHighlighter
                sentence={latchedSubtitle}
                savedWordSet={savedWordSet}
                onSelectKeyword={(keyword, sentence) =>
                  setSelectedKeywordModal({ keyword, sentence })
                }
              />
            </div>

            <p className="text-sm sm:text-base font-medium text-indigo-700 dark:text-indigo-300 leading-relaxed">
              {latchedSubtitle.zh}
            </p>

            {/* Grammar & Discourse Breakdown */}
            <div className="pt-2 border-t border-indigo-500/15 flex flex-wrap items-start justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  💡 句構與語境解析：
                </span>
                <span>
                  {latchedSubtitle.grammarNote ||
                    '留意講者在此處的語意轉折與重音停頓，點擊上方標色單字可查看完整字卡，或點擊右上角「AI 深度拆解此句」取得逐字文法分析。'}
                </span>
              </div>
            </div>
          </div>

          {/* 3-Column Contextual Vocabulary & Example Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                📖 當句與前後文重點單字詳解卡（點擊單字卡可放大檢視）
              </h3>
              <span className="text-[11px] text-slate-400">
                已收藏單字：{savedWords.length} 個
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contextualKeywords.map(({ keyword: kw, sentence, isPreview }, idx) => {
                const isSaved = savedWordSet.has(kw.lemma.toLowerCase());
                return (
                  <div
                    key={`${kw.lemma}-${idx}`}
                    onClick={() =>
                      setSelectedKeywordModal({
                        keyword: kw,
                        sentence
                      })
                    }
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isPreview
                        ? 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400'
                        : 'border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/25 hover:border-indigo-400'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                            {kw.lemma}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {kw.phonetic}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                            {kw.pos}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const u = new SpeechSynthesisUtterance(kw.lemma);
                                u.lang = 'en-US';
                                window.speechSynthesis.speak(u);
                              }
                            }}
                            aria-label={`發音 ${kw.lemma}`}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-500 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleSaveWord(kw, sentence)}
                            aria-label={`收藏 ${kw.lemma}`}
                            className={`p-1 rounded-lg cursor-pointer ${
                              isSaved
                                ? 'text-amber-500'
                                : 'text-slate-400 hover:text-amber-500'
                            }`}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {kw.meaning}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                            isPreview
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isPreview ? `⏭ 下句預習 #${sentence.id}` : '🎯 本句核心'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <p className="line-clamp-1 italic">{kw.exampleEn}</p>
                      <p className="line-clamp-1">{kw.exampleZh}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Vocabulary Vault */}
      {underVideoTab === 'vocabulary' && (
        <div className="p-4 max-h-[460px] custom-scroller">
          <VocabularyVault
            subtitles={currentLesson.subtitles}
            savedWords={savedWords}
            onToggleSaveWord={handleToggleSaveWord}
            onRemoveSavedWord={handleRemoveSavedWord}
            onJumpToTime={(sec) => {
              triggerSeek(sec);
              setIsPlaying(true);
            }}
          />
        </div>
      )}

      {/* Tab 3: Shadowing Studio */}
      {underVideoTab === 'shadowing' && (
        <div className="p-4 max-h-[460px] custom-scroller">
          <ShadowingStudio
            subtitles={currentLesson.subtitles}
            activeSubtitle={latchedSubtitle}
            onSelectSentence={(sub) => {
              triggerSeek(sub.start);
              setIsPlaying(false);
            }}
          />
        </div>
      )}

      {/* Tab 4: AI Comprehension Quiz */}
      {underVideoTab === 'quiz' && (
        <div className="p-4 max-h-[460px] custom-scroller">
          <QuizArena
            quiz={currentLesson.quiz}
            videoId={currentLesson.id}
            onJumpToTime={(sec) => {
              triggerSeek(sec);
              setIsPlaying(true);
            }}
          />
        </div>
      )}

      {/* Tab 5: Executive AI Summary */}
      {underVideoTab === 'summary' && (
        <div className="p-4 space-y-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {currentLesson.summary.difficultyLevel}
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                {currentLesson.title}
              </h3>
            </div>
            <button
              type="button"
              disabled={analyzing}
              onClick={() =>
                handleAnalyzeYoutube({
                  customUrl: currentLesson.videoId,
                  forceRefresh: true
                })
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              重新強制解析全片
            </button>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentLesson.summary.overviewZh}
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1.5">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              🎯 本片核心觀點：
            </p>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {currentLesson.summary.keyTakeaways.map((pt, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100">
      {/* Compact Single-Row Sticky Navigation Bar (<12% viewport height per content-first-noise-reduction) */}
      {!isFullscreenCinema && (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 h-13 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Title */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
                  TubeFluent AI
                </h1>
                <span className="hidden xl:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  全片雙語劇院
                </span>
              </div>
            </div>

            {/* Inline Bring-Your-Own-Video Search Input */}
            <search className="flex-1 max-w-xl min-w-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyzeYoutube();
                }}
                className="flex items-center gap-1.5"
              >
                <div className="relative flex-1 min-w-0">
                  <Video
                    className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    placeholder="貼上任意 YouTube 網址立即全片 AI 雙語分析⋯"
                    aria-label="貼上 YouTube 影片網址"
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={focusMode}
                  onChange={(e) => setFocusMode(e.target.value as FocusMode)}
                  aria-label="AI 專項領域"
                  className="hidden lg:block px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs font-medium cursor-pointer"
                >
                  <option value="tech-interview">💻 科技外商</option>
                  <option value="toeic-business">📈 多益商務</option>
                  <option value="daily-idioms">🗣️ 日常片語</option>
                  <option value="academic-ted">🎓 TED 演講</option>
                </select>
                <button
                  type="submit"
                  disabled={analyzing || !youtubeUrlInput.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                >
                  {analyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {analyzing ? '解析中' : 'AI 分析'}
                  </span>
                </button>
              </form>
            </search>

            {/* Right View Mode Switcher & Settings */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Layout Mode Pill Bar */}
              <div className="hidden md:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => handleChangeCinemaMode('standard')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    cinemaMode === 'standard'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="標準雙欄模式"
                >
                  <Columns className="w-3.5 h-3.5" aria-hidden="true" />
                  標準
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeCinemaMode('theater-split')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    cinemaMode === 'theater-split'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="劇院模式：左上方大螢幕 + 影片下方雙語精析工作台 + 右側全片字幕時間軸 (快捷鍵 T)"
                >
                  <MonitorPlay className="w-3.5 h-3.5" aria-hidden="true" />
                  劇院模式 (T)
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeCinemaMode('theater-bottom')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    cinemaMode === 'theater-bottom'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="劇院上下寬幕：上方置中超寬大銀幕 + 下方雙欄雙語字幕流＆深度解析"
                >
                  <Rows className="w-3.5 h-3.5" aria-hidden="true" />
                  劇院上下
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeCinemaMode('fullscreen-cinema')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-slate-500 hover:text-indigo-500 transition cursor-pointer"
                  title="全螢幕沉浸雙語劇院 (快捷鍵 F)"
                >
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  全螢幕 (F)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 text-xs font-semibold transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                <span className="hidden sm:inline">設定</span>
                {apiKey && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500"
                    title="已設定 Gemini API Key"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="切換深淺色主題"
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Secondary Playlist & Quick-Try Bar */}
      {!isFullscreenCinema && (
        <section
          aria-label="學習片單與快速測試"
          className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50"
        >
          <div
            className={`${
              isTheaterAny ? 'max-w-[1920px] px-3 py-1.5' : 'max-w-[1680px] px-4 py-2'
            } mx-auto flex flex-wrap items-center justify-between gap-2 text-xs`}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scroller py-0.5 max-w-full">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                學習片單 ({allLessons.length})：
              </span>
              {allLessons.map((lesson) => {
                const isSelected = lesson.id === currentLesson.id;
                const isCustom = customLessons.some((c) => c.id === lesson.id);
                return (
                  <div key={lesson.id} className="inline-flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentLessonId(lesson.id);
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-80">
                        {lesson.subtitles.length}句
                      </span>
                      <span>
                        {lesson.title.length > 26
                          ? lesson.title.slice(0, 26) + '…'
                          : lesson.title}
                      </span>
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextCustom = customLessons.filter(
                            (c) => c.id !== lesson.id
                          );
                          setCustomLessons(nextCustom);
                          if (currentLesson.id === lesson.id) {
                            setCurrentLessonId(
                              nextCustom[0]?.id || CURATED_VIDEOS[0].id
                            );
                          }
                        }}
                        aria-label={`移除 ${lesson.title}`}
                        className="ml-0.5 p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {!isTheaterAny && (
              <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-slate-400">一鍵測試新影片：</span>
                {QUICK_TRY_YOUTUBE_LINKS.map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    disabled={analyzing}
                    onClick={() => {
                      setYoutubeUrlInput(sample.url);
                      handleAnalyzeYoutube({ customUrl: sample.url });
                    }}
                    className="px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] font-medium transition cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Live Step-by-Step Analysis Progress Bar */}
      {analyzing && (
        <div className="w-full max-w-[1680px] mx-auto px-4 pt-3">
          <div className="p-3 rounded-xl bg-indigo-950/90 border border-indigo-500/40 text-white space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold">
              <span>🚀 正在為您即時擷取並分析全片 YouTube 字幕與語境單字⋯</span>
              <span>Step {analyzeStep} / 4</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {[
                { step: 1, label: '① 擷取全片 YouTube 字幕軌' },
                { step: 2, label: '② 全片碎字幕智慧合併斷句' },
                { step: 3, label: '③ 全片雙語精譯與單字音標' },
                { step: 4, label: '④ 生成全片隨堂理解測驗' }
              ].map((item) => (
                <div
                  key={item.step}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition ${
                    analyzeStep >= item.step
                      ? 'border-indigo-400 bg-indigo-500/25 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Notification Banner */}
      {analyzeBanner && !isFullscreenCinema && (
        <div className="w-full max-w-[1680px] mx-auto px-4 pt-2">
          <div
            className={`px-3.5 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              analyzeBanner.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                : analyzeBanner.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-200'
            }`}
          >
            <span>{analyzeBanner.text}</span>
            <button
              type="button"
              onClick={() => setAnalyzeBanner(null)}
              className="text-xs font-bold underline cursor-pointer shrink-0"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Workspace */}
      <main
        className={
          isFullscreenCinema
            ? 'fixed inset-0 z-40 w-full h-dvh bg-slate-950 grid grid-cols-1 lg:grid-cols-12 overflow-hidden'
            : isTheaterAny
              ? 'w-full max-w-[1920px] mx-auto px-2 sm:px-4 py-2.5 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start'
              : 'w-full max-w-[1680px] mx-auto px-4 py-3.5 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
        }
      >
        {/* Top / Left Video Stage Column */}
        <div
          className={
            isTheaterBottom
              ? 'lg:col-span-12 space-y-3.5'
              : isFullscreenCinema
                ? showSidebarInCinema
                  ? 'lg:col-span-8 xl:col-span-9 h-full flex flex-col overflow-y-auto custom-scroller p-2 space-y-3'
                  : 'lg:col-span-12 h-full flex flex-col overflow-hidden'
                : isTheaterSplit
                  ? showSidebarInCinema
                    ? 'lg:col-span-8 space-y-3.5'
                    : 'lg:col-span-12 space-y-3.5'
                  : 'lg:col-span-7 space-y-3.5'
          }
        >
          <DualEnginePlayer
            videoId={currentLesson.videoId}
            title={currentLesson.title}
            duration={currentLesson.duration}
            subtitles={currentLesson.subtitles}
            currentTime={currentTime}
            isPlaying={isPlaying}
            sentenceLoop={sentenceLoop}
            engineMode={engineMode}
            playbackRate={playbackRate}
            activeSubtitle={activeSubtitle}
            savedWordSet={savedWordSet}
            cinemaMode={cinemaMode}
            showSidebarInCinema={showSidebarInCinema}
            showCompactSubtitleBar={showCompactSubtitleBar}
            onCinemaModeChange={handleChangeCinemaMode}
            onToggleSidebarInCinema={() => setShowSidebarInCinema((prev) => !prev)}
            onTimeUpdate={setCurrentTime}
            onPlayStateChange={setIsPlaying}
            onToggleSentenceLoop={() => setSentenceLoop((prev) => !prev)}
            onEngineModeChange={setEngineMode}
            onPlaybackRateChange={setPlaybackRate}
            onSelectKeyword={(keyword, sentence) =>
              setSelectedKeywordModal({ keyword, sentence })
            }
            seekRequest={seekRequest}
          />

          {/* In Standard, Theater-Split, or Fullscreen-Cinema with Sidebar:
              Place the full Bilingual Subtitle Analysis Studio directly below the video! */}
          {!isTheaterBottom && (!isFullscreenCinema || showSidebarInCinema) && (
            renderUnderVideoBilingualAnalysisStudio()
          )}
        </div>

        {/* When in Theater-Bottom ('劇院上下'):
            Place BOTH the Bilingual Subtitle Analysis Studio (Left 7 cols) AND the Full Transcript Timeline (Right 5 cols) side-by-side directly below the video! */}
        {isTheaterBottom && (
          <div className="lg:col-span-7">
            {renderUnderVideoBilingualAnalysisStudio()}
          </div>
        )}

        {/* Right / Bottom-Right Column: Synchronized Full-Video Bilingual Transcript Timeline */}
        {isRightSidebarVisible && (
          <aside
            aria-label="全片雙語字幕時間軸與學習面板"
            className={
              isTheaterBottom
                ? 'lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden'
                : isFullscreenCinema
                  ? 'lg:col-span-4 xl:col-span-3 h-dvh border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col overflow-hidden'
                  : isTheaterSplit
                    ? 'lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden lg:sticky lg:top-15'
                    : 'lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col overflow-hidden lg:sticky lg:top-15'
            }
          >
            {/* 4 Main Learning Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 shrink-0">
              {[
                {
                  id: 'subtitles',
                  label: '雙語字幕流',
                  badge: currentLesson.subtitles.length,
                  icon: Subtitles
                },
                {
                  id: 'vocabulary',
                  label: '用法/單字',
                  badge: totalVideoKeywords,
                  icon: BookOpen
                },
                {
                  id: 'shadowing',
                  label: '跟讀評測',
                  badge: 'AI',
                  icon: Mic
                },
                {
                  id: 'quiz',
                  label: '隨堂測驗',
                  badge: currentLesson.quiz.length,
                  icon: HelpCircle
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2.5 px-1.5 flex flex-col sm:flex-row items-center justify-center gap-1 text-xs font-bold border-b-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Subtitles Timeline List */}
            {activeTab === 'subtitles' && (
              <div
                className={`flex flex-col ${
                  isFullscreenCinema
                    ? 'flex-1 min-h-0'
                    : isTheaterBottom
                      ? 'h-[520px]'
                      : isTheaterSplit
                        ? 'h-[calc(100dvh-110px)] min-h-[640px]'
                        : 'h-[calc(100dvh-135px)] min-h-[620px] max-h-[820px]'
                }`}
              >
                {/* Subtitle Toolbar */}
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-0.5 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold">
                      {[
                        { id: 'bilingual', label: '中英' },
                        { id: 'en-only', label: '純英' },
                        { id: 'cloze-blur', label: '遮罩' },
                        { id: 'blind-listen', label: '裸聽' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSubtitleMode(m.id as SubtitleDisplayMode)}
                          className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                            subtitleMode === m.id
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Font Size Selector */}
                      <button
                        type="button"
                        onClick={() =>
                          setSubtitleFontScale((prev) =>
                            prev === 'normal'
                              ? 'large'
                              : prev === 'large'
                                ? 'xl'
                                : 'normal'
                          )
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                        title="切換字幕字體大小"
                      >
                        <TypeIcon className="w-3 h-3" aria-hidden="true" />
                        {subtitleFontScale === 'normal'
                          ? '標準字'
                          : subtitleFontScale === 'large'
                            ? '大字體'
                            : '劇院特大'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAutoScroll((prev) => !prev)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          autoScroll
                            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        跟隨 {autoScroll ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Search within Subtitles */}
                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={subtitleSearch}
                      onChange={(e) => setSubtitleSearch(e.target.value)}
                      placeholder={`搜尋全片 ${currentLesson.subtitles.length} 句英文字幕、單字或中譯⋯`}
                      aria-label="搜尋本片字幕"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Scrollable Subtitle Cards */}
                <div className="flex-1 custom-scroller p-3 space-y-2.5">
                  {filteredSubtitles.map((sub) => {
                    const isActive = activeSubtitle?.id === sub.id;
                    const isLatched = !activeSubtitle && latchedSubtitle?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        ref={(el) => {
                          subtitleItemRefs.current[sub.id] = el;
                        }}
                        onClick={() => {
                          triggerSeek(sub.start);
                          setIsPlaying(true);
                        }}
                        className={`group p-3.5 rounded-2xl border transition cursor-pointer ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50/95 dark:bg-indigo-950/60 shadow-md ring-2 ring-indigo-500/40'
                            : isLatched
                              ? 'border-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/25'
                              : 'border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-slate-900/70 hover:border-indigo-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              #{sub.id} · {sub.start.toFixed(1)}s
                            </span>
                            {isActive && (
                              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                ● 播放中
                              </span>
                            )}
                            {isActive && sentenceLoop && (
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                                🔁 循環中
                              </span>
                            )}
                          </div>

                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if ('speechSynthesis' in window) {
                                  window.speechSynthesis.cancel();
                                  const u = new SpeechSynthesisUtterance(sub.en);
                                  u.lang = 'en-US';
                                  window.speechSynthesis.speak(u);
                                }
                              }}
                              aria-label="朗讀此句"
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setTutorSentence(sub)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                            >
                              <GraduationCap className="w-3 h-3" aria-hidden="true" />
                              解析
                            </button>
                          </div>
                        </div>

                        <div
                          className={`${enFontSizeClass} font-semibold leading-relaxed text-slate-900 dark:text-slate-100 transition ${
                            subtitleMode === 'blind-listen'
                              ? 'blur-md select-none group-hover:blur-none'
                              : subtitleMode === 'cloze-blur'
                                ? 'blur-[3px] hover:blur-none'
                                : ''
                          }`}
                        >
                          <InlineKeywordHighlighter
                            sentence={sub}
                            savedWordSet={savedWordSet}
                            onSelectKeyword={(keyword, sentence) =>
                              setSelectedKeywordModal({ keyword, sentence })
                            }
                          />
                        </div>

                        {(subtitleMode === 'bilingual' ||
                          subtitleMode === 'cloze-blur') && (
                          <p
                            className={`mt-1.5 ${zhFontSizeClass} text-slate-600 dark:text-slate-300 leading-relaxed transition ${
                              subtitleMode === 'cloze-blur'
                                ? 'blur-xs group-hover:blur-none'
                                : ''
                            }`}
                          >
                            {sub.zh}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Vocabulary Vault */}
            {activeTab === 'vocabulary' && (
              <div
                className={`p-4 custom-scroller ${
                  isFullscreenCinema
                    ? 'flex-1 min-h-0'
                    : isTheaterBottom
                      ? 'h-[520px]'
                      : 'h-[calc(100dvh-110px)]'
                }`}
              >
                <VocabularyVault
                  subtitles={currentLesson.subtitles}
                  savedWords={savedWords}
                  onToggleSaveWord={handleToggleSaveWord}
                  onRemoveSavedWord={handleRemoveSavedWord}
                  onJumpToTime={(sec) => {
                    triggerSeek(sec);
                    setIsPlaying(true);
                  }}
                />
              </div>
            )}

            {/* Tab 3: Shadowing Studio */}
            {activeTab === 'shadowing' && (
              <div
                className={`p-4 custom-scroller ${
                  isFullscreenCinema
                    ? 'flex-1 min-h-0'
                    : isTheaterBottom
                      ? 'h-[520px]'
                      : 'h-[calc(100dvh-110px)]'
                }`}
              >
                <ShadowingStudio
                  subtitles={currentLesson.subtitles}
                  activeSubtitle={latchedSubtitle}
                  onSelectSentence={(sub) => {
                    triggerSeek(sub.start);
                    setIsPlaying(false);
                  }}
                />
              </div>
            )}

            {/* Tab 4: AI Comprehension Quiz */}
            {activeTab === 'quiz' && (
              <div
                className={`p-4 custom-scroller ${
                  isFullscreenCinema
                    ? 'flex-1 min-h-0'
                    : isTheaterBottom
                      ? 'h-[520px]'
                      : 'h-[calc(100dvh-110px)]'
                }`}
              >
                <QuizArena
                  quiz={currentLesson.quiz}
                  videoId={currentLesson.id}
                  onJumpToTime={(sec) => {
                    triggerSeek(sec);
                    setIsPlaying(true);
                    setActiveTab('subtitles');
                  }}
                />
              </div>
            )}
          </aside>
        )}
      </main>

      {/* Native Accessible Modals (<dialog closedby="any">) */}
      <WordCardModal
        selected={selectedKeywordModal}
        isSaved={
          selectedKeywordModal
            ? savedWordSet.has(selectedKeywordModal.keyword.lemma.toLowerCase())
            : false
        }
        onClose={() => setSelectedKeywordModal(null)}
        onToggleSave={handleToggleSaveWord}
      />

      <SentenceTutorDialog
        sentence={tutorSentence}
        videoTitle={currentLesson.title}
        apiKey={apiKey}
        onClose={() => setTutorSentence(null)}
      />

      <SettingsAndCustomTranscriptDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        focusMode={focusMode}
        onChangeFocusMode={setFocusMode}
        onSubmitCustomTranscript={({ videoUrl, title, transcript }) => {
          handleAnalyzeYoutube({
            customUrl: videoUrl,
            customTitle: title,
            customTranscript: transcript
          });
        }}
      />
    </div>
  );
}
export default App;
