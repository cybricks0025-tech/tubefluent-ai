import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Volume2,
  Download,
  Layers,
  Trash2,
  RotateCw,
  ArrowUpRight
} from 'lucide-react';
import { KeywordItem, SavedWordItem, SubtitleItem } from '../types';

interface VocabularyVaultProps {
  subtitles: SubtitleItem[];
  savedWords: SavedWordItem[];
  onToggleSaveWord: (kw: KeywordItem, sentence: SubtitleItem) => void;
  onRemoveSavedWord: (lemma: string) => void;
  onJumpToTime: (seconds: number) => void;
}

export const VocabularyVault: React.FC<VocabularyVaultProps> = ({
  subtitles,
  savedWords,
  onToggleSaveWord,
  onRemoveSavedWord,
  onJumpToTime
}) => {
  const [subTab, setSubTab] = useState<'video-words' | 'personal-book' | 'flashcards'>('video-words');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Flatten all keywords from the current video
  const videoKeywords = subtitles.flatMap((sub) =>
    (sub.keywords || []).map((kw) => ({
      ...kw,
      sentence: sub
    }))
  );

  const savedLemmaSet = new Set(savedWords.map((w) => w.lemma.toLowerCase()));

  const speakWord = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const exportVocabulary = (format: 'csv' | 'anki-tsv') => {
    const targetList =
      savedWords.length > 0
        ? savedWords
        : videoKeywords.map((vk) => ({
            ...vk,
            savedAt: new Date().toISOString(),
            sourceVideoId: '',
            sourceVideoTitle: 'Current Video',
            sourceSentenceEn: vk.sentence.en,
            sourceSentenceZh: vk.sentence.zh,
            sourceTimestamp: vk.sentence.start
          }));

    if (targetList.length === 0) return;

    if (format === 'anki-tsv') {
      // Anki Front \t Back format
      const lines = targetList.map((w) => {
        const front = `${w.lemma} (${w.pos}) ${w.phonetic}`;
        const back = `${w.meaning}<br><br><b>影片原句：</b>${w.sourceSentenceEn}<br>${w.sourceSentenceZh}<br><br><b>延伸例句：</b>${w.exampleEn}<br>${w.exampleZh}`;
        return `${front.replace(/\t/g, ' ')}\t${back.replace(/\t/g, ' ')}`;
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tubefluent-anki-cards-${Date.now()}.tsv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const header = ['單字原型 (Lemma)', '詞性', '音標', '語境中文解釋', '影片原句', '延伸英文例句', '延伸例句中譯'];
      const rows = targetList.map((w) =>
        [
          w.lemma,
          w.pos,
          w.phonetic,
          w.meaning,
          w.sourceSentenceEn,
          w.exampleEn,
          w.exampleZh
        ]
          .map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
          .join(',')
      );
      const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tubefluent-vocabulary-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const flashcardDeck =
    savedWords.length > 0
      ? savedWords
      : videoKeywords.map((vk) => ({
          ...vk,
          savedAt: '',
          sourceVideoId: '',
          sourceVideoTitle: '本片核心字彙',
          sourceSentenceEn: vk.sentence.en,
          sourceSentenceZh: vk.sentence.zh,
          sourceTimestamp: vk.sentence.start
        }));

  const activeFlashcard = flashcardDeck[cardIndex % Math.max(1, flashcardDeck.length)];

  return (
    <div className="space-y-4">
      {/* Sub-navigation & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setSubTab('video-words')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              subTab === 'video-words'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            本片字彙 ({videoKeywords.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('personal-book')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              subTab === 'personal-book'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            個人單字本 ({savedWords.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setCardIndex(0);
              setIsFlipped(false);
              setSubTab('flashcards');
            }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              subTab === 'flashcards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            閃卡記憶
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => exportVocabulary('anki-tsv')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            匯出 Anki (.tsv)
          </button>
          <button
            type="button"
            onClick={() => exportVocabulary('csv')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            匯出 CSV
          </button>
        </div>
      </div>

      {/* Mode 1: Current Video Keywords */}
      {subTab === 'video-words' && (
        <div className="space-y-3">
          {videoKeywords.map((item, idx) => {
            const isSaved = savedLemmaSet.has(item.lemma.toLowerCase());
            return (
              <div
                key={`${item.lemma}-${idx}`}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {item.lemma}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                      {item.pos}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.phonetic}</span>
                    {item.level && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {item.level}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => speakWord(item.lemma)}
                      aria-label={`發音 ${item.lemma}`}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-500 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onJumpToTime(item.sentence.start)}
                      className="inline-flex items-center gap-0.5 text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      跳轉 {item.sentence.start.toFixed(1)}s
                      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSaveWord(item, item.sentence)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSaved
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          已收藏
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                          收藏
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  語境字義：{item.meaning}
                </p>

                <div className="text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      AI 職場／科技延伸例句：
                    </span>
                    <button
                      type="button"
                      onClick={() => speakWord(item.exampleEn)}
                      className="text-slate-400 hover:text-indigo-500 cursor-pointer"
                      aria-label="朗讀例句"
                    >
                      <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{item.exampleEn}</p>
                  <p className="text-slate-500 dark:text-slate-400">{item.exampleZh}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Cross-Video Personal Vocabulary Book */}
      {subTab === 'personal-book' && (
        <div className="space-y-3">
          {savedWords.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-400" aria-hidden="true" />
              <p className="text-sm font-semibold">您的個人單字本目前是空的</p>
              <p className="text-xs">
                點擊字幕中的底線單字，或從「本片字彙」按下收藏，系統即會跨影片自動保存並支援一鍵匯出至 Anki！
              </p>
            </div>
          ) : (
            savedWords.map((item) => (
              <div
                key={item.lemma}
                className="p-4 rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {item.lemma}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.pos}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.phonetic}</span>
                    <button
                      type="button"
                      onClick={() => speakWord(item.lemma)}
                      className="p-1 text-slate-400 hover:text-indigo-500 cursor-pointer"
                      aria-label={`發音 ${item.lemma}`}
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSavedWord(item.lemma)}
                    aria-label="移除收藏"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {item.meaning}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  影片原句：{item.sourceSentenceEn}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mode 3: Interactive Flashcard Deck */}
      {subTab === 'flashcards' && activeFlashcard && (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[230px] p-6 rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-white to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 flex flex-col items-center justify-center text-center cursor-pointer select-none shadow-xs transition hover:border-indigo-500"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500 mb-2">
              {isFlipped ? '背面：語境定義與延伸例句' : '正面：點擊卡片翻面檢視解釋'} (
              {(cardIndex % flashcardDeck.length) + 1} / {flashcardDeck.length})
            </span>

            {!isFlipped ? (
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeFlashcard.lemma}
                </h3>
                <p className="text-sm text-slate-500 font-mono">
                  {activeFlashcard.pos} · {activeFlashcard.phonetic}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(activeFlashcard.lemma);
                  }}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  聆聽發音
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-w-md">
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                  {activeFlashcard.meaning}
                </p>
                <div className="text-xs text-left bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl space-y-1 border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {activeFlashcard.exampleEn}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{activeFlashcard.exampleZh}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCardIndex(
                  (prev) => (prev - 1 + flashcardDeck.length) % flashcardDeck.length
                );
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ← 上一張
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-semibold cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
              翻面
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev + 1) % flashcardDeck.length);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer hover:bg-indigo-500"
            >
              下一張 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
