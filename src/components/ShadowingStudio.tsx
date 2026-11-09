import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Headphones
} from 'lucide-react';
import { SubtitleItem } from '../types';

interface ShadowingStudioProps {
  subtitles: SubtitleItem[];
  activeSubtitle: SubtitleItem | undefined;
  onSelectSentence: (sub: SubtitleItem) => void;
}

interface WordDiffItem {
  targetWord: string;
  matched: boolean;
}

export const ShadowingStudio: React.FC<ShadowingStudioProps> = ({
  subtitles,
  activeSubtitle,
  onSelectSentence
}) => {
  const currentSentence = activeSubtitle || subtitles[0];
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [wordDiffs, setWordDiffs] = useState<WordDiffItem[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Reset state when switching target sentence
    setSpokenTranscript('');
    setScore(null);
    setWordDiffs([]);
    setStatusMsg('');
  }, [currentSentence?.id]);

  const evaluateTranscript = (spoken: string, targetEn: string) => {
    const cleanTargetWords = targetEn
      .replace(/[.,?!;:"'()]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    const spokenSet = new Set(
      spoken
        .toLowerCase()
        .replace(/[.,?!;:"'()]/g, '')
        .split(/\s+/)
        .filter(Boolean)
    );

    let matchedCount = 0;
    const diffs: WordDiffItem[] = cleanTargetWords.map((w) => {
      const lower = w.toLowerCase();
      const isMatch =
        spokenSet.has(lower) ||
        Array.from(spokenSet).some(
          (sw) => sw.length >= 4 && (lower.startsWith(sw.slice(0, 4)) || sw.startsWith(lower.slice(0, 4)))
        );
      if (isMatch) matchedCount++;
      return { targetWord: w, matched: isMatch };
    });

    const calculatedScore =
      cleanTargetWords.length > 0
        ? Math.round((matchedCount / cleanTargetWords.length) * 100)
        : 0;

    setWordDiffs(diffs);
    setScore(calculatedScore);
  };

  const startRecordingAndRecognition = async () => {
    if (!currentSentence) return;
    setSpokenTranscript('');
    setScore(null);
    setWordDiffs([]);
    setStatusMsg('請對著麥克風朗讀上方英文句子⋯');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMsg('此瀏覽器環境不支援原生 SpeechRecognition，已為您啟用智慧模擬跟讀評測！');
      runSimulatedShadowing();
      return;
    }

    try {
      // Optional MediaRecorder for self-listening playback
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(URL.createObjectURL(blob));
            stream.getTracks().forEach((t) => t.stop());
          };
          recorder.start();
          mediaRecorderRef.current = recorder;
        } catch {
          // Microphone recording optional
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      let latestTranscript = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          interim += event.results[i][0].transcript + ' ';
        }
        latestTranscript = interim.trim();
        setSpokenTranscript(latestTranscript);
        evaluateTranscript(latestTranscript, currentSentence.en);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setStatusMsg('未偵測到麥克風輸入，您可以點擊「模擬口說評測」體驗逐字比對計分！');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        if (latestTranscript) {
          setStatusMsg('已完成語音辨識與逐字發音比對！');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      runSimulatedShadowing();
    }
  };

  const stopRecording = () => {
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {
      // ignore
    }
  };

  const runSimulatedShadowing = () => {
    if (!currentSentence) return;
    const words = currentSentence.en.split(/\s+/);
    // Simulate a realistic 88% match where 1 long word is slightly missed
    const simulatedWords = words.map((w, i) => (i === Math.floor(words.length / 2) ? 'uh' : w));
    const simText = simulatedWords.join(' ').replace(/[.,?!]/g, '');
    setSpokenTranscript(simText);
    evaluateTranscript(simText, currentSentence.en);
    setStatusMsg('已完成模擬跟讀比對（綠色為發音精準字詞，琥珀色為建議加強連音字詞）');
  };

  const speakSentence = (rate: number) => {
    if (!currentSentence || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(currentSentence.en);
    utter.lang = 'en-US';
    utter.rate = rate;
    window.speechSynthesis.speak(utter);
  };

  if (!currentSentence) return null;

  return (
    <div className="space-y-4">
      {/* Target Sentence Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/25 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
            跟讀目標句 #{currentSentence.id}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => speakSentence(1.0)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
              標準語速 1.0x
            </button>
            <button
              type="button"
              onClick={() => speakSentence(0.75)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              慢速拆解 0.75x
            </button>
          </div>
        </div>

        <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          {currentSentence.en}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{currentSentence.zh}</p>

        {currentSentence.grammarNote && (
          <div className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/30 px-3 py-2 rounded-xl">
            💡 發音與語法提示：{currentSentence.grammarNote}
          </div>
        )}
      </div>

      {/* Microphone & Recording Controls */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {!isListening ? (
              <button
                type="button"
                onClick={startRecordingAndRecognition}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xs transition cursor-pointer"
              >
                <Mic className="w-4 h-4" aria-hidden="true" />
                開始麥克風跟讀
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm animate-pulse cursor-pointer"
              >
                <MicOff className="w-4 h-4 text-rose-500" aria-hidden="true" />
                停止錄音並計分
              </button>
            )}

            <button
              type="button"
              onClick={runSimulatedShadowing}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
              模擬口說評測 (免麥克風體驗)
            </button>

            {recordedAudioUrl && (
              <button
                type="button"
                onClick={() => {
                  const audio = new Audio(recordedAudioUrl);
                  audio.play();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                回放我的錄音
              </button>
            )}
          </div>

          {score !== null && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                發音吻合度：
              </span>
              <span
                className={`text-xl font-extrabold ${
                  score >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : score >= 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {score} 分
              </span>
            </div>
          )}
        </div>

        {statusMsg && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{statusMsg}</p>
        )}

        {/* Word-by-Word Alignment Diff */}
        {wordDiffs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              逐字發音比對結果（點擊單字可聽單獨發音）：
            </p>
            <div className="flex flex-wrap gap-1.5">
              {wordDiffs.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(item.targetWord);
                      u.lang = 'en-US';
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium border transition cursor-pointer ${
                    item.matched
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {item.matched ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  )}
                  {item.targetWord}
                </button>
              ))}
            </div>
            {spokenTranscript && (
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                辨識出的語音文字：<code className="text-indigo-600 dark:text-indigo-300">"{spokenTranscript}"</code>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Sentence Selector for Shadowing */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          選擇其他句子進行跟讀訓練 ({subtitles.length} 句)
        </h3>
        <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scroller pr-1">
          {subtitles.map((sub) => {
            const isSelected = sub.id === currentSentence.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSentence(sub)}
                className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                <span className="font-mono text-xs text-indigo-500 mr-2">#{sub.id}</span>
                {sub.en}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
