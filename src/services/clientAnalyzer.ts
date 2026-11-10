import { GoogleGenAI, Type } from '@google/genai';
import { FocusMode, KeywordItem, QuizQuestion, SubtitleItem, VideoLesson } from '../types';
// @ts-ignore - shared pure ESM lexicon used by both browser and server
import {
  selectTutorKeywordsForSentence,
  buildTutorGrammarNote
} from '../../server/tutorLexicon.mjs';

const FOCUS_PROMPTS: Record<FocusMode, string> = {
  'tech-interview':
    '重點挑選「科技外商面試、產品開發、AI架構、跨部門協作與工程職場」高頻單字與片語，延伸例句請設定在科技公司會議、System Design 或外商面試情境。',
  'toeic-business':
    '重點挑選「多益（TOEIC）金色證書核心字彙、商務談判、專案管理與職場書信」高頻單字與片語，延伸例句請設定在國際商務與企業營運情境。',
  'daily-idioms':
    '重點挑選「母語人士日常高頻片語（Phrasal Verbs）、慣用語（Idioms）、連音表達與道地口語」，延伸例句請設定在自然生活對話與社交情境。',
  'academic-ted':
    '重點挑選「TED 演講、學術論述、精準動詞與邏輯轉折詞彙」，延伸例句請設定在公開演講與深度觀點分享情境。'
};

export function sanitizeApiKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.replace(/["'\s\u200B-\u200D\uFEFF]/g, '').trim();
}

export async function verifyGeminiApiKey(rawKey: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const cleanKey = sanitizeApiKey(rawKey);
  if (!cleanKey || cleanKey.length < 20) {
    return { ok: false, message: '請輸入完整的 Gemini API Key（通常以 AIzaSy 開頭）' };
  }
  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Reply with OK',
      config: {
        maxOutputTokens: 10,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    if (res && typeof res.text === 'string') {
      return { ok: true, message: '✅ Gemini API Key 驗證成功！可直接貼上任何新 YouTube 影片網址進行解析。' };
    }
    return { ok: true, message: '✅ Gemini API Key 驗證通過！' };
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (msg.includes('API_KEY_INVALID') || msg.includes('400') || msg.includes('403') || msg.includes('invalid')) {
      return {
        ok: false,
        message: '❌ 金鑰無效（API_KEY_INVALID）：請確認複製自 Google AI Studio 的有效 Gemini API Key。'
      };
    }
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        ok: true,
        message: '⚠️ 金鑰有效，但目前已達每分鐘免費額度上限（429），請稍候 30 秒再試。'
      };
    }
    return { ok: false, message: `❌ 金鑰連線測試失敗：${msg.slice(0, 120)}` };
  }
}

export function extractVideoIdClient(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id && id.length === 11) return id;
    }
    const v = url.searchParams.get('v');
    if (v && v.length === 11) return v;
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p));
    if (idx !== -1 && parts[idx + 1] && parts[idx + 1].length === 11) {
      return parts[idx + 1];
    }
  } catch {
    // ignore
  }
  const regexMatch = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([0-9A-Za-z_-]{11})/);
  return regexMatch ? regexMatch[1] : null;
}

export async function loadCachedLessonsClientFallback(): Promise<VideoLesson[]> {
  try {
    const res = await fetch('./cache/index.json');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

async function fetchVideoMetadataClient(videoId: string) {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || `YouTube 英文學習影片 (${videoId})`,
        channel: data.author_name || 'YouTube Creator'
      };
    }
  } catch {
    // ignore
  }
  return {
    title: `YouTube 英文學習影片 (${videoId})`,
    channel: 'YouTube Creator'
  };
}

export function parseCustomTranscriptClient(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const items: Array<{ start: number; end: number; en: string }> = [];
  let cursorTime = 0;

  for (const line of lines) {
    if (/^\d+$/.test(line) || line === 'WEBVTT') continue;
    const srtMatch = line.match(
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?[.,]\d+\s*-->\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/
    );
    if (srtMatch) {
      const h1 = srtMatch[3] ? parseInt(srtMatch[1], 10) : 0;
      const m1 = srtMatch[3] ? parseInt(srtMatch[2], 10) : parseInt(srtMatch[1], 10);
      const s1 = srtMatch[3] ? parseInt(srtMatch[3], 10) : parseInt(srtMatch[2], 10);
      cursorTime = h1 * 3600 + m1 * 60 + s1;
      continue;
    }
    const timePrefix = line.match(/^\[?(\d{1,2}):(\d{2})(?:\.(\d+))?\]?\s*(.+)$/);
    if (timePrefix) {
      const m = parseInt(timePrefix[1], 10);
      const s = parseInt(timePrefix[2], 10);
      const start = m * 60 + s;
      const text = timePrefix[4].trim();
      const words = text.split(/\s+/).length;
      const dur = Math.max(2.5, Math.min(8, Number((words * 0.42).toFixed(1))));
      items.push({
        start: Number(start.toFixed(1)),
        end: Number((start + dur).toFixed(1)),
        en: text
      });
      cursorTime = start + dur;
      continue;
    }
    const cleanText = line.replace(/<[^>]+>/g, '').trim();
    if (!cleanText) continue;
    const words = cleanText.split(/\s+/).length;
    const dur = Math.max(2.8, Math.min(8, Number((words * 0.42).toFixed(1))));
    items.push({
      start: Number(cursorTime.toFixed(1)),
      end: Number((cursorTime + dur).toFixed(1)),
      en: cleanText
    });
    cursorTime += dur;
  }

  return items;
}

/**
 * Safely parse Gemini JSON response, recovering completed subtitle objects even if output was truncated at maxOutputTokens.
 */
export function parseGeminiJsonSafely(rawText: string): {
  summary?: {
    overviewZh?: string;
    keyTakeaways?: string[];
    difficultyLevel?: string;
    topicTags?: string[];
  };
  subtitles: Array<{ start: number; end: number; en: string; zh: string }>;
} {
  const cleaned = (rawText || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && Array.isArray(parsed.subtitles)) {
      return parsed;
    }
  } catch {
    // Fall through to partial JSON recovery
  }

  // Recover individual {"start": ..., "end": ..., "en": "...", "zh": "..."} objects from truncated JSON
  const recoveredSubs: Array<{ start: number; end: number; en: string; zh: string }> = [];
  const objRegex =
    /\{\s*(?:"id"\s*:\s*\d+\s*,\s*)?"start"\s*:\s*([\d.]+)\s*,\s*"end"\s*:\s*([\d.]+)\s*,\s*"en"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"zh"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = objRegex.exec(cleaned)) !== null) {
    const start = parseFloat(m[1]);
    const end = parseFloat(m[2]);
    const en = m[3].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
    const zh = m[4].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
    if (en && !Number.isNaN(start)) {
      recoveredSubs.push({
        start: Number(start.toFixed(1)),
        end: Number(Math.max(start + 1.2, end || start + 3.5).toFixed(1)),
        en,
        zh: zh || en
      });
    }
  }

  let overviewZh = '';
  const ovMatch = cleaned.match(/"overviewZh"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (ovMatch) {
    overviewZh = ovMatch[1].replace(/\\"/g, '"');
  }

  return {
    summary: overviewZh
      ? {
          overviewZh,
          keyTakeaways: [],
          difficultyLevel: 'B2–C1 線上家教精講版',
          topicTags: ['Gemini 2.5 Flash', '線上家教導讀']
        }
      : undefined,
    subtitles: recoveredSubs
  };
}

/**
 * Enrich compact {start, end, en, zh} subtitles with our Online English Tutor Engine
 * (Phrases/Idioms + B2-C2 Vocabulary + Sentence Coach Notes + 5 Quiz Questions)
 */
export function enrichSubtitlesWithTutorEngine(
  rawSubtitles: Array<{ start: number; end: number; en: string; zh: string; meaningMap?: Record<string, string> }>,
  videoTitle: string,
  focusMode: FocusMode
): {
  subtitles: SubtitleItem[];
  quiz: QuizQuestion[];
  summary: VideoLesson['summary'];
} {
  let totalPhrases = 0;
  let totalVocab = 0;

  const enrichedSubtitles: SubtitleItem[] = rawSubtitles.map((s, idx) => {
    const rawKws = selectTutorKeywordsForSentence(s.en, 2) || [];
    const keywords: KeywordItem[] = rawKws.map((kw: any) => {
      if (kw.pos === 'phr.') totalPhrases++;
      else totalVocab++;

      const meaning =
        kw.meaning ||
        (kw.rootHint
          ? `句中進階核心詞（${kw.rootHint}；原句語境：${s.zh}）`
          : `句中進階核心詞（原句語境：${s.zh}）`);

      const exampleZh =
        kw.exampleZh ||
        `在專業溝通語境中，精準運用「${kw.lemma}」能讓表達更具說服力。`;

      return {
        word: kw.word,
        lemma: kw.lemma,
        pos: kw.pos,
        phonetic: kw.phonetic || `/${kw.lemma}/`,
        meaning,
        level: kw.level || 'B2/C1 職場專業',
        exampleEn: kw.exampleEn,
        exampleZh
      };
    });

    const start = Number(Number(s.start || 0).toFixed(1));
    const nextStart = rawSubtitles[idx + 1]?.start;
    let end = Number(Number(s.end || start + 3.5).toFixed(1));
    if (end <= start) end = Number((start + 3.2).toFixed(1));
    if (typeof nextStart === 'number' && nextStart > start && end > nextStart) {
      end = Number(Math.max(start + 0.8, nextStart).toFixed(1));
    }

    const grammarNote = buildTutorGrammarNote(s.en, keywords);

    return {
      id: idx + 1,
      start,
      end,
      en: s.en,
      zh: s.zh || s.en,
      grammarNote,
      keywords
    };
  });

  const subsWithKw = enrichedSubtitles.filter((s) => s.keywords && s.keywords.length > 0);
  const allUniqueWords = Array.from(
    new Set(subsWithKw.flatMap((s) => s.keywords.map((k) => k.word)))
  );

  const quiz: QuizQuestion[] = [];
  const ratios = [0.08, 0.28, 0.5, 0.72, 0.9];
  const sampleIndices = ratios
    .map((r) => Math.min(subsWithKw.length - 1, Math.floor(subsWithKw.length * r)))
    .filter((v, i, a) => v >= 0 && a.indexOf(v) === i);

  for (let i = 0; i < sampleIndices.length; i++) {
    const targetSub = subsWithKw[sampleIndices[i]];
    const targetKw = targetSub?.keywords?.[0];
    if (!targetSub || !targetKw) continue;

    const blankedEn = targetSub.en.replace(
      new RegExp(targetKw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      '________'
    );
    const distractors = allUniqueWords.filter(
      (w) =>
        w.toLowerCase() !== targetKw.word.toLowerCase() &&
        w.toLowerCase() !== targetKw.lemma.toLowerCase()
    );
    const pickedDistractors = [
      distractors[(i * 5 + 2) % Math.max(1, distractors.length)] || 'turn out',
      distractors[(i * 7 + 5) % Math.max(1, distractors.length)] || 'intuition',
      distractors[(i * 11 + 9) % Math.max(1, distractors.length)] || 'perspective'
    ];
    const options = [targetKw.word, ...pickedDistractors];
    const correctPos = i % 4;
    const rotatedOptions = [...options];
    const temp = rotatedOptions[0];
    rotatedOptions[0] = rotatedOptions[correctPos];
    rotatedOptions[correctPos] = temp;

    quiz.push({
      question: `At ${targetSub.start.toFixed(1)}s in the video, which expression best completes: "${blankedEn}"?`,
      questionZh: `在影片 ${targetSub.start.toFixed(1)} 秒處，講者說：「${targetSub.zh}」，空格中應填入哪個道地字詞或片語？`,
      options: rotatedOptions,
      answer: correctPos,
      explanation: `原句為：「${targetSub.en}」（${targetSub.zh}）。家教解析：「${targetKw.lemma} (${targetKw.pos})」意為「${targetKw.meaning}」。`,
      relatedTimestamp: targetSub.start
    });
  }

  const totalDurMin = Math.max(
    1,
    Math.round((enrichedSubtitles[enrichedSubtitles.length - 1]?.end || 60) / 60)
  );
  const introZh = enrichedSubtitles
    .slice(0, 2)
    .map((s) => s.zh)
    .join(' ');
  const midZh = enrichedSubtitles[Math.floor(enrichedSubtitles.length / 2)]?.zh || '';
  const endZh = enrichedSubtitles[enrichedSubtitles.length - 1]?.zh || '';

  return {
    subtitles: enrichedSubtitles,
    quiz,
    summary: {
      overviewZh: `已完整解析「${videoTitle}」（片長約 ${totalDurMin} 分鐘，共 ${enrichedSubtitles.length} 個完整語句、${allUniqueWords.length} 個精選字詞與片語）。脈絡從「${introZh.slice(0, 45)}⋯」展開，中段探討「${midZh.slice(0, 45)}⋯」，最終收斂於「${endZh.slice(0, 45)}」。`,
      keyTakeaways: [
        `全片雙語時間軸同步：共 ${enrichedSubtitles.length} 句中英對照字幕（${enrichedSubtitles[0]?.start || 0}s 至 ${enrichedSubtitles[enrichedSubtitles.length - 1]?.end || 0}s）`,
        `真人感家教精選：標記 ${totalPhrases} 處道地片語（Phrasal Verbs / Idioms）與 ${totalVocab} 個 B2–C2 專業字彙，自動過濾簡單基礎字`,
        `每句皆附「家教隨堂導讀（句型解析 × 母語語感 × 連音技巧）」與 ${quiz.length} 題時間軸實戰測驗`
      ],
      difficultyLevel: 'B2–C1 線上家教精講版',
      topicTags: ['線上家教導讀', `共 ${enrichedSubtitles.length} 句`, '道地片語＋進階字彙']
    }
  };
}

const COMPACT_SUBTITLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        overviewZh: { type: Type.STRING },
        keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
        difficultyLevel: { type: Type.STRING },
        topicTags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['overviewZh', 'keyTakeaways', 'difficultyLevel', 'topicTags']
    },
    subtitles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          start: { type: Type.NUMBER },
          end: { type: Type.NUMBER },
          en: { type: Type.STRING },
          zh: { type: Type.STRING }
        },
        required: ['start', 'end', 'en', 'zh']
      }
    }
  },
  required: ['subtitles']
};

export async function analyzeYoutubeInBrowser({
  urlOrId,
  focusMode = 'tech-interview',
  apiKey,
  customTranscript,
  customTitle
}: {
  urlOrId: string;
  focusMode: FocusMode;
  apiKey: string;
  customTranscript?: string;
  customTitle?: string;
}): Promise<VideoLesson> {
  const videoId = extractVideoIdClient(urlOrId) || 'custom_video';
  const cleanKey = sanitizeApiKey(apiKey);

  // 1. Check static pre-cached lessons in ./cache/ first
  if (!customTranscript) {
    for (const candidate of [
      `./cache/${videoId}_${focusMode}.json`,
      `./cache/${videoId}_tech-interview.json`
    ]) {
      try {
        const staticRes = await fetch(candidate);
        if (staticRes.ok) {
          const ct = staticRes.headers.get('content-type') || '';
          if (ct.includes('application/json') || candidate.endsWith('.json')) {
            const cachedLesson = await staticRes.json();
            if (cachedLesson && Array.isArray(cachedLesson.subtitles) && cachedLesson.subtitles.length > 0) {
              return { ...cachedLesson, cached: true };
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }

  const meta = await fetchVideoMetadataClient(videoId);
  const finalTitle = customTitle?.trim() || meta.title;

  // 2. If user provided a Gemini API Key, run Gemini directly in the browser with Compact Schema + Low-Res Video Token Optimization + Multi-Model Fallback!
  if (cleanKey) {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const focusInstruction = FOCUS_PROMPTS[focusMode] || FOCUS_PROMPTS['tech-interview'];

    const promptText = customTranscript?.trim()
      ? `你是一位頂尖的線上英文家教。請將以下影片「${finalTitle}」的英文字幕整理為自然完整的英文句子 (en)、精準對應的秒數 (start, end)，以及流暢道地的繁體中文翻譯 (zh)，並提供繁體中文影片重點摘要 (summary)。\n【專項模式】：${focusInstruction}\n【字幕內容】：\n${customTranscript}`
      : `你是一位頂尖的線上英文家教。請直接聽譯這支 YouTube 影片「${finalTitle}」，依時間軸順序列出影片中講者說的每一句完整英文句子 (en)、對應的開始秒數 (start) 與結束秒數 (end)，以及自然道地的繁體中文翻譯 (zh)，並提供繁體中文影片重點摘要 (summary)。\n【注意】：每一句長度請控制在 1～2 句自然話語（約 3～8 秒），確保 start 與 end 秒數與講者開口聲音完全同步！`;

    // Build attempts:
    // Attempt 1: gemini-2.5-flash with MEDIA_RESOLUTION_LOW (saves 65% video tokens so 35-min videos fit in free tier!) and thinkingBudget: 0
    // Attempt 2: If video is very long (>35 mins) and hits token quota, retry with first 12 minutes (startOffset: 0s, endOffset: 720s)
    // Attempt 3: Fallback model gemini-2.5-flash-lite / gemini-2.0-flash
    const attempts: Array<{
      model: string;
      useClipWindow: boolean;
    }> = [
      { model: 'gemini-2.5-flash', useClipWindow: false },
      { model: 'gemini-2.5-flash', useClipWindow: true },
      { model: 'gemini-2.5-flash-lite', useClipWindow: true },
      { model: 'gemini-2.0-flash', useClipWindow: true }
    ];

    let lastError: any = null;

    for (const attempt of attempts) {
      try {
        const videoPart: any = {
          fileData: {
            fileUri: `https://www.youtube.com/watch?v=${videoId}`,
            mimeType: 'video/mp4'
          }
        };
        if (attempt.useClipWindow) {
          videoPart.videoMetadata = {
            startOffset: '0s',
            endOffset: '720s'
          };
        }

        const contents = customTranscript?.trim()
          ? [{ text: promptText }]
          : [videoPart, { text: promptText }];

        const config: any = {
          responseMimeType: 'application/json',
          responseSchema: COMPACT_SUBTITLE_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 65536,
          mediaResolution: 'MEDIA_RESOLUTION_LOW'
        };
        if (attempt.model.startsWith('gemini-2.5')) {
          config.thinkingConfig = { thinkingBudget: 0 };
        }

        const response = await ai.models.generateContent({
          model: attempt.model,
          contents,
          config
        });

        const parsed = parseGeminiJsonSafely(response.text || '');
        if (parsed.subtitles && parsed.subtitles.length > 0) {
          const enriched = enrichSubtitlesWithTutorEngine(
            parsed.subtitles,
            finalTitle,
            focusMode
          );
          const duration = Math.ceil(
            enriched.subtitles[enriched.subtitles.length - 1]?.end || 180
          );

          return {
            id: `yt_${videoId}`,
            videoId,
            title: finalTitle,
            channel: meta.channel,
            duration,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            focusMode,
            summary: parsed.summary?.overviewZh
              ? {
                  overviewZh: parsed.summary.overviewZh,
                  keyTakeaways:
                    parsed.summary.keyTakeaways && parsed.summary.keyTakeaways.length > 0
                      ? parsed.summary.keyTakeaways
                      : enriched.summary.keyTakeaways,
                  difficultyLevel:
                    parsed.summary.difficultyLevel || enriched.summary.difficultyLevel,
                  topicTags:
                    parsed.summary.topicTags && parsed.summary.topicTags.length > 0
                      ? parsed.summary.topicTags
                      : enriched.summary.topicTags
                }
              : enriched.summary,
            subtitles: enriched.subtitles,
            quiz: enriched.quiz
          };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err || '');
        // If key itself is invalid, stop retrying immediately and report clear error
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
          throw new Error('GEMINI_KEY_INVALID: 您輸入的 Gemini API Key 無效，請檢查是否複製完整（應以 AIzaSy 開頭）。');
        }
      }
    }

    const errMsg = String(lastError?.message || lastError || '');
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      throw new Error(
        'GEMINI_QUOTA_EXCEEDED: 您的 Gemini API Key 目前達到每分鐘免費額度上限（429 Quota Exceeded），請稍候約 30～60 秒再試，或於設定中貼上字幕文字直接解析！'
      );
    }
    throw new Error(
      `GEMINI_CALL_FAILED: Gemini 影片解析失敗（${errMsg.slice(0, 100)}）。請確認該 YouTube 影片為公開影片，或於設定視窗貼上字幕文字解析。`
    );
  }

  // 3. If customTranscript is provided without API key on GitHub Pages, translate via MyMemory CORS API + Tutor Engine!
  if (customTranscript && customTranscript.trim()) {
    const rawItems = parseCustomTranscriptClient(customTranscript);
    const translatedRaw = await Promise.all(
      rawItems.slice(0, 120).map(async (item) => {
        let zh = item.en;
        try {
          const r = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              item.en
            )}&langpair=en|zh-TW`
          );
          const d = await r.json();
          if (d?.responseData?.translatedText) {
            zh = d.responseData.translatedText;
          }
        } catch {
          // ignore
        }
        return {
          start: item.start,
          end: item.end,
          en: item.en,
          zh
        };
      })
    );

    const enriched = enrichSubtitlesWithTutorEngine(translatedRaw, finalTitle, focusMode);

    return {
      id: `yt_${videoId}`,
      videoId,
      title: finalTitle,
      channel: meta.channel,
      duration: Math.ceil(enriched.subtitles[enriched.subtitles.length - 1]?.end || 120),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      focusMode,
      summary: enriched.summary,
      subtitles: enriched.subtitles,
      quiz: enriched.quiz
    };
  }

  throw new Error('STATIC_HOST_NEEDS_API_KEY');
}

export async function askSentenceTutorClientFallback({
  sentenceEn,
  sentenceZh,
  userQuestion,
  videoTitle,
  apiKey
}: {
  sentenceEn: string;
  sentenceZh: string;
  userQuestion?: string;
  videoTitle: string;
  apiKey: string;
}) {
  const cleanKey = sanitizeApiKey(apiKey);
  if (cleanKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      const schema = {
        type: Type.OBJECT,
        properties: {
          structureBreakdown: { type: Type.STRING },
          pronunciationTips: { type: Type.STRING },
          workplaceParaphrases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING },
                zh: { type: Type.STRING },
                nuance: { type: Type.STRING }
              },
              required: ['en', 'zh', 'nuance']
            }
          },
          tutorReply: { type: Type.STRING }
        },
        required: [
          'structureBreakdown',
          'pronunciationTips',
          'workplaceParaphrases',
          'tutorReply'
        ]
      };
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `你是一位專精於「科技外商與母語口語」的線上真人英文家教。
影片標題：「${videoTitle}」
目標英文原句：「${sentenceEn}」
目標中文翻譯：「${sentenceZh}」
學習者提問：「${
          userQuestion || '請幫我拆解這句話的文法結構、母語連音技巧與職場替換表達。'
        }」`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      if (res.text) return JSON.parse(res.text);
    } catch {
      // fall through to local analysis
    }
  }

  const words = sentenceEn.split(/\s+/).filter(Boolean);
  return {
    structureBreakdown: `本句共 ${words.length} 個單字，以核心主詞與動詞推進論點（「${sentenceEn}」），搭配從屬子句或介系詞片語補充語境細節。`,
    pronunciationTips:
      '實詞（名詞、主要動詞、形容詞）需拉長母音重讀；功能詞（of, to, in, that, and）弱化為輕音 /ə/ 並與前字尾音自然連讀（Linking）。',
    workplaceParaphrases: [
      {
        en: `From a strategic standpoint, ${
          sentenceEn.charAt(0).toLowerCase() + sentenceEn.slice(1)
        }`,
        zh: `從策略角度來看，${sentenceZh}`,
        nuance: '適合在科技外商會議或跨部門同步時加強專業語氣'
      },
      {
        en: `What really matters here is that ${
          sentenceEn.charAt(0).toLowerCase() + sentenceEn.slice(1)
        }`,
        zh: `這裡真正關鍵的是：${sentenceZh}`,
        nuance: '適合在簡報總結或面試強調核心觀點時使用'
      }
    ],
    tutorReply: userQuestion
      ? `針對您的提問「${userQuestion}」：建議先掌握本句主幹動詞與轉折詞，若於右上角「設定」填入免費 Gemini API Key，即可啟動 Gemini 2.5 Flash 針對任意提問進行無限深度問答！`
      : '建議先用 0.8x 慢速跟讀兩遍，熟悉母語連音節奏後再挑戰 1.0x 原速口說評測！'
  };
}
