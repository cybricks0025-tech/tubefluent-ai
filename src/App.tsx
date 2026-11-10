import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Mic,
  HelpCircle,
  Settings,
  Search,
  GraduationCap,
  Volume2,
  CheckCircle2,
  Sun,
  Moon,
  RefreshCw,
  Video,
  Wand2,
  Trash2,
  BookmarkPlus,
  BookmarkCheck,
  FileText,
  Snail,
  X,
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
  CUSTOM_LESSONS: 'tubefluent_custom_lessons_v5',
  THEME: 'tubefluent_theme_v1'
};

type StudioTab = 'sentence' | 'vocabulary' | 'shadowing' | 'quiz' | 'summary';

const formatClock = (sec: number) => {
  const total = Math.max(0, Math.floor(sec));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const speak = (text: string, rate = 1) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  window.speechSynthesis.speak(u);
};

/** Keep one lesson per YouTube video, preferring the most complete one. */
const dedupeByVideo = (lessons: VideoLesson[]) => {
  const map = new Map<string, VideoLesson>();
  for (const lesson of lessons) {
    const prev = map.get(lesson.videoId);
    if (!prev || lesson.subtitles.length > prev.subtitles.length) {
      map.set(lesson.videoId, lesson);
    }
  }
  return Array.from(map.values());
};

export function App() {
  const [customLessons, setCustomLessons] = useState<VideoLesson[]>(() => {
    try {
      localStorage.removeItem('tubefluent_custom_lessons_v1');
      localStorage.removeItem('tubefluent_custom_lessons_v2');
      localStorage.removeItem('tubefluent_custom_lessons_v3');
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
      if (!raw) return [];
      const parsed: VideoLesson[] = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter(
            (l) =>
              Array.isArray(l?.subtitles) &&
              !l.subtitles.some((s) => s.zh?.includes('雙語同步導讀'))
          )
        : [];
    } catch {
      return [];
    }
  });
  // IDs of lessons that come from the server / static cache (no need to persist them locally)
  const cachedLessonIdsRef = useRef<Set<string>>(new Set());

  const allLessons = useMemo(
    () => dedupeByVideo([...customLessons, ...CURATED_VIDEOS]),
    [customLessons]
  );

  const [currentVideoId, setCurrentVideoId] = useState<string>(allLessons[0].videoId);
  const currentLesson = useMemo(
    () => allLessons.find((v) => v.videoId === currentVideoId) || allLessons[0],
    [allLessons, currentVideoId]
  );

  // Player & sync
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sentenceLoop, setSentenceLoop] = useState(false);
  const [engineMode, setEngineMode] = useState<PlayerEngineMode>('youtube');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seekRequest, setSeekRequest] = useState<{ time: number; seq: number } | null>(null);

  // Layout
  const [cinemaMode, setCinemaMode] = useState<CinemaLayoutMode>('standard');
  const [showSidebarInCinema, setShowSidebarInCinema] = useState(true);
  const [subtitleFontScale, setSubtitleFontScale] = useState<'normal' | 'large' | 'xl'>('large');
  const [studioTab, setStudioTab] = useState<StudioTab>('sentence');

  // Subtitle list
  const [subtitleMode, setSubtitleMode] = useState<SubtitleDisplayMode>('bilingual');
  const [autoScroll, setAutoScroll] = useState(true);
  const [subtitleSearch, setSubtitleSearch] = useState('');

  // Analysis
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [focusMode, setFocusMode] = useState<FocusMode>('tech-interview');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [analyzeBanner, setAnalyzeBanner] = useState<{
    type: 'info' | 'warning' | 'success';
    text: string;
  } | null>(null);

  const [savedWords, setSavedWords] = useState<SavedWordItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_WORDS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [apiKey, setApiKey] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.API_KEY) || ''
  );
  const [selectedKeywordModal, setSelectedKeywordModal] = useState<{
    keyword: KeywordItem;
    sentence: SubtitleItem;
  } | null>(null);
  const [tutorSentence, setTutorSentence] = useState<SubtitleItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  // Persist only user-analyzed lessons (cached ones are re-fetched on load and are too big for localStorage)
  useEffect(() => {
    try {
      const userOnly = customLessons
        .filter((l) => !cachedLessonIdsRef.current.has(l.id))
        .slice(0, 6);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LESSONS, JSON.stringify(userOnly));
    } catch {
      // ignore storage quota errors
    }
  }, [customLessons]);

  // Auto-dismiss success banners
  useEffect(() => {
    if (analyzeBanner?.type !== 'success') return;
    const t = window.setTimeout(() => setAnalyzeBanner(null), 5000);
    return () => window.clearTimeout(t);
  }, [analyzeBanner]);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, newKey);
    } catch {
      // ignore
    }
  };

  // Load full-length cached lessons (dev server API, or static ./cache on GitHub Pages) and merge
  useEffect(() => {
    const applyItems = (items: VideoLesson[]) => {
      if (!items.length) return;
      items.forEach((it) => cachedLessonIdsRef.current.add(it.id));
      setCustomLessons((prev) => {
        const cachedVideoIds = new Set(items.map((i) => i.videoId));
        return [...items, ...prev.filter((p) => !cachedVideoIds.has(p.videoId))];
      });
    };
    fetch('/api/cache?full=1')
      .then((r) => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !ct.includes('application/json')) throw new Error('STATIC');
        return r.json();
      })
      .then((data) => applyItems(Array.isArray(data?.items) ? data.items : []))
      .catch(async () => applyItems(await loadCachedLessonsClientFallback()));
  }, []);

  // Sync state when the user leaves browser fullscreen with Esc
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setCinemaMode((prev) => (prev === 'fullscreen-cinema' ? 'standard' : prev));
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleChangeCinemaMode = (nextMode: CinemaLayoutMode) => {
    setCinemaMode(nextMode);
    if (nextMode !== 'standard') setShowSidebarInCinema(true);
    try {
      if (nextMode === 'fullscreen-cinema') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    } catch {
      // ignore if blocked
    }
  };

  const selectLesson = (videoId: string) => {
    setCurrentVideoId(videoId);
    setCurrentTime(0);
    setIsPlaying(false);
    setSubtitleSearch('');
  };

  // Exact active subtitle (with 80ms lookahead to compensate for YouTube IFrame postMessage latency)
  const activeSubtitle = useMemo(() => {
    const t = currentTime + 0.08;
    return currentLesson.subtitles.find((s) => t >= s.start && t < s.end);
  }, [currentLesson.subtitles, currentTime]);

  // Latched subtitle: holds the last spoken sentence during pauses and defaults to the first one
  const latchedSubtitle = useMemo(() => {
    if (activeSubtitle) return activeSubtitle;
    const subs = currentLesson.subtitles;
    if (subs.length === 0) return undefined;
    for (let i = subs.length - 1; i >= 0; i--) {
      if (subs[i].start <= currentTime) return subs[i];
    }
    return subs[0];
  }, [activeSubtitle, currentLesson.subtitles, currentTime]);

  // Current-sentence keywords, topped up with the next sentences' keywords so the grid is never empty
  const contextualKeywords = useMemo(() => {
    if (!latchedSubtitle) return [];
    const items: Array<{ keyword: KeywordItem; sentence: SubtitleItem; isPreview: boolean }> = [];
    const seen = new Set<string>();
    const push = (kw: KeywordItem, sentence: SubtitleItem, isPreview: boolean) => {
      const k = kw.lemma.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      items.push({ keyword: kw, sentence, isPreview });
    };
    (latchedSubtitle.keywords || []).forEach((kw) => push(kw, latchedSubtitle, false));
    const subs = currentLesson.subtitles;
    const startIdx = subs.findIndex((s) => s.id === latchedSubtitle.id);
    for (let i = startIdx + 1; i < subs.length && items.length < 3; i++) {
      for (const kw of subs[i].keywords || []) {
        push(kw, subs[i], true);
        if (items.length >= 3) break;
      }
    }
    return items;
  }, [latchedSubtitle, currentLesson.subtitles]);

  const isTheaterSplit = cinemaMode === 'theater-split';
  const isTheaterBottom = cinemaMode === 'theater-bottom';
  const isTheaterAny = isTheaterSplit || isTheaterBottom;
  const isFullscreenCinema = cinemaMode === 'fullscreen-cinema';
  const isSidebarVisible =
    cinemaMode === 'standard' || isTheaterBottom || showSidebarInCinema;

  // Smooth auto-scroll of the subtitle list
  const subtitleListRef = useRef<HTMLDivElement | null>(null);
  const subtitleItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  useEffect(() => {
    if (!autoScroll || !isSidebarVisible || !activeSubtitle) return;
    const node = subtitleItemRefs.current[activeSubtitle.id];
    const list = subtitleListRef.current;
    if (node && list) {
      // Scroll only inside the list so the page itself doesn't jump
      const top = node.offsetTop - list.clientHeight / 2 + node.clientHeight / 2;
      list.scrollTo({ top, behavior: 'smooth' });
    }
  }, [activeSubtitle?.id, autoScroll, isSidebarVisible]);

  const triggerSeek = (seconds: number) => {
    setSeekRequest({ time: seconds, seq: Date.now() });
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      if (document.querySelector('dialog[open]')) return;

      const subs = currentLesson.subtitles;
      const currIdx = latchedSubtitle ? subs.findIndex((s) => s.id === latchedSubtitle.id) : 0;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowLeft':
          if (!subs.length) return;
          e.preventDefault();
          triggerSeek(subs[Math.max(0, currIdx - 1)].start);
          break;
        case 'ArrowRight':
          if (!subs.length) return;
          e.preventDefault();
          triggerSeek(subs[Math.min(subs.length - 1, currIdx + 1)].start);
          break;
        case 'KeyL':
          e.preventDefault();
          setSentenceLoop((prev) => !prev);
          break;
        case 'KeyM':
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
          break;
        case 'KeyR':
          if (!latchedSubtitle) return;
          e.preventDefault();
          triggerSeek(latchedSubtitle.start);
          setIsPlaying(true);
          break;
        case 'KeyT':
          e.preventDefault();
          handleChangeCinemaMode(cinemaMode === 'theater-split' ? 'standard' : 'theater-split');
          break;
        case 'KeyF':
          e.preventDefault();
          handleChangeCinemaMode(
            cinemaMode === 'fullscreen-cinema' ? 'standard' : 'fullscreen-cinema'
          );
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [latchedSubtitle, currentLesson.subtitles, cinemaMode]);

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
        if (!contentType.includes('application/json')) throw new Error('STATIC_HOST_FALLBACK');

        const data = await res.json();
        if (!res.ok) {
          if (data.error === 'CAPTION_FETCH_FAILED') {
            setAnalyzeBanner({ type: 'warning', text: data.message });
            setSettingsOpen(true);
            return;
          }
          throw new Error(data.message || 'BACKEND_ERROR');
        }
        newLesson = data;
      } catch {
        // GitHub Pages (static host): run Gemini 2.5 Flash or static cache directly in the browser
        newLesson = await analyzeYoutubeInBrowser({
          urlOrId: targetUrl,
          focusMode,
          apiKey,
          customTranscript: options?.customTranscript,
          customTitle: options?.customTitle
        });
      }

      if (!newLesson) return;
      const lesson = newLesson;

      setCustomLessons((prev) => [
        lesson,
        ...prev.filter((item) => item.videoId !== lesson.videoId)
      ]);
      selectLesson(lesson.videoId);
      setEngineMode('youtube');
      setYoutubeUrlInput('');
      setAnalyzeBanner({
        type: 'success',
        text: `${lesson.cached ? '已載入' : '解析完成'}「${lesson.title}」・共 ${lesson.subtitles.length} 句`
      });
    } catch (err: any) {
      setAnalyzeBanner({
        type: 'warning',
        text:
          err?.message === 'STATIC_HOST_NEEDS_API_KEY'
            ? '解析新影片需要 Gemini API Key：請在「設定」中填入（只存在你的瀏覽器），或貼上字幕文字匯入。'
            : '影片解析失敗，請確認網址，或在「設定」填入 Gemini API Key / 貼上字幕匯入。'
      });
      setSettingsOpen(true);
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
          (k) => k.lemma.toLowerCase().includes(q) || k.meaning.toLowerCase().includes(q)
        )
    );
  }, [currentLesson.subtitles, subtitleSearch]);

  const totalVideoKeywords = useMemo(() => {
    const seen = new Set<string>();
    for (const s of currentLesson.subtitles) {
      for (const k of s.keywords || []) {
        seen.add(k.lemma.toLowerCase());
      }
    }
    return seen.size;
  }, [currentLesson.subtitles]);

  const isPreviewLesson = currentLesson.subtitles.length < 15;

  const enFontSizeClass =
    subtitleFontScale === 'xl'
      ? 'text-base sm:text-lg'
      : subtitleFontScale === 'large'
        ? 'text-[15px] sm:text-base'
        : 'text-sm';

  const zhFontSizeClass =
    subtitleFontScale === 'xl'
      ? 'text-sm sm:text-base'
      : subtitleFontScale === 'large'
        ? 'text-[13px] sm:text-sm'
        : 'text-xs sm:text-[13px]';

  const panelCard =
    'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm';

  /* ---------------- Under-video study panel ---------------- */
  const renderStudyPanel = () => (
    <section aria-label="學習面板" className={`${panelCard} overflow-hidden flex flex-col`}>
      <nav
        aria-label="學習功能"
        className="px-2 pt-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto custom-scroller"
      >
        {(
          [
            { id: 'sentence', label: '本句解析', icon: Sparkles },
            { id: 'vocabulary', label: '單字庫', icon: BookOpen, count: totalVideoKeywords },
            { id: 'shadowing', label: '跟讀', icon: Mic },
            { id: 'quiz', label: '測驗', icon: HelpCircle, count: currentLesson.quiz.length },
            { id: 'summary', label: '摘要', icon: FileText }
          ] as Array<{ id: StudioTab; label: string; icon: any; count?: number }>
        ).map((t) => {
          const Icon = t.icon;
          const selected = studioTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setStudioTab(t.id)}
              aria-pressed={selected}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 -mb-px transition cursor-pointer ${
                selected
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {t.label}
              {typeof t.count === 'number' && t.count > 0 && (
                <span className="text-[10px] font-semibold text-slate-400">{t.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {studioTab === 'sentence' &&
        (latchedSubtitle ? (
          <div className="p-4 space-y-4">
            {/* Current sentence */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-base sm:text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
                  <InlineKeywordHighlighter
                    sentence={latchedSubtitle}
                    savedWordSet={savedWordSet}
                    onSelectKeyword={(keyword, sentence) =>
                      setSelectedKeywordModal({ keyword, sentence })
                    }
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => speak(latchedSubtitle.en, 0.8)}
                    aria-label="慢速朗讀本句"
                    title="慢速朗讀 (0.8x)"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Snail className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorSentence(latchedSubtitle)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                    AI 拆解
                  </button>
                </div>
              </div>
              <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {latchedSubtitle.zh}
              </p>
              {latchedSubtitle.grammarNote && (
                <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/35 border border-indigo-200/60 dark:border-indigo-900/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                    <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                    線上家教隨堂導讀：
                  </span>
                  <span>{latchedSubtitle.grammarNote}</span>
                </div>
              )}
            </div>

            {/* Keywords */}
            {contextualKeywords.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {contextualKeywords.map(({ keyword: kw, sentence, isPreview }, idx) => {
                  const isSaved = savedWordSet.has(kw.lemma.toLowerCase());
                  const isPhrase = kw.pos === 'phr.' || kw.word.trim().includes(' ');
                  return (
                    <article
                      key={`${kw.lemma}-${idx}`}
                      className={`group/kw relative p-3 rounded-xl border transition ${
                        isPhrase
                          ? 'hover:border-emerald-400'
                          : 'hover:border-indigo-400'
                      } ${
                        isPreview
                          ? 'border-dashed border-slate-300 dark:border-slate-700'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedKeywordModal({ keyword: kw, sentence })}
                        className="block w-full text-left cursor-pointer space-y-1"
                      >
                        <span className="flex flex-wrap items-baseline gap-x-1.5 pr-14">
                          <span
                            className={`text-sm font-extrabold ${
                              isPhrase
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {kw.lemma}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isPhrase
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                            }`}
                          >
                            {isPhrase ? '實用片語' : kw.pos}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{kw.phonetic}</span>
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                          {kw.meaning}
                        </span>
                        {kw.exampleEn && (
                          <span className="block text-[11px] italic text-slate-500 dark:text-slate-400 line-clamp-1">
                            {kw.exampleEn}
                          </span>
                        )}
                      </button>
                      <div className="absolute top-2 right-2 flex items-center">
                        <button
                          type="button"
                          onClick={() => speak(kw.lemma)}
                          aria-label={`發音 ${kw.lemma}`}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-500 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSaveWord(kw, sentence)}
                          aria-label={isSaved ? `取消收藏 ${kw.lemma}` : `收藏 ${kw.lemma}`}
                          aria-pressed={isSaved}
                          className={`p-1 rounded-md cursor-pointer ${
                            isSaved ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {isPreview && (
                        <span className="absolute bottom-2 right-2.5 text-[10px] text-slate-400">
                          下一句
                        </span>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-slate-500">這部影片還沒有字幕資料。</p>
        ))}

      {studioTab === 'vocabulary' && (
        <div className="p-4 max-h-[480px] custom-scroller">
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

      {studioTab === 'shadowing' && (
        <div className="p-4 max-h-[480px] custom-scroller">
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

      {studioTab === 'quiz' && (
        <div className="p-4 max-h-[480px] custom-scroller">
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

      {studioTab === 'summary' && (
        <div className="p-4 space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {currentLesson.summary.difficultyLevel}
            </span>
            <span className="text-xs text-slate-500">
              {currentLesson.subtitles.length} 句・{totalVideoKeywords} 個重點單字
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentLesson.summary.overviewZh}
          </p>
          <ul className="space-y-1.5 text-[13px] text-slate-700 dark:text-slate-300">
            {currentLesson.summary.keyTakeaways.map((pt, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={analyzing}
            onClick={() => handleAnalyzeYoutube({ customUrl: currentLesson.videoId, forceRefresh: true })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            重新解析這部影片
          </button>
        </div>
      )}
    </section>
  );

  /* ---------------- Subtitle list sidebar ---------------- */
  const sidebarHeightClass = isFullscreenCinema
    ? 'h-dvh'
    : isTheaterBottom
      ? 'h-[560px]'
      : 'h-[520px] lg:h-[calc(100dvh-7.5rem)]';

  const renderSubtitleSidebar = () => (
    <aside
      aria-label="雙語字幕"
      className={`${sidebarHeightClass} flex flex-col overflow-hidden ${
        isFullscreenCinema
          ? 'border-l border-slate-800 bg-slate-900'
          : `${panelCard} ${isTheaterBottom ? '' : 'lg:sticky lg:top-16'}`
      }`}
    >
      {/* Toolbar */}
      <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div
            role="group"
            aria-label="字幕顯示模式 (M)"
            className="inline-flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold"
          >
            {[
              { id: 'bilingual', label: '中英' },
              { id: 'en-only', label: '純英' },
              { id: 'cloze-blur', label: '遮罩' },
              { id: 'blind-listen', label: '裸聽' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={subtitleMode === m.id}
                onClick={() => setSubtitleMode(m.id as SubtitleDisplayMode)}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  subtitleMode === m.id
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() =>
                setSubtitleFontScale((prev) =>
                  prev === 'normal' ? 'large' : prev === 'large' ? 'xl' : 'normal'
                )
              }
              aria-label="切換字級"
              title={`字級：${subtitleFontScale === 'normal' ? '標準' : subtitleFontScale === 'large' ? '大' : '特大'}`}
              className="inline-flex items-center gap-0.5 p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <TypeIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] font-bold">
                {subtitleFontScale === 'normal' ? 'S' : subtitleFontScale === 'large' ? 'M' : 'L'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAutoScroll((prev) => !prev)}
              aria-pressed={autoScroll}
              title="字幕自動跟隨播放位置"
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                autoScroll
                  ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-500/10'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              自動跟隨
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={subtitleSearch}
            onChange={(e) => setSubtitleSearch(e.target.value)}
            placeholder={`搜尋 ${currentLesson.subtitles.length} 句字幕或單字`}
            aria-label="搜尋字幕"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* List */}
      <div ref={subtitleListRef} className="relative flex-1 custom-scroller p-2 space-y-1">
        {filteredSubtitles.length === 0 && (
          <p className="p-6 text-center text-xs text-slate-500">找不到符合「{subtitleSearch}」的字幕</p>
        )}
        {filteredSubtitles.map((sub) => {
          const isActive = activeSubtitle?.id === sub.id;
          return (
            <div
              key={sub.id}
              ref={(el) => {
                subtitleItemRefs.current[sub.id] = el;
              }}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => {
                triggerSeek(sub.start);
                setIsPlaying(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  triggerSeek(sub.start);
                  setIsPlaying(true);
                }
              }}
              className={`group relative pl-3 pr-2 py-2.5 rounded-xl border-l-[3px] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span
                  className={`text-[11px] font-mono ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {formatClock(sub.start)}
                </span>
                <div
                  className={`flex items-center gap-0.5 transition ${
                    isActive
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => speak(sub.en)}
                    aria-label="朗讀此句"
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-500 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorSentence(sub)}
                    aria-label="AI 拆解此句"
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-500 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div
                className={`${enFontSizeClass} font-medium leading-relaxed transition ${
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'
                } ${
                  subtitleMode === 'blind-listen'
                    ? 'blur-md select-none group-hover:blur-none'
                    : subtitleMode === 'cloze-blur'
                      ? 'blur-[3px] group-hover:blur-none'
                      : ''
                }`}
              >
                <InlineKeywordHighlighter
                  sentence={sub}
                  savedWordSet={savedWordSet}
                  onSelectKeyword={(keyword, sentence) => setSelectedKeywordModal({ keyword, sentence })}
                />
              </div>

              {(subtitleMode === 'bilingual' || subtitleMode === 'cloze-blur') && (
                <p
                  className={`mt-0.5 ${zhFontSizeClass} text-slate-500 dark:text-slate-400 leading-relaxed transition ${
                    subtitleMode === 'cloze-blur' ? 'blur-xs group-hover:blur-none' : ''
                  }`}
                >
                  {sub.zh}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );

  /* ---------------- Layout ---------------- */
  const showStudyUnderVideo = !isTheaterBottom && (!isFullscreenCinema || showSidebarInCinema);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100">
      {!isFullscreenCinema && (
        <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 h-13 flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <h1 className="hidden sm:block text-sm font-extrabold tracking-tight">TubeFluent AI</h1>
            </div>

            <search className="flex-1 max-w-2xl mx-auto min-w-0">
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
                    type="url"
                    inputMode="url"
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    placeholder="貼上 YouTube 網址，AI 產生雙語字幕"
                    aria-label="YouTube 影片網址"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={focusMode}
                  onChange={(e) => setFocusMode(e.target.value as FocusMode)}
                  aria-label="單字挑選方向"
                  title="單字挑選方向"
                  className="hidden lg:block px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-xs cursor-pointer"
                >
                  <option value="tech-interview">科技職場</option>
                  <option value="toeic-business">多益商務</option>
                  <option value="daily-idioms">日常口語</option>
                  <option value="academic-ted">TED 學術</option>
                </select>
                <button
                  type="submit"
                  disabled={analyzing || !youtubeUrlInput.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {analyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">{analyzing ? '解析中' : '分析'}</span>
                </button>
              </form>
            </search>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label="設定"
                title={apiKey ? '設定（已設定 API Key）' : '設定'}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
                {apiKey && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="切換深淺色"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Playlist */}
      {!isFullscreenCinema && (
        <nav
          aria-label="影片清單"
          className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40"
        >
          <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 py-1.5 flex items-center gap-1.5 overflow-x-auto custom-scroller">
            {allLessons.map((lesson) => {
              const isSelected = lesson.videoId === currentLesson.videoId;
              const isUserLesson =
                !cachedLessonIdsRef.current.has(lesson.id) &&
                customLessons.some((c) => c.id === lesson.id);
              return (
                <div
                  key={lesson.videoId}
                  className={`shrink-0 inline-flex items-center rounded-full border text-xs transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectLesson(lesson.videoId)}
                    aria-pressed={isSelected}
                    title={lesson.title}
                    className="pl-3 pr-3 py-1 font-medium cursor-pointer max-w-[260px] truncate"
                  >
                    {lesson.title}
                  </button>
                  {isUserLesson && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = customLessons.filter((c) => c.id !== lesson.id);
                        setCustomLessons(next);
                        if (isSelected) {
                          selectLesson(dedupeByVideo([...next, ...CURATED_VIDEOS])[0].videoId);
                        }
                      }}
                      aria-label={`移除 ${lesson.title}`}
                      className="pr-2 -ml-1 opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}

      {/* Analysis progress */}
      {analyzing && (
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 pt-2.5" role="status">
          <div className="px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3 text-xs">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" aria-hidden="true" />
            <span className="font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">
              {['擷取字幕', '智慧斷句', '雙語翻譯與單字', '生成測驗'][Math.max(0, analyzeStep - 1)]}⋯
            </span>
            <div className="flex-1 h-1 rounded-full bg-indigo-500/15 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-700"
                style={{ width: `${(analyzeStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      {analyzeBanner && !isFullscreenCinema && (
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 pt-2.5" role="status">
          <div
            className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              analyzeBanner.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
            }`}
          >
            <span>{analyzeBanner.text}</span>
            <button
              type="button"
              onClick={() => setAnalyzeBanner(null)}
              aria-label="關閉通知"
              className="p-0.5 rounded opacity-70 hover:opacity-100 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Preview-lesson hint (only for the short built-in demos) */}
      {isPreviewLesson && !analyzing && !isFullscreenCinema && (
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 pt-2.5">
          <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
            <span>這是 {currentLesson.subtitles.length} 句的精選試聽版。</span>
            <button
              type="button"
              onClick={() => handleAnalyzeYoutube({ customUrl: currentLesson.videoId })}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              載入完整版
            </button>
          </div>
        </div>
      )}

      <main
        className={
          isFullscreenCinema
            ? 'fixed inset-0 z-40 w-full h-dvh bg-slate-950 grid grid-cols-1 lg:grid-cols-12 overflow-hidden'
            : `w-full ${isTheaterAny ? 'max-w-[1920px]' : 'max-w-[1680px]'} mx-auto px-3 sm:px-5 py-3 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start`
        }
      >
        {/* Video column */}
        <div
          className={
            isTheaterBottom
              ? 'lg:col-span-12 flex flex-col gap-4'
              : isFullscreenCinema
                ? showSidebarInCinema
                  ? 'lg:col-span-8 xl:col-span-9 h-dvh overflow-y-auto custom-scroller p-3 flex flex-col gap-3'
                  : 'lg:col-span-12 h-dvh flex flex-col justify-center p-3'
                : isTheaterSplit
                  ? showSidebarInCinema
                    ? 'lg:col-span-8 xl:col-span-9 flex flex-col gap-4'
                    : 'lg:col-span-12 flex flex-col gap-4'
                  : 'lg:col-span-7 flex flex-col gap-4'
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
            showCompactSubtitleBar={!isSidebarVisible}
            onCinemaModeChange={handleChangeCinemaMode}
            onToggleSidebarInCinema={() => setShowSidebarInCinema((prev) => !prev)}
            onTimeUpdate={setCurrentTime}
            onPlayStateChange={setIsPlaying}
            onToggleSentenceLoop={() => setSentenceLoop((prev) => !prev)}
            onEngineModeChange={setEngineMode}
            onPlaybackRateChange={setPlaybackRate}
            onSelectKeyword={(keyword, sentence) => setSelectedKeywordModal({ keyword, sentence })}
            seekRequest={seekRequest}
          />

          {showStudyUnderVideo && renderStudyPanel()}
        </div>

        {/* Theater-bottom: study panel + subtitle list side by side under the video */}
        {isTheaterBottom && <div className="lg:col-span-7">{renderStudyPanel()}</div>}

        {isSidebarVisible && (
          <div
            className={
              isTheaterBottom
                ? 'lg:col-span-5'
                : isFullscreenCinema
                  ? 'lg:col-span-4 xl:col-span-3'
                  : isTheaterSplit
                    ? 'lg:col-span-4 xl:col-span-3'
                    : 'lg:col-span-5'
            }
          >
            {renderSubtitleSidebar()}
          </div>
        )}
      </main>

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
