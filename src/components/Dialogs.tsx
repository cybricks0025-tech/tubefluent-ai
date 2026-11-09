import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  X,
  Sparkles,
  KeyRound,
  FileText,
  GraduationCap,
  Send
} from 'lucide-react';
import {
  FocusMode,
  KeywordItem,
  SentenceTutorBreakdown,
  SubtitleItem
} from '../types';
import { askSentenceTutorClientFallback } from '../services/clientAnalyzer';

/**
 * Shared Native Modal Dialog wrapper following modern-web-guidance:
 * - Uses native <dialog closedby="any" aria-labelledby={titleId}> opened with .showModal()
 * - Includes mandatory coordinate-based light-dismiss fallback for browsers without native closedBy support
 * - Avoids redundant role="dialog" or aria-modal attributes
 */
interface NativeModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const NativeModalDialog: React.FC<NativeModalDialogProps> = ({
  open,
  onClose,
  title,
  children
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Fallback for browsers without closedby support (light-dismiss-a-dialog guide)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('close', handleClose);

    let handleBackdropClick: ((event: MouseEvent) => void) | null = null;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (handleBackdropClick) {
        dialog.removeEventListener('click', handleBackdropClick);
      }
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as any)}
      className="m-auto w-[92vw] max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-0 shadow-2xl"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 id={titleId} className="text-base font-bold flex items-center gap-2">
          {title}
        </h2>
        <form method="dialog">
          <button
            type="submit"
            value="cancel"
            aria-label="關閉視窗"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
};

/* 1. Word Popover Card Modal (即時浮動字卡) */
interface WordCardModalProps {
  selected: { keyword: KeywordItem; sentence: SubtitleItem } | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (kw: KeywordItem, sentence: SubtitleItem) => void;
}

export const WordCardModal: React.FC<WordCardModalProps> = ({
  selected,
  isSaved,
  onClose,
  onToggleSave
}) => {
  const speak = (text: string, rate = 1.0) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    window.speechSynthesis.speak(u);
  };

  return (
    <NativeModalDialog
      open={Boolean(selected)}
      onClose={onClose}
      title={selected ? `語境字彙精析：${selected.keyword.lemma}` : '語境字彙卡'}
    >
      {selected && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {selected.keyword.lemma}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                {selected.keyword.pos}
              </span>
              <span className="text-sm font-mono text-slate-500">
                {selected.keyword.phonetic}
              </span>
              {selected.keyword.level && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {selected.keyword.level}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => speak(selected.keyword.lemma, 1.0)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                發音
              </button>
              <button
                type="button"
                onClick={() => onToggleSave(selected.keyword, selected.sentence)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    已收入單字本
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                    加入單字本
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              在該句語境下的精準解釋：
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {selected.keyword.meaning}
            </p>
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="font-semibold text-slate-500 dark:text-slate-400">
              影片原句
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {selected.sentence.en}
              </p>
              <p className="text-slate-500 dark:text-slate-400">{selected.sentence.zh}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                🚀 AI 延伸職場／科技實用造句：
              </span>
              <button
                type="button"
                onClick={() => speak(selected.keyword.exampleEn, 0.95)}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                朗讀例句
              </button>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {selected.keyword.exampleEn}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {selected.keyword.exampleZh}
              </p>
            </div>
          </div>
        </div>
      )}
    </NativeModalDialog>
  );
};

/* 2. AI Sentence Deep-Dive Tutor Dialog (AI 單句語法與連音深究助教) */
interface SentenceTutorDialogProps {
  sentence: SubtitleItem | null;
  videoTitle: string;
  apiKey: string;
  onClose: () => void;
}

export const SentenceTutorDialog: React.FC<SentenceTutorDialogProps> = ({
  sentence,
  videoTitle,
  apiKey,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<SentenceTutorBreakdown | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  useEffect(() => {
    if (!sentence) {
      setBreakdown(null);
      setCustomQuestion('');
      return;
    }
    fetchTutorBreakdown('');
  }, [sentence?.id]);

  const fetchTutorBreakdown = async (questionText: string) => {
    if (!sentence) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentenceEn: sentence.en,
          sentenceZh: sentence.zh,
          userQuestion: questionText,
          videoTitle,
          apiKey
        })
      });
      if (!res.ok) throw new Error('STATIC_FALLBACK');
      const data = await res.json();
      setBreakdown(data);
    } catch {
      const fallbackData = await askSentenceTutorClientFallback({
        sentenceEn: sentence.en,
        sentenceZh: sentence.zh,
        userQuestion: questionText,
        videoTitle,
        apiKey
      });
      setBreakdown(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NativeModalDialog
      open={Boolean(sentence)}
      onClose={onClose}
      title={sentence ? 'AI 句子拆解' : 'AI 語法助教'}
    >
      {sentence && (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">{sentence.en}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{sentence.zh}</p>
          </div>

          {loading ? (
            <div className="py-8 text-center space-y-2 text-slate-500">
              <Sparkles className="w-6 h-6 mx-auto text-indigo-500 animate-spin" aria-hidden="true" />
              <p className="text-xs">AI 助教正在拆解句型結構、母語連音與職場換句話說⋯</p>
            </div>
          ) : (
            breakdown && (
              <div className="space-y-3 max-h-[52vh] overflow-y-auto custom-scroller pr-1">
                <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-1">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                    句型結構拆解
                  </p>
                  <p className="text-xs leading-relaxed">{breakdown.structureBreakdown}</p>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    🎙️ 母語連音（Linking）與重音指南
                  </p>
                  <p className="text-xs leading-relaxed">{breakdown.pronunciationTips}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    💼 職場與外商會議換句話說（Paraphrases）：
                  </p>
                  {breakdown.workplaceParaphrases.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-0.5 text-xs"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{p.en}</p>
                      <p className="text-slate-500 dark:text-slate-400">{p.zh}</p>
                      <span className="inline-block text-[11px] text-indigo-600 dark:text-indigo-400">
                        情境：{p.nuance}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
                    AI 助教回饋：
                  </p>
                  <p>{breakdown.tutorReply}</p>
                </div>
              </div>
            )
          )}

          {/* Follow-up Question Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuestion.trim()) {
                fetchTutorBreakdown(customQuestion.trim());
              }
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="針對這句話追問 AI 助教（例如：為什麼這裡用動名詞？）"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !customQuestion.trim()}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              提問
            </button>
          </form>
        </div>
      )}
    </NativeModalDialog>
  );
};

/* 3. Settings & Custom Transcript Dialog (AI 設定與自訂字幕匯入) */
interface SettingsAndCustomTranscriptDialogProps {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  focusMode: FocusMode;
  onChangeFocusMode: (mode: FocusMode) => void;
  onSubmitCustomTranscript: (payload: {
    videoUrl: string;
    title: string;
    transcript: string;
  }) => void;
}

export const SettingsAndCustomTranscriptDialog: React.FC<
  SettingsAndCustomTranscriptDialogProps
> = ({
  open,
  onClose,
  apiKey,
  onSaveApiKey,
  focusMode,
  onChangeFocusMode,
  onSubmitCustomTranscript
}) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  return (
    <NativeModalDialog
      open={open}
      onClose={onClose}
      title="⚙️ AI 引擎設定 & 自訂字幕匯入"
    >
      <div className="space-y-5 text-xs sm:text-sm">
        {/* Gemini API Key Section */}
        <div className="space-y-2">
          <label
            htmlFor="gemini-api-key-input"
            className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            Gemini API Key (`gemini-2.5-flash` 結構化雙語輸出)
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            金鑰僅儲存於您的瀏覽器本機 (`localStorage`)。設定後貼上任何 YouTube 網址，系統即透過 Structured Outputs 100% 自動生成雙語翻譯、重點字卡與隨堂測驗！
          </p>
          <div className="flex gap-2">
            <input
              id="gemini-api-key-input"
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => {
                onSaveApiKey(localKey.trim());
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              儲存金鑰
            </button>
          </div>
        </div>

        {/* Focus Persona Mode */}
        <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            🎯 AI 單字標記與造句專項領域（Focus Mode）
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'tech-interview', label: '💻 科技外商與工程面試' },
              { id: 'toeic-business', label: '📈 多益 TOEIC 商務職場' },
              { id: 'daily-idioms', label: '🗣️ 母語日常連音與片語' },
              { id: 'academic-ted', label: '🎓 TED 演講與邏輯表達' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeFocusMode(item.id as FocusMode)}
                className={`p-2.5 rounded-xl border text-left font-medium transition cursor-pointer ${
                  focusMode === item.id
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual / Custom Transcript Paste Fallback */}
        <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            手動貼上字幕或英文逐字稿（針對未開放 CC 字幕之影片）
          </p>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="自訂影片標題（選填，例如：OpenAI DevDay Keynote）"
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="對應 YouTube 網址（選填，留空則使用 AI 語音播講引擎）"
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="貼上任意英文演講稿、會議記錄或含 [00:12] 時間戳的字幕，系統將自動完成智慧斷句與雙語單字解析⋯"
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
          <button
            type="button"
            disabled={customText.trim().length < 12}
            onClick={() => {
              onSubmitCustomTranscript({
                videoUrl: customUrl.trim(),
                title: customTitle.trim() || '自訂英文逐字稿互動課程',
                transcript: customText.trim()
              });
              setCustomText('');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
          >
            立即執行智慧斷句與 AI 雙語解析
          </button>
        </div>
      </div>
    </NativeModalDialog>
  );
};
