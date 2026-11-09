import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';
import { QuizQuestion } from '../types';

const fmtClock = (sec: number) => {
  const t = Math.max(0, Math.floor(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = String(t % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

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

  if (totalQuestions === 0) {
    return (
      <p className="p-6 text-center text-xs text-slate-500">
        此影片尚無隨堂測驗題目。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Score Banner (only shown after submission) */}
      {submitted && (
        <div className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white flex items-center justify-between text-xs font-bold">
          <span>
            測驗結果：答對 {correctCount} / {totalQuestions} 題（
            {Math.round((correctCount / Math.max(1, totalQuestions)) * 100)}%）
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedAnswers({});
              setSubmitted(false);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新作答
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {quiz.map((q, qIdx) => {
          const picked = selectedAnswers[qIdx];
          const isCorrect = picked === q.answer;

          return (
            <div
              key={qIdx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-1.5">
                      {qIdx + 1}.
                    </span>
                    {q.question}
                  </h3>
                  {q.questionZh && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {q.questionZh}
                    </p>
                  )}
                </div>

                {typeof q.relatedTimestamp === 'number' && (
                  <button
                    type="button"
                    onClick={() => onJumpToTime(q.relatedTimestamp!)}
                    className="shrink-0 inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    {fmtClock(q.relatedTimestamp)}
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition cursor-pointer ${btnStyle}`}
                    >
                      <span>
                        <strong className="mr-1.5 font-mono">
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
                  className={`p-2.5 rounded-xl text-xs border ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <span className="font-bold mr-1.5">
                    {isCorrect ? '✓ 正確' : `✗ 正解 ${String.fromCharCode(65 + q.answer)}`}：
                  </span>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Control */}
      {!submitted && (
        <button
          type="button"
          disabled={answeredCount === 0}
          onClick={() => setSubmitted(true)}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          交卷對答案 ({answeredCount}/{totalQuestions})
        </button>
      )}
    </div>
  );
};
