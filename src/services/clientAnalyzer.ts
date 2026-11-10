import { GoogleGenAI, Type } from '@google/genai';
import { FocusMode, KeywordItem, QuizQuestion, SubtitleItem, VideoLesson } from '../types';
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
      return {
        ok: true,
        message: '✅ Gemini API Key 驗證成功！可直接貼上任何新 YouTube 影片網址進行解析。'
      };
    }
    return { ok: true, message: '✅ Gemini API Key 驗證通過！' };
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (
      msg.includes('API_KEY_INVALID') ||
      msg.includes('400') ||
      msg.includes('403') ||
      msg.includes('invalid')
    ) {
      return {
        ok: false,
        message:
          '❌ 金鑰無效（API_KEY_INVALID）：請確認複製自 Google AI Studio 的有效 Gemini API Key。'
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

/**
 * Convert Gemini's native "MM:SS" / "HH:MM:SS" / "1m24s" / numeric seconds into exact floating-point seconds.
 */
export function parseTimestampToSeconds(raw: string | number | undefined, fallbackSec = 0): number {
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return Math.max(0, Number(raw.toFixed(1)));
  }
  if (typeof raw !== 'string') return fallbackSec;
  const s = raw.trim();
  if (!s) return fallbackSec;

  // Match HH:MM:SS or MM:SS (with optional decimal seconds)
  const colonMatch = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/);
  if (colonMatch) {
    if (colonMatch[3] !== undefined) {
      const h = parseInt(colonMatch[1], 10);
      const m = parseInt(colonMatch[2], 10);
      const sec = parseFloat(colonMatch[3]);
      return Number((h * 3600 + m * 60 + sec).toFixed(1));
    }
    const m = parseInt(colonMatch[1], 10);
    const sec = parseFloat(colonMatch[2]);
    return Number((m * 60 + sec).toFixed(1));
  }

  // Match MM:SS.ms where decimal is on the second part
  const colonFloatMatch = s.match(/^(\d+):(\d{1,2}\.\d+)$/);
  if (colonFloatMatch) {
    const m = parseInt(colonFloatMatch[1], 10);
    const sec = parseFloat(colonFloatMatch[2]);
    return Number((m * 60 + sec).toFixed(1));
  }

  // Match "1m24s" or "45s"
  const msMatch = s.match(/^(?:(\d+)\s*m)?\s*(\d+(?:\.\d+)?)\s*s?$/i);
  if (msMatch) {
    const m = msMatch[1] ? parseInt(msMatch[1], 10) : 0;
    const sec = parseFloat(msMatch[2]);
    return Number((m * 60 + sec).toFixed(1));
  }

  const num = parseFloat(s);
  return Number.isNaN(num) ? fallbackSec : Math.max(0, Number(num.toFixed(1)));
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

export interface RawGeminiWordItem {
  w?: string;
  word?: string;
  l?: string;
  lemma?: string;
  p?: string;
  pos?: string;
  ph?: string;
  phonetic?: string;
  m?: string;
  meaning?: string;
  exEn?: string;
  exampleEn?: string;
  exZh?: string;
  exampleZh?: string;
}

export interface RawGeminiSubtitleItem {
  startTime?: string;
  endTime?: string;
  start?: number | string;
  end?: number | string;
  en: string;
  zh: string;
  note?: string;
  grammarNote?: string;
  words?: RawGeminiWordItem[];
  keywords?: RawGeminiWordItem[];
}

/**
 * Safely parse Gemini JSON response, recovering completed subtitle objects (including nested words[])
 * even if a very long video hits maxOutputTokens near the end.
 */
export function parseGeminiJsonSafely(rawText: string): {
  summary?: {
    overviewZh?: string;
    keyTakeaways?: string[];
    difficultyLevel?: string;
    topicTags?: string[];
  };
  subtitles: RawGeminiSubtitleItem[];
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
    // Fall through to balanced-brace object recovery
  }

  const recoveredSubs: RawGeminiSubtitleItem[] = [];
  const subKeyIdx = cleaned.indexOf('"subtitles"');
  const arrayStartIdx = subKeyIdx !== -1 ? cleaned.indexOf('[', subKeyIdx) : cleaned.indexOf('[');

  if (arrayStartIdx !== -1) {
    let i = arrayStartIdx + 1;
    const len = cleaned.length;
    while (i < len) {
      while (i < len && cleaned[i] !== '{' && cleaned[i] !== ']') i++;
      if (i >= len || cleaned[i] === ']') break;

      const objStart = i;
      let depth = 0;
      let inString = false;
      let escaped = false;

      while (i < len) {
        const ch = cleaned[i];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (ch === '\\') {
            escaped = true;
          } else if (ch === '"') {
            inString = false;
          }
        } else {
          if (ch === '"') {
            inString = true;
          } else if (ch === '{') {
            depth++;
          } else if (ch === '}') {
            depth--;
            if (depth === 0) {
              const candidateStr = cleaned.slice(objStart, i + 1);
              try {
                const subObj = JSON.parse(candidateStr);
                if (subObj && typeof subObj.en === 'string' && subObj.en.trim()) {
                  recoveredSubs.push(subObj);
                }
              } catch {
                // ignore malformed fragment
              }
              i++;
              break;
            }
          }
        }
        i++;
      }
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

function escapeRegExpStr(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find the exact substring in `enText` that matches a candidate keyword `w` or `lemma`.
 * Returns null if the word/phrase does NOT appear in `enText`!
 */
function findExactSubstringInSentence(enText: string, wordCandidate: string, lemmaCandidate: string): string | null {
  for (const cand of [wordCandidate, lemmaCandidate]) {
    const clean = (cand || '').trim();
    if (!clean || clean.length < 2) continue;
    const regex = new RegExp(`(?<![A-Za-z])(${escapeRegExpStr(clean)})(?![A-Za-z])`, 'i');
    const match = enText.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    // Also check simple prefix stem match for inflected verbs/nouns (e.g. lemma "architect" in "architecting")
    if (!clean.includes(' ') && clean.length >= 5) {
      const stem = clean.replace(/(?:e|y|ing|ed|s)$/i, '');
      if (stem.length >= 4) {
        const stemRegex = new RegExp(`(?<![A-Za-z])(${escapeRegExpStr(stem)}[a-z]{0,5})(?![A-Za-z])`, 'i');
        const stemMatch = enText.match(stemRegex);
        if (stemMatch && stemMatch[1]) {
          return stemMatch[1];
        }
      }
    }
  }
  return null;
}

/**
 * Enrich & strictly validate subtitles so EVERY subtitle's explanation (`grammarNote`) and
 * highlighted vocabulary (`keywords`) 100% match the exact words in that subtitle!
 */
export function enrichSubtitlesWithTutorEngine(
  rawSubtitles: RawGeminiSubtitleItem[],
  videoTitle: string,
  focusMode: FocusMode
): {
  subtitles: SubtitleItem[];
  quiz: QuizQuestion[];
  summary: VideoLesson['summary'];
} {
  let totalPhrases = 0;
  let totalVocab = 0;
  let cursorTime = 0;

  const defaultBadge =
    focusMode === 'tech-interview'
      ? 'B2/C1 職場專業'
      : focusMode === 'toeic-business'
        ? 'TOEIC 金色高頻'
        : focusMode === 'daily-idioms'
          ? '母語道地片語'
          : 'TED 學術精選';

  const enrichedSubtitles: SubtitleItem[] = rawSubtitles.map((s, idx) => {
    const enText = (s.en || '').trim();
    const zhText = (s.zh || s.en || '').trim();

    // 1. Parse timestamps (supporting both "MM:SS" startTime/endTime and numeric start/end)
    let start = parseTimestampToSeconds(s.startTime ?? s.start, cursorTime);
    if (idx > 0 && start < cursorTime - 0.5) {
      // Guard against model outputting relative timestamp
      start = cursorTime;
    }
    const wordCount = Math.max(1, enText.split(/\s+/).length);
    const estimatedDur = Math.max(2.2, Math.min(8.5, Number((wordCount * 0.38).toFixed(1))));
    let end = parseTimestampToSeconds(s.endTime ?? s.end, start + estimatedDur);
    if (end <= start) {
      end = Number((start + estimatedDur).toFixed(1));
    }

    const nextRaw = rawSubtitles[idx + 1];
    if (nextRaw) {
      const nextStart = parseTimestampToSeconds(nextRaw.startTime ?? nextRaw.start, -1);
      if (nextStart > start && end > nextStart) {
        end = Number(Math.max(start + 0.8, nextStart).toFixed(1));
      }
    }
    cursorTime = end;

    // 2. Extract and strictly validate Gemini-provided keywords for THIS sentence
    const rawWords = Array.isArray(s.words)
      ? s.words
      : Array.isArray(s.keywords)
        ? s.keywords
        : [];

    const validatedKeywords: KeywordItem[] = [];
    const seenLemmas = new Set<string>();

    for (const rw of rawWords) {
      const rawW = (rw.w || rw.word || '').trim();
      const rawL = (rw.l || rw.lemma || rawW).trim().toLowerCase();
      const rawMeaning = (rw.m || rw.meaning || '').trim();

      if (!rawW || !rawMeaning) continue;
      // Reject if meaning is just copying the entire Chinese sentence
      if (rawMeaning === zhText || rawMeaning.includes('原句語境：')) continue;

      // Verify the word/phrase actually exists inside `enText`!
      const exactWordInEn = findExactSubstringInSentence(enText, rawW, rawL);
      if (!exactWordInEn) continue;
      if (seenLemmas.has(rawL)) continue;
      seenLemmas.add(rawL);

      const rawPos = (rw.p || rw.pos || (exactWordInEn.includes(' ') ? 'phr.' : 'n./v.')).trim();
      const isPhrase = rawPos === 'phr.' || exactWordInEn.includes(' ');
      const finalPos = isPhrase ? 'phr.' : rawPos;

      if (isPhrase) totalPhrases++;
      else totalVocab++;

      validatedKeywords.push({
        word: exactWordInEn,
        lemma: rawL,
        pos: finalPos,
        phonetic: (rw.ph || rw.phonetic || `/${rawL}/`).trim(),
        meaning: rawMeaning,
        level: isPhrase ? '道地實用片語' : defaultBadge,
        exampleEn:
          (rw.exEn || rw.exampleEn || '').trim() ||
          enText,
        exampleZh:
          (rw.exZh || rw.exampleZh || '').trim() ||
          zhText
      });

      if (validatedKeywords.length >= 2) break;
    }

    // 3. Supplement with curated phrases/vocabulary from tutorLexicon ONLY if they have a real curated meaning
    if (validatedKeywords.length < 2) {
      const lexiconMatches = selectTutorKeywordsForSentence(enText, focusMode) || [];
      for (const lex of lexiconMatches) {
        if (!lex.meaning || !lex.isCurated) continue;
        const lowL = lex.lemma.toLowerCase();
        if (seenLemmas.has(lowL)) continue;
        const exactWordInEn = findExactSubstringInSentence(enText, lex.word, lex.lemma);
        if (!exactWordInEn) continue;

        seenLemmas.add(lowL);
        if (lex.pos === 'phr.') totalPhrases++;
        else totalVocab++;

        validatedKeywords.push({
          word: exactWordInEn,
          lemma: lex.lemma,
          pos: lex.pos,
          phonetic: lex.phonetic || `/${lex.lemma}/`,
          meaning: lex.meaning,
          level: lex.level || defaultBadge,
          exampleEn: lex.exampleEn || enText,
          exampleZh: lex.exampleZh || zhText
        });
        if (validatedKeywords.length >= 2) break;
      }
    }

    // 4. Sentence-specific tutor note (`grammarNote`)
    const geminiNote = (s.note || s.grammarNote || '').trim();
    const grammarNote =
      geminiNote.length >= 8
        ? geminiNote
        : buildTutorGrammarNote(enText, zhText, validatedKeywords);

    return {
      id: idx + 1,
      start: Number(start.toFixed(1)),
      end: Number(end.toFixed(1)),
      en: enText,
      zh: zhText,
      grammarNote,
      keywords: validatedKeywords
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
      new RegExp(escapeRegExpStr(targetKw.word), 'i'),
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
        `真人感家教精選：標記 ${totalPhrases} 處道地片語（Phrasal Verbs / Idioms）與 ${totalVocab} 個 B2–C2 專業字彙，100% 對應原句語境`,
        `每句皆附專屬「家教隨堂導讀（句型解析 × 母語語感 × 連音技巧）」與 ${quiz.length} 題時間軸實戰測驗`
      ],
      difficultyLevel: 'B2–C1 線上家教精講版',
      topicTags: ['線上家教導讀', `共 ${enrichedSubtitles.length} 句`, '道地片語＋進階字彙']
    }
  };
}

/**
 * Schema with `subtitles` FIRST (so Gemini transcribes chronologically from 00:00 before summarizing),
 * native "MM:SS" timestamp strings, and compact per-sentence tutor note + words!
 */
const GEMINI_TUTOR_VIDEO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subtitles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          startTime: {
            type: Type.STRING,
            description: 'Timestamp when speaker starts this sentence in MM:SS format, e.g. "00:04" or "01:25"'
          },
          endTime: {
            type: Type.STRING,
            description: 'Timestamp when speaker finishes this sentence in MM:SS format, e.g. "00:08" or "01:30"'
          },
          en: {
            type: Type.STRING,
            description: 'Exact verbatim English sentence spoken in the video'
          },
          zh: {
            type: Type.STRING,
            description: 'Accurate Traditional Chinese translation of this exact English sentence'
          },
          note: {
            type: Type.STRING,
            description: 'Online English tutor breakdown of THIS sentence (grammar structure, phrase nuance, or native pronunciation linking tip in Traditional Chinese)'
          },
          words: {
            type: Type.ARRAY,
            description: '0 to 2 key phrasal verbs/idioms or B2-C2 vocabulary words that literally appear inside `en`',
            items: {
              type: Type.OBJECT,
              properties: {
                w: {
                  type: Type.STRING,
                  description: 'Exact word or phrase substring as it appears in `en`'
                },
                l: {
                  type: Type.STRING,
                  description: 'Dictionary base lemma of `w`'
                },
                p: {
                  type: Type.STRING,
                  description: 'Part of speech: "phr." for phrases/idioms, or "n.", "v.", "adj.", "adv."'
                },
                ph: {
                  type: Type.STRING,
                  description: 'KK or IPA phonetic transcription, e.g. "/ˈɑrkəˌtɛktʃɚ/"'
                },
                m: {
                  type: Type.STRING,
                  description: 'Precise Traditional Chinese meaning of this word/phrase in context + usage/collocation tip (do NOT repeat the full sentence translation)'
                },
                exEn: {
                  type: Type.STRING,
                  description: 'Practical English example sentence using this word/phrase'
                },
                exZh: {
                  type: Type.STRING,
                  description: 'Traditional Chinese translation of exEn'
                }
              },
              required: ['w', 'l', 'p', 'ph', 'm', 'exEn', 'exZh']
            }
          }
        },
        required: ['startTime', 'endTime', 'en', 'zh', 'note', 'words']
      }
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        overviewZh: { type: Type.STRING },
        keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
        difficultyLevel: { type: Type.STRING },
        topicTags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['overviewZh', 'keyTakeaways', 'difficultyLevel', 'topicTags']
    }
  },
  required: ['subtitles', 'summary']
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
            if (
              cachedLesson &&
              Array.isArray(cachedLesson.subtitles) &&
              cachedLesson.subtitles.length > 0
            ) {
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

  // 2. If user provided a Gemini API Key, run Gemini directly in the browser with Verbatim Audio-Visual Alignment + Sentence-Matched Tutor Explanations!
  if (cleanKey) {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const focusInstruction = FOCUS_PROMPTS[focusMode] || FOCUS_PROMPTS['tech-interview'];

    const promptText = customTranscript?.trim()
      ? `你是一位頂尖的線上真人英文家教。請將以下影片「${finalTitle}」的英文字幕整理為自然完整的英文句子 (en)、對應的 "MM:SS" 時間戳 (startTime, endTime)、流暢道地的繁體中文翻譯 (zh)、針對該句的「隨堂家教導讀 (note)」，以及該句中出現的 0～2 個道地片語或進階單字 (words)。
【專項模式】：${focusInstruction}
【嚴格規定】：
1. 每句的 words 陣列中，w 必須是該句 en 中實際出現的完整子字串！m 必須是該單字或片語本身的精確中文意思與用法說明，絕不可直接複製整句翻譯。
2. 每句的 note 必須針對該句本身的句型結構、片語語感或母語連音技巧提供具體講解。
【字幕內容】：
${customTranscript}`
      : `你是一位頂尖的線上真人英文家教。請直接聆聽並觀看這支 YouTube 影片的真實音軌與畫面，從頭依時間軸順序列出影片中講者實際說出的每一句完整英文原句 (en)。
【專項模式】：${focusInstruction}
【絕對嚴格規定】：
1. 逐字聽譯原音：en 必須 100% 忠實呈現影片中講者實際開口說的英文原話（若畫面有內嵌字幕亦可參考對照），嚴禁只看標題自行編造、改寫或濃縮摘要！
2. 精準時間軸同步：startTime 與 endTime 請使用影片真實時間軸的 "MM:SS" 格式（例如 "00:03"、"01:24"），每一句長度控制在 1～2 句自然話語（約 3～8 秒），確保與講者開口聲音完全同步。
3. 本句專屬家教導讀 (note)：請針對「該句本身」的句型結構、語氣轉折或連音（Linking）技巧撰寫繁體中文導讀，確保字幕與解說 100% 對應。
4. 本句精選單字與片語 (words)：每句挑選 0～2 個「真正出現在該句 en 中的實用片語 (p 標為 "phr.") 或 B2–C2 進階單字」。
   - w 必須是該句 en 中實際出現的完整英文字詞子字串！
   - m 必須解釋「該單字／片語本身的精準中文意思＋搭配用法或字根記憶法」，絕不可直接複製整句中文字幕！
   - 若該句極短或全為國小國中基礎字（如 Hello everyone / Let's get started），只標記實用片語或給空陣列 []，絕不亂標簡單字。`;

    // Low media resolution (saves 65% tokens so 15-50 min videos fit safely inside Free Tier 250k TPM!)
    const attempts: Array<{
      model: string;
      lowRes: boolean;
      useClipWindow: boolean;
    }> = [
      { model: 'gemini-2.5-flash', lowRes: true, useClipWindow: false },
      { model: 'gemini-2.5-flash', lowRes: true, useClipWindow: true },
      { model: 'gemini-2.5-flash-lite', lowRes: true, useClipWindow: true },
      { model: 'gemini-2.0-flash', lowRes: true, useClipWindow: true }
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
            endOffset: '900s'
          };
        }

        const contents = customTranscript?.trim()
          ? [{ text: promptText }]
          : [videoPart, { text: promptText }];

        const config: any = {
          responseMimeType: 'application/json',
          responseSchema: GEMINI_TUTOR_VIDEO_SCHEMA,
          temperature: 0.15,
          maxOutputTokens: 65536
        };
        if (attempt.lowRes) {
          config.mediaResolution = 'MEDIA_RESOLUTION_LOW';
        }
        if (attempt.model.startsWith('gemini-2.5')) {
          config.thinkingConfig = { thinkingBudget: 1024 };
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
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
          throw new Error(
            'GEMINI_KEY_INVALID: 您輸入的 Gemini API Key 無效，請檢查是否複製完整（應以 AIzaSy 開頭）。'
          );
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
    const translatedRaw: RawGeminiSubtitleItem[] = await Promise.all(
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
