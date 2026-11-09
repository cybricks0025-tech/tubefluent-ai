import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Radio,
  Tv,
  RotateCcw,
  Gauge,
  Maximize2,
  Minimize2,
  MonitorPlay,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { KeywordItem, PlayerEngineMode, SubtitleItem } from '../types';
import { InlineKeywordHighlighter } from './InlineKeywordHighlighter';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type CinemaLayoutMode =
  | 'standard'
  | 'theater-split'
  | 'theater-bottom'
  | 'fullscreen-cinema';

interface DualEnginePlayerProps {
  videoId: string;
  title: string;
  duration: number;
  subtitles: SubtitleItem[];
  currentTime: number;
  isPlaying: boolean;
  sentenceLoop: boolean;
  engineMode: PlayerEngineMode;
  playbackRate: number;
  activeSubtitle: SubtitleItem | undefined;
  savedWordSet: Set<string>;
  cinemaMode: CinemaLayoutMode;
  showSidebarInCinema: boolean;
  showCompactSubtitleBar: boolean;
  onCinemaModeChange: (mode: CinemaLayoutMode) => void;
  onToggleSidebarInCinema: () => void;
  onTimeUpdate: (time: number) => void;
  onPlayStateChange: (playing: boolean) => void;
  onToggleSentenceLoop: () => void;
  onEngineModeChange: (mode: PlayerEngineMode) => void;
  onPlaybackRateChange: (rate: number) => void;
  onSelectKeyword: (keyword: KeywordItem, sentence: SubtitleItem) => void;
  seekRequest: { time: number; seq: number } | null;
}

export const DualEnginePlayer: React.FC<DualEnginePlayerProps> = ({
  videoId,
  title,
  duration,
  subtitles,
  currentTime,
  isPlaying,
  sentenceLoop,
  engineMode,
  playbackRate,
  activeSubtitle,
  savedWordSet,
  cinemaMode,
  showSidebarInCinema,
  showCompactSubtitleBar,
  onCinemaModeChange,
  onToggleSidebarInCinema,
  onTimeUpdate,
  onPlayStateChange,
  onToggleSentenceLoop,
  onEngineModeChange,
  onPlaybackRateChange,
  onSelectKeyword,
  seekRequest
}) => {
  const playerContainerId = useRef(`yt-player-${Math.random().toString(36).slice(2, 8)}`);
  const ytPlayerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const [ytDuration, setYtDuration] = useState(0);
  const [ytError, setYtError] = useState<string | null>(null);
  const lastSpokenSubIdRef = useRef<number | null>(null);

  const currentTimeRef = useRef(currentTime);
  const activeSubtitleRef = useRef(activeSubtitle);
  const sentenceLoopRef = useRef(sentenceLoop);
  const engineModeRef = useRef(engineMode);
  const playbackRateRef = useRef(playbackRate);
  const subtitlesRef = useRef(subtitles);
  const durationRef = useRef(duration);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    activeSubtitleRef.current = activeSubtitle;
  }, [activeSubtitle]);

  useEffect(() => {
    sentenceLoopRef.current = sentenceLoop;
  }, [sentenceLoop]);

  useEffect(() => {
    engineModeRef.current = engineMode;
  }, [engineMode]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    subtitlesRef.current = subtitles;
  }, [subtitles]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      initPlayer();
    };
  }, []);

  // Re-initialize or cue video when videoId changes
  useEffect(() => {
    setYtError(null);
    setYtDuration(0);
    lastSpokenSubIdRef.current = null;
    if (
      ytPlayerRef.current &&
      ytReady &&
      typeof ytPlayerRef.current.cueVideoById === 'function'
    ) {
      try {
        ytPlayerRef.current.cueVideoById({ videoId, startSeconds: 0 });
      } catch {
        // ignore
      }
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }
  }, [videoId]);

  const initPlayer = () => {
    const el = document.getElementById(playerContainerId.current);
    if (!el || !window.YT || !window.YT.Player) return;

    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
      try {
        ytPlayerRef.current.destroy();
      } catch {
        // ignore
      }
    }

    ytPlayerRef.current = new window.YT.Player(playerContainerId.current, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        fs: 1,
        cc_load_policy: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          setYtReady(true);
          try {
            const d = event.target.getDuration?.();
            if (typeof d === 'number' && d > 0) setYtDuration(d);
            const iframe = event.target.getIframe?.();
            if (iframe) {
              iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
              iframe.setAttribute('allowfullscreen', 'true');
              iframe.setAttribute(
                'allow',
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
              );
            }
          } catch {
            // ignore
          }
        },
        onStateChange: (event: any) => {
          if (engineModeRef.current !== 'youtube') return;
          try {
            const d = event.target.getDuration?.();
            if (typeof d === 'number' && d > 0) setYtDuration(d);
          } catch {
            // ignore
          }
          if (event.data === 1) {
            onPlayStateChange(true);
          } else if (event.data === 2 || event.data === 0) {
            onPlayStateChange(false);
          }
        },
        onError: (event: any) => {
          setYtError(
            `YouTube 嵌入受限 (Error ${event.data})，已自動切換至 AI 語音播講引擎`
          );
          onEngineModeChange('tts-simulator');
        }
      }
    });
  };

  // Sync external isPlaying changes with YT Player
  useEffect(() => {
    if (engineMode !== 'youtube' || !ytPlayerRef.current || !ytReady) return;
    try {
      const playerState = ytPlayerRef.current.getPlayerState?.();
      if (isPlaying && playerState !== 1 && playerState !== 3) {
        ytPlayerRef.current.playVideo?.();
      } else if (!isPlaying && playerState === 1) {
        ytPlayerRef.current.pauseVideo?.();
      }
    } catch {
      // ignore
    }
  }, [isPlaying, engineMode, ytReady]);

  // Handle external seek requests
  useEffect(() => {
    if (!seekRequest) return;
    const targetTime = Math.max(0, seekRequest.time);
    currentTimeRef.current = targetTime;
    onTimeUpdate(targetTime);
    lastSpokenSubIdRef.current = null;

    if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
      try {
        ytPlayerRef.current.seekTo(targetTime, true);
        if (isPlaying) {
          ytPlayerRef.current.playVideo?.();
        }
      } catch {
        // ignore
      }
    } else if (engineMode === 'tts-simulator') {
      window.speechSynthesis?.cancel();
    }
  }, [seekRequest]);

  // Sync playback rate
  useEffect(() => {
    if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
      try {
        ytPlayerRef.current.setPlaybackRate(playbackRate);
      } catch {
        // ignore
      }
    }
  }, [playbackRate, engineMode, ytReady]);

  // Stable 150ms Polling Engine
  useEffect(() => {
    if (!isPlaying) {
      if (engineMode === 'tts-simulator') {
        window.speechSynthesis?.cancel();
      }
      return;
    }

    const interval = window.setInterval(() => {
      const mode = engineModeRef.current;
      const rate = playbackRateRef.current;
      const loop = sentenceLoopRef.current;
      const activeSub = activeSubtitleRef.current;
      const subs = subtitlesRef.current;
      let nextTime = currentTimeRef.current;

      if (mode === 'youtube' && ytPlayerRef.current && ytReady) {
        try {
          const t = ytPlayerRef.current.getCurrentTime?.();
          if (typeof t === 'number' && !Number.isNaN(t)) {
            nextTime = t;
          }
          const d = ytPlayerRef.current.getDuration?.();
          if (typeof d === 'number' && d > 0) {
            setYtDuration((prev) => (prev !== d ? d : prev));
          }
        } catch {
          // ignore
        }
      } else {
        nextTime = Number((nextTime + 0.15 * rate).toFixed(2));
      }

      if (loop && activeSub) {
        if (nextTime >= activeSub.end - 0.08) {
          nextTime = activeSub.start;
          lastSpokenSubIdRef.current = null;
          if (mode === 'youtube' && ytPlayerRef.current && ytReady) {
            try {
              ytPlayerRef.current.seekTo(activeSub.start, true);
            } catch {
              // ignore
            }
          }
        }
      }

      if (mode === 'tts-simulator') {
        const maxSubEnd = Math.max(
          durationRef.current,
          subs[subs.length - 1]?.end || 60
        );
        if (nextTime >= maxSubEnd) {
          onPlayStateChange(false);
          currentTimeRef.current = 0;
          onTimeUpdate(0);
          return;
        }
      }

      currentTimeRef.current = nextTime;
      onTimeUpdate(nextTime);
    }, 150);

    return () => window.clearInterval(interval);
  }, [isPlaying, engineMode, ytReady]);

  // Speak active subtitle in TTS Simulator Mode
  useEffect(() => {
    if (engineMode !== 'tts-simulator' || !isPlaying || !activeSubtitle) return;
    if (lastSpokenSubIdRef.current === activeSubtitle.id) return;

    lastSpokenSubIdRef.current = activeSubtitle.id;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(activeSubtitle.en);
      utter.lang = 'en-US';
      utter.rate = playbackRate;
      window.speechSynthesis.speak(utter);
    }
  }, [engineMode, isPlaying, activeSubtitle?.id, playbackRate]);

  const togglePlayPause = () => {
    const nextPlaying = !isPlaying;
    onPlayStateChange(nextPlaying);

    if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
      try {
        if (nextPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch {
        // ignore
      }
    } else if (!nextPlaying) {
      window.speechSynthesis?.cancel();
    }
  };

  const jumpToPrevSentence = () => {
    if (subtitles.length === 0) return;
    const currentIdx = activeSubtitle
      ? subtitles.findIndex((s) => s.id === activeSubtitle.id)
      : subtitles.findIndex((s) => s.start >= currentTime);
    const targetIdx = Math.max(
      0,
      (currentIdx === -1 ? subtitles.length - 1 : currentIdx) - 1
    );
    const target = subtitles[targetIdx];
    if (target) {
      lastSpokenSubIdRef.current = null;
      currentTimeRef.current = target.start;
      onTimeUpdate(target.start);
      if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
        ytPlayerRef.current.seekTo(target.start, true);
      }
    }
  };

  const jumpToNextSentence = () => {
    if (subtitles.length === 0) return;
    const currentIdx = activeSubtitle
      ? subtitles.findIndex((s) => s.id === activeSubtitle.id)
      : subtitles.findIndex((s) => s.start > currentTime) - 1;
    const targetIdx = Math.min(subtitles.length - 1, Math.max(0, currentIdx + 1));
    const target = subtitles[targetIdx];
    if (target) {
      lastSpokenSubIdRef.current = null;
      currentTimeRef.current = target.start;
      onTimeUpdate(target.start);
      if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
        ytPlayerRef.current.seekTo(target.start, true);
      }
    }
  };

  const replayCurrentSentence = () => {
    const target = activeSubtitle || subtitles[0];
    if (!target) return;
    lastSpokenSubIdRef.current = null;
    currentTimeRef.current = target.start;
    onTimeUpdate(target.start);
    if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
      ytPlayerRef.current.seekTo(target.start, true);
      ytPlayerRef.current.playVideo();
    }
    onPlayStateChange(true);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const maxTimeline = Math.max(
    ytDuration,
    duration,
    subtitles[subtitles.length - 1]?.end || 60
  );

  const isBigScreen = cinemaMode !== 'standard';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col shrink-0">
      {/* Unobstructed Video Stage — Zero overlays blocking the video! */}
      <div
        className={`relative w-full bg-black overflow-hidden ${
          cinemaMode === 'fullscreen-cinema'
            ? 'aspect-video max-h-[66dvh]'
            : cinemaMode === 'theater-bottom'
              ? 'aspect-video max-h-[58dvh] mx-auto'
              : cinemaMode === 'theater-split'
                ? 'aspect-video max-h-[58dvh]'
                : 'aspect-video'
        }`}
      >
        <div className={`w-full h-full ${engineMode === 'youtube' ? 'block' : 'hidden'}`}>
          <div id={playerContainerId.current} className="w-full h-full" />
        </div>

        {engineMode === 'tts-simulator' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 text-white relative">
            <div className="flex items-center gap-1.5 mb-3">
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                <span
                  key={bar}
                  className={`w-1.5 rounded-full bg-indigo-400 transition-all duration-300 ${
                    isPlaying ? 'h-8 animate-pulse' : 'h-2 opacity-40'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">
              AI 語音播講模擬引擎
            </p>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 max-w-xl line-clamp-1">
              {title}
            </h2>
          </div>
        )}
      </div>

      {/* Compact Subtitle Bar ONLY shown when the right-side Subtitles Panel is hidden or on another tab (Zero Duplication!) */}
      {showCompactSubtitleBar && activeSubtitle && (
        <div className="px-4 py-2.5 bg-slate-950 text-white border-t border-slate-800 space-y-0.5">
          <div className="text-sm sm:text-base font-medium leading-snug text-slate-100">
            <span className="text-xs font-mono text-indigo-400 mr-2">
              #{activeSubtitle.id}
            </span>
            <InlineKeywordHighlighter
              sentence={activeSubtitle}
              savedWordSet={savedWordSet}
              onSelectKeyword={onSelectKeyword}
              darkOverlay
            />
          </div>
          <p className="text-xs sm:text-sm text-indigo-300">{activeSubtitle.zh}</p>
        </div>
      )}

      {/* Sleek All-in-One Transport & Mode Control Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Scrubber Row */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="w-11 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={maxTimeline}
            step={0.1}
            value={Math.min(currentTime, maxTimeline)}
            aria-label="影片播放時間軸"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              currentTimeRef.current = val;
              onTimeUpdate(val);
              if (engineMode === 'youtube' && ytPlayerRef.current && ytReady) {
                ytPlayerRef.current.seekTo(val, true);
              }
            }}
            className="flex-1 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="w-11">{formatTime(maxTimeline)}</span>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Playback Transport */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={jumpToPrevSentence}
              aria-label="上一句 (←)"
              title="上一句 (←)"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <SkipBack className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  暫停
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  播放
                </>
              )}
            </button>

            <button
              type="button"
              onClick={jumpToNextSentence}
              aria-label="下一句 (→)"
              title="下一句 (→)"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <SkipForward className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={replayCurrentSentence}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
              title="重播本句 (快捷鍵 R)"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">重播 (R)</span>
            </button>

            <button
              type="button"
              onClick={onToggleSentenceLoop}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                sentenceLoop
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
              title="單句循環播放 (快捷鍵 L)"
            >
              <Repeat className="w-3.5 h-3.5" aria-hidden="true" />
              單句循環 {sentenceLoop ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Right Speed, Engine & Theater Controls */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Speed Selector */}
            <div className="inline-flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400 mr-0.5" aria-hidden="true" />
              {[0.75, 1, 1.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onPlaybackRateChange(rate)}
                  className={`px-1.5 py-0.5 rounded font-medium cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Engine Toggle */}
            <button
              type="button"
              onClick={() => {
                if (engineMode === 'youtube') {
                  try {
                    ytPlayerRef.current?.pauseVideo?.();
                  } catch {
                    // ignore
                  }
                  onEngineModeChange('tts-simulator');
                } else {
                  onEngineModeChange('youtube');
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 font-medium cursor-pointer"
              title="切換 YouTube 原生影片或 AI 語音播講"
            >
              {engineMode === 'youtube' ? (
                <>
                  <Tv className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                  <span className="hidden md:inline">YT 原音</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  <span className="hidden md:inline">AI 播講</span>
                </>
              )}
            </button>

            {/* Theater Mode Toggle */}
            <button
              type="button"
              onClick={() =>
                onCinemaModeChange(
                  cinemaMode === 'theater-split' || cinemaMode === 'theater-bottom'
                    ? 'standard'
                    : 'theater-split'
                )
              }
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold border transition cursor-pointer ${
                cinemaMode === 'theater-split' || cinemaMode === 'theater-bottom'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
              }`}
              title="切換劇院大螢幕模式 (快捷鍵 T)"
            >
              <MonitorPlay className="w-3.5 h-3.5" aria-hidden="true" />
              {cinemaMode === 'theater-split' || cinemaMode === 'theater-bottom'
                ? '退出劇院 (T)'
                : '劇院模式 (T)'}
            </button>

            {/* Fullscreen Cinema Toggle */}
            <button
              type="button"
              onClick={() =>
                onCinemaModeChange(
                  cinemaMode === 'fullscreen-cinema' ? 'standard' : 'fullscreen-cinema'
                )
              }
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold border transition cursor-pointer ${
                cinemaMode === 'fullscreen-cinema'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
              }`}
              title="全螢幕雙語劇院 (快捷鍵 F)"
            >
              {cinemaMode === 'fullscreen-cinema' ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  退出全螢幕
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                  全螢幕 (F)
                </>
              )}
            </button>

            {(cinemaMode === 'theater-split' || cinemaMode === 'fullscreen-cinema') && (
              <button
                type="button"
                onClick={onToggleSidebarInCinema}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                title="展開或收合右側雙語字幕欄"
              >
                {showSidebarInCinema ? (
                  <PanelRightClose className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {ytError && (
        <div className="px-3.5 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs">
          {ytError}
        </div>
      )}
    </div>
  );
};
