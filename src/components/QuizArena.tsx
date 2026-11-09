import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { QuizQuestion } from '../types';

const fmtClock = (sec: number) => { const t = Math.max(0, Math.floor(sec)); const h = Math.floor(t / 3600); const m = Math.floor((t % 3600) / 60); const s = String(t % 60).padStart(2, '0'); return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`; };

interface QuizArenaProps {
  quiz: QuizQuestion[];
  videoId: string;
  onJumpToTime: (seconds: number) => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ quiz, videoId, onJumpToTime }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted(false);
  }, [videoId]);

  const totalQuestions = quiz.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = quiz.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.answer ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-100">
            <Award className="w-4 h-4" aria-hidden="true" />
            AI 隨堂聽力與觀點理解測驗
          </div>
          <p className="text-xs text-indigo-100/90">
            根據演講核心脈絡自動生成，檢驗是否真正聽懂語境與轉折細節
          </p>
        </div>

        {submitted && (
          <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs text-sm font-extrabold">
            得分：{correctCount} / {totalQuestions} (
            {Math.round((correctCount / Math.max(1, totalQuestions)) * 100)}%)
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {quiz.map((q, qIdx) => {
          const picked = selectedAnswers[qIdx];
          const isCorrect = picked === q.answer;

          return (
            <div
              key={qIdx}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    Question {qIdx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {q.question}
                  </h3>
                  {q.questionZh && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{q.questionZh}</p>
                  )}
                </div>

                {typeof q.relatedTimestamp === 'number' && (
                  <button
                    type="button"
                    onClick={() => onJumpToTime(q.relatedTimestamp!)}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    回看 {fmtClock(q.relatedTimestamp)}
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isThisPicked = picked === oIdx;
                  const isThisAnswer = q.answer === oIdx;

                  let btnStyle =
                    'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:border-indigo-400';

                  if (!submitted && isThisPicked) {
                    btnStyle =
                      'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold';
                  } else if (submitted) {
                    if (isThisAnswer) {
                      btnStyle =
                        'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isThisPicked && !isThisAnswer) {
                      btnStyle =
                        'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [qIdx]: oIdx
                        }))
                      }
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 transition cursor-pointer ${btnStyle}`}
                    >
                      <span>
                        <strong className="mr-2 font-mono">
                          {String.fromCharCode(65 + oIdx)}.
                        </strong>
                        {opt}
                      </span>
                      {submitted && isThisAnswer && (
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 text-emerald-500"
                          aria-hidden="true"
                        />
                      )}
                      {submitted && isThisPicked && !isThisAnswer && (
                        <XCircle
                          className="w-4 h-4 shrink-0 text-rose-500"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1 border ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <p className="font-bold">
                    {isCorrect ? '✅ 答對了！' : `❌ 正確答案為 (${String.fromCharCode(65 + q.answer)})`}
                  </p>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Reset Controls */}
      <div className="flex items-center justify-between pt-2">
        {!submitted ? (
          <button
            type="button"
            disabled={answeredCount === 0}
            onClick={() => setSubmitted(true)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm shadow-xs transition cursor-pointer"
          >
            交卷並檢視 AI 詳解 ({answeredCount}/{totalQuestions} 題已作答)
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSelectedAnswers({});
              setSubmitted(false);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新測驗
          </button>
        )}
      </div>
    </div>
  );
};
