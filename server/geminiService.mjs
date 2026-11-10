import { GoogleGenAI, Type } from '@google/genai';
import {
  selectTutorKeywordsForSentence,
  buildTutorGrammarNote
} from './tutorLexicon.mjs';

const FOCUS_PROMPTS = {
  'tech-interview':
    '重點挑選「科技外商面試、產品開發、AI架構、跨部門協作與工程職場」高頻單字與片語，延伸例句請設定在科技公司會議、System Design 或外商面試情境。',
  'toeic-business':
    '重點挑選「多益（TOEIC）金色證書核心字彙、商務談判、專案管理與職場書信」高頻單字與片語，延伸例句請設定在國際商務與企業營運情境。',
  'daily-idioms':
    '重點挑選「母語人士日常高頻片語（Phrasal Verbs）、慣用語（Idioms）、連音表達與道地口語」，延伸例句請設定在自然生活對話與社交情境。',
  'academic-ted':
    '重點挑選「TED 演講、學術論述、精準動詞與邏輯轉折詞彙」，延伸例句請設定在公開演講與深度觀點分享情境。'
};

const SUBTITLE_BATCH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subtitles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          start: { type: Type.NUMBER },
          end: { type: Type.NUMBER },
          en: { type: Type.STRING },
          zh: { type: Type.STRING },
          grammarNote: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                lemma: { type: Type.STRING },
                pos: { type: Type.STRING },
                phonetic: { type: Type.STRING },
                meaning: { type: Type.STRING },
                level: { type: Type.STRING },
                exampleEn: { type: Type.STRING },
                exampleZh: { type: Type.STRING }
              },
              required: [
                'word',
                'lemma',
                'pos',
                'phonetic',
                'meaning',
                'level',
                'exampleEn',
                'exampleZh'
              ]
            }
          }
        },
        required: ['id', 'start', 'end', 'en', 'zh', 'grammarNote', 'keywords']
      }
    }
  },
  required: ['subtitles']
};

const SUMMARY_AND_QUIZ_SCHEMA = {
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
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          questionZh: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          relatedTimestamp: { type: Type.NUMBER }
        },
        required: [
          'question',
          'questionZh',
          'options',
          'answer',
          'explanation',
          'relatedTimestamp'
        ]
      }
    }
  },
  required: ['summary', 'quiz']
};

/**
 * Full-Video Batching Gemini Analyzer (PRD Section 5.2)
 * Splits long transcripts into batches of 25 sentences and processes them concurrently
 * so Gemini never hits maxOutputTokens limits and analyzes 100% of the video!
 */
export async function analyzeTranscriptWithGemini({
  sentences,
  videoTitle,
  focusMode = 'tech-interview',
  apiKey
}) {
  const resolvedKey = apiKey || process.env.GEMINI_API_KEY;
  if (!resolvedKey) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });
  const focusInstruction = FOCUS_PROMPTS[focusMode] || FOCUS_PROMPTS['tech-interview'];

  // Split sentences into batches of 40 and run with max concurrency 2 to respect Free Tier RPM limits
  const BATCH_SIZE = 40;
  const batches = [];
  for (let i = 0; i < sentences.length; i += BATCH_SIZE) {
    batches.push(sentences.slice(i, i + BATCH_SIZE));
  }

  const summaryPromise = ai.models
    .generateContent({
      model: 'gemini-2.5-flash',
      contents: `請根據以下來自 YouTube 影片「${videoTitle}」的完整字幕內容，生成繁體中文影片重點摘要 (summary) 與 4 題具深度的單選理解測驗 (quiz)。
字幕節選：
${JSON.stringify(sentences.filter((_, i) => i % Math.max(1, Math.floor(sentences.length / 25)) === 0))}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: SUMMARY_AND_QUIZ_SCHEMA,
        temperature: 0.25,
        thinkingConfig: { thinkingBudget: 0 }
      }
    })
    .then((r) => JSON.parse(r.text));

  const analyzeSingleBatch = async (batch) => {
    const prompt = `你是一位頂尖、富有親和力的線上真人英文家教（帶領台灣學生一起看 YouTube 影片學道地英文）。請針對以下「${videoTitle}」的字幕批次，輸出 100% 結構化的雙語字幕與家教精選單字／片語解析。
【專項學習模式】：${focusInstruction}
【嚴格家教標準】：
1. 必須嚴格保留輸入陣列中每一句的 id、start、end 與 en，絕對不可遺漏、合併或更改 id！輸出陣列長度必須與輸入完全相同（共 ${batch.length} 句）。
2. 為每一句提供自然流暢且精準對應該句 en 的繁體中文翻譯 (zh)。
3. 為每一句提供像真人英文家教般的「隨堂導讀 (grammarNote)」，專門點出「該句本身」的關鍵句型結構、母語語感轉折、或連音（Linking）跟讀技巧。
4. 每句挑選 0~2 個真正出現在「該句 en 中」的「實用道地片語／慣用語 (pos 標為 phr.)」或「B2–C2 進階／專業單字」放入 keywords（word 必須是該句 en 中實際出現的完整子字串！）。若該句極短且全為國小國中基礎字（如 Hi everyone / Thank you），keywords 請給空陣列 []，絕不要亂標簡單字！
5. 每個 keyword 的 meaning 請提供「該單字／片語本身的語境精準中文解釋＋搭配詞或字根記憶提示」，絕不可直接複製整句中文字幕！

待解析批次 JSON：
${JSON.stringify(batch)}`;

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: SUBTITLE_BATCH_SCHEMA,
        temperature: 0.15,
        maxOutputTokens: 65536,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    const parsed = JSON.parse(res.text);
    const aiSubs = Array.isArray(parsed.subtitles) ? parsed.subtitles : [];

    // Strictly lock each returned item to its original sentence so subtitles & explanations NEVER drift!
    return batch.map((orig, idx) => {
      const matched =
        aiSubs.find((item) => item.id === orig.id) ||
        aiSubs.find(
          (item) =>
            typeof item.en === 'string' &&
            item.en.trim().toLowerCase().slice(0, 20) === orig.en.trim().toLowerCase().slice(0, 20)
        ) ||
        aiSubs[idx] ||
        {};

      const zhText = (matched.zh || orig.en).trim();
      const rawKws = Array.isArray(matched.keywords) ? matched.keywords : [];
      const validKeywords = rawKws.filter((kw) => {
        if (!kw || !kw.word || !kw.meaning) return false;
        const w = kw.word.trim();
        return orig.en.toLowerCase().includes(w.toLowerCase()) && kw.meaning.trim() !== zhText;
      });

      const grammarNote =
        matched.grammarNote && matched.grammarNote.trim().length > 6
          ? matched.grammarNote.trim()
          : buildTutorGrammarNote(orig.en, zhText, validKeywords);

      return {
        id: orig.id,
        start: orig.start,
        end: orig.end,
        en: orig.en,
        zh: zhText,
        grammarNote,
        keywords: validKeywords
      };
    });
  };

  const subtitleChunks = [];
  for (let i = 0; i < batches.length; i += 2) {
    const pair = batches.slice(i, i + 2);
    const pairResults = await Promise.all(pair.map((b) => analyzeSingleBatch(b)));
    subtitleChunks.push(...pairResults);
  }

  const summaryAndQuiz = await summaryPromise;
  const allSubtitles = subtitleChunks.flat().sort((a, b) => a.id - b.id);

  return {
    summary: summaryAndQuiz.summary,
    subtitles: allSubtitles,
    quiz: summaryAndQuiz.quiz
  };
}

function parseServerTimestamp(raw, fallbackSec = 0) {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return Math.max(0, Number(raw.toFixed(1)));
  if (typeof raw !== 'string') return fallbackSec;
  const s = raw.trim();
  const m = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/);
  if (m) {
    if (m[3] !== undefined) {
      return Number((parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3])).toFixed(1));
    }
    return Number((parseInt(m[1], 10) * 60 + parseFloat(m[2])).toFixed(1));
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? fallbackSec : Math.max(0, Number(n.toFixed(1)));
}

export async function analyzeYoutubeVideoDirectlyWithGemini({
  videoId,
  videoTitle,
  focusMode = 'tech-interview',
  apiKey
}) {
  const resolvedKey = (apiKey || process.env.GEMINI_API_KEY || '').replace(
    /["'\s\u200B-\u200D\uFEFF]/g,
    ''
  );
  if (!resolvedKey) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });
  const focusInstruction = FOCUS_PROMPTS[focusMode] || FOCUS_PROMPTS['tech-interview'];
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const directVideoSchema = {
    type: Type.OBJECT,
    properties: {
      subtitles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            startTime: { type: Type.STRING, description: 'MM:SS timestamp e.g. 00:04' },
            endTime: { type: Type.STRING, description: 'MM:SS timestamp e.g. 00:08' },
            en: { type: Type.STRING },
            zh: { type: Type.STRING },
            note: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  w: { type: Type.STRING },
                  l: { type: Type.STRING },
                  p: { type: Type.STRING },
                  ph: { type: Type.STRING },
                  m: { type: Type.STRING },
                  exEn: { type: Type.STRING },
                  exZh: { type: Type.STRING }
                },
                required: ['w', 'l', 'p', 'ph', 'm', 'exEn', 'exZh']
              }
            }
          },
          required: ['startTime', 'endTime', 'en', 'zh', 'note', 'words']
        }
      },
      summary: SUMMARY_AND_QUIZ_SCHEMA.properties.summary,
      quiz: SUMMARY_AND_QUIZ_SCHEMA.properties.quiz
    },
    required: ['subtitles', 'summary', 'quiz']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        fileData: {
          fileUri: youtubeUrl,
          mimeType: 'video/mp4'
        }
      },
      {
        text: `你是一位頂尖的線上真人英文家教。請直接聆聽並觀看這支 YouTube 影片的真實音軌與畫面，從頭依時間軸順序列出講者實際說出的每一句完整英文原句 (en)、對應的 "MM:SS" 時間戳 (startTime, endTime)、繁體中文翻譯 (zh)、針對該句本身的家教隨堂導讀 (note)，以及真正出現在該句 en 中的 0～2 個道地片語或進階單字 (words)。
【專項學習模式】：${focusInstruction}`
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: directVideoSchema,
      temperature: 0.15,
      maxOutputTokens: 65536,
      mediaResolution: 'MEDIA_RESOLUTION_LOW',
      thinkingConfig: { thinkingBudget: 1024 }
    }
  });

  const parsed = JSON.parse(response.text);
  const rawSubs = Array.isArray(parsed.subtitles) ? parsed.subtitles : [];
  let cursor = 0;
  parsed.subtitles = rawSubs.map((s, idx) => {
    const enText = (s.en || '').trim();
    const zhText = (s.zh || s.en || '').trim();
    const start = parseServerTimestamp(s.startTime ?? s.start, cursor);
    let end = parseServerTimestamp(s.endTime ?? s.end, start + 3.5);
    if (end <= start) end = Number((start + 3.5).toFixed(1));
    cursor = end;

    const rawWords = Array.isArray(s.words) ? s.words : [];
    const keywords = rawWords
      .filter((kw) => kw && kw.w && kw.m && enText.toLowerCase().includes(kw.w.trim().toLowerCase()))
      .map((kw) => ({
        word: kw.w.trim(),
        lemma: (kw.l || kw.w).trim().toLowerCase(),
        pos: kw.p || 'n./v.',
        phonetic: kw.ph || `/${(kw.l || kw.w).trim().toLowerCase()}/`,
        meaning: kw.m.trim(),
        level: kw.p === 'phr.' ? '道地實用片語' : 'B2/C1 職場專業',
        exampleEn: kw.exEn || enText,
        exampleZh: kw.exZh || zhText
      }));

    return {
      id: idx + 1,
      start,
      end,
      en: enText,
      zh: zhText,
      grammarNote:
        s.note && s.note.trim().length > 6
          ? s.note.trim()
          : buildTutorGrammarNote(enText, zhText, keywords),
      keywords
    };
  });

  return parsed;
}

export async function askSentenceTutorWithGemini({
  sentenceEn,
  sentenceZh,
  userQuestion,
  videoTitle,
  apiKey
}) {
  const resolvedKey = apiKey || process.env.GEMINI_API_KEY;
  if (!resolvedKey) {
    return generateLocalSentenceBreakdown(sentenceEn, sentenceZh, userQuestion);
  }

  const ai = new GoogleGenAI({ apiKey: resolvedKey });
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
    required: ['structureBreakdown', 'pronunciationTips', 'workplaceParaphrases', 'tutorReply']
  };

  const prompt = `影片標題：${videoTitle}
目標英文句子："${sentenceEn}"
中文翻譯："${sentenceZh}"
學習者提問：${userQuestion || '請幫我拆解這句的句型結構、連音發音技巧，以及如何應用在職場口說中。'}

請以繁體中文提供深度教學拆解。`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.3
    }
  });

  return JSON.parse(response.text);
}

export function generateLocalSentenceBreakdown(sentenceEn, sentenceZh, userQuestion) {
  const words = sentenceEn.replace(/[.?!,"]/g, '').split(/\s+/).filter(Boolean);
  const longWords = words.filter((w) => w.length >= 6).slice(0, 3);
  return {
    structureBreakdown: `主幹句型拆解：本句共 ${words.length} 個字詞，核心關鍵字包含 ${longWords.join(', ') || words.slice(0, 3).join(', ')}。可先掌握主詞與核心動詞，再透過介系詞或從屬子句延伸補充語意。`,
    pronunciationTips: `連音與語調指南：朗讀時請將功能詞（to, of, in, that, and）輕讀弱化為 /ə/，並將語調重音放在實義字（${longWords.join(' / ') || words.slice(0, 2).join(' / ')}）。`,
    workplaceParaphrases: [
      {
        en: `From a practical standpoint, ${sentenceEn.charAt(0).toLowerCase() + sentenceEn.slice(1)}`,
        zh: `從實務角度來看，${sentenceZh}`,
        nuance: '適合外商跨部門會議補充觀點'
      },
      {
        en: `What really stands out here is that ${sentenceEn.charAt(0).toLowerCase() + sentenceEn.slice(1)}`,
        zh: `這裡最值得關注的重點在於：${sentenceZh}`,
        nuance: '適合演講總結或重點強調'
      }
    ],
    tutorReply: userQuestion
      ? `針對您的問題「${userQuestion}」：本句在母語演講中透過子句推進語氣。若想啟用 Gemini 2.5 Flash 針對任意問題進行無限追問，也可在右上角「AI 設定」填入 API Key！`
      : `這句話展現了相當道地的英語資訊密度與節奏感。建議搭配「單句循環」與「跟讀分頁」練習連音節奏！`
  };
}

const TRANSLATE_CLIENTS = ['at', 'it', 'dict-chrome-ex', 'gtx'];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateSingleChunkToZhTW(batch) {
  const numberedQuery = batch.map((s, idx) => `[${idx}] ${s}`).join('\n');
  for (let attempt = 0; attempt < TRANSLATE_CLIENTS.length; attempt++) {
    const client = TRANSLATE_CLIENTS[attempt];
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=${client}&sl=en&tl=zh-TW&dt=t`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
          },
          body: 'q=' + encodeURIComponent(numberedQuery)
        }
      );
      if (!res.ok) {
        await sleep(250 * (attempt + 1));
        continue;
      }
      const data = await res.json();
      const fullTranslated = (data[0] || []).map((part) => part[0] || '').join('');
      const lines = fullTranslated.split(/\n+/);

      return batch.map((_, idx) => {
        const matchedLine =
          lines.find(
            (l) =>
              l.trim().startsWith(`[${idx}]`) ||
              l.trim().startsWith(`【${idx}】`) ||
              l.trim().startsWith(`[ ${idx} ]`)
          ) ||
          lines[idx] ||
          '';
        return matchedLine.replace(/^[\[【]\s*\d+\s*[\]】]\s*/, '').trim();
      });
    } catch {
      await sleep(250 * (attempt + 1));
    }
  }
  return batch.map(() => '');
}

/**
 * High-Speed Reliable POST Batch Translator (Multi-endpoint fallback to prevent 429 rate-limits)
 */
async function translateBatchToZhTW(enStrings) {
  if (!enStrings || enStrings.length === 0) return [];

  const CHUNK_SIZE = 32;
  const results = new Array(enStrings.length).fill('');
  for (let i = 0; i < enStrings.length; i += CHUNK_SIZE) {
    const batch = enStrings.slice(i, i + CHUNK_SIZE);
    const translated = await translateSingleChunkToZhTW(batch);
    for (let j = 0; j < batch.length; j++) {
      results[i + j] = translated[j] || '';
    }
    if (i + CHUNK_SIZE < enStrings.length) {
      await sleep(150);
    }
  }

  return results;
}

const STOPWORDS = new Set([
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would',
  'there', 'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when',
  'make', 'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
  'day', 'most', 'very', 'was', 'were', 'are', 'been', 'has', 'had', 'going',
  'really', 'something', 'things', 'thing', 'lot', 'where', 'much', 'more',
  'those', 'being', 'through', 'should', 'actually', 'every', 'little', 'around'
]);

const POS_MAP = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  preposition: 'prep.',
  conjunction: 'conj.'
};

function inferLemmaAndPos(word) {
  const low = word.toLowerCase();
  if (low.endsWith('ly') && low.length > 4) {
    return { lemma: low, pos: 'adv.' };
  }
  if (low.endsWith('tion') || low.endsWith('sion') || low.endsWith('ment') || low.endsWith('ness') || low.endsWith('ity')) {
    return { lemma: low, pos: 'n.' };
  }
  if (low.endsWith('ous') || low.endsWith('ive') || low.endsWith('able') || low.endsWith('ible') || low.endsWith('ful') || low.endsWith('al')) {
    return { lemma: low, pos: 'adj.' };
  }
  if (low.endsWith('ing') && low.length > 5) {
    return { lemma: low.slice(0, -3), pos: 'v./n.' };
  }
  if (low.endsWith('ied') && low.length > 5) {
    return { lemma: low.slice(0, -3) + 'y', pos: 'v.' };
  }
  if (low.endsWith('ed') && low.length > 4) {
    return { lemma: low.slice(0, -2), pos: 'v./adj.' };
  }
  if (low.endsWith('ies') && low.length > 5) {
    return { lemma: low.slice(0, -3) + 'y', pos: 'n./v.' };
  }
  if (low.endsWith('s') && !low.endsWith('ss') && !low.endsWith('us') && !low.endsWith('is') && low.length > 4) {
    return { lemma: low.slice(0, -1), pos: 'n./v.' };
  }
  return { lemma: low, pos: 'n./v.' };
}

async function lookupWordDictionary(word) {
  const clean = word.toLowerCase().replace(/[^a-z-]/g, '');
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const entry = data?.[0];
    if (!entry) return null;
    const phonetic =
      entry.phonetic ||
      entry.phonetics?.find((p) => p.text)?.text ||
      `/${clean}/`;
    const firstMeaning = entry.meanings?.[0];
    const pos = POS_MAP[firstMeaning?.partOfSpeech] || firstMeaning?.partOfSpeech || 'n./v.';
    const defObj = firstMeaning?.definitions?.[0];
    const defEn = defObj?.definition || '';
    const exampleEn = defObj?.example || '';
    return {
      lemma: entry.word || clean,
      pos,
      phonetic,
      defEn,
      exampleEn
    };
  } catch {
    return null;
  }
}

/**
 * Full-Video Zero-Key Cloud Bilingual & Dictionary AI Analysis Pipeline
 * Translates 100% of sentences and 100% of extracted keywords across the entire video!
 */
export async function buildSmartLocalAnalysis(
  sentences,
  videoTitle,
  focusMode = 'tech-interview'
) {
  // 1. Select tutor-grade phrases (Idioms / Phrasal Verbs) & B2-C2 advanced vocabulary per sentence
  const sentenceTutorKeywords = sentences.map((s) =>
    selectTutorKeywordsForSentence(s.en, focusMode)
  );

  // Collect uncurated B2-C2 lemmas that need translation
  const uncuratedLemmas = Array.from(
    new Set(
      sentenceTutorKeywords
        .flat()
        .filter((kw) => !kw.isCurated && !kw.meaning)
        .map((kw) => kw.lemma.toLowerCase())
    )
  );

  const topWordsForDict = uncuratedLemmas.slice(0, 35);
  const [sentenceTranslations, translatedUncuratedMeanings, dictEntries] = await Promise.all([
    translateBatchToZhTW(sentences.map((s) => s.en)),
    translateBatchToZhTW(uncuratedLemmas),
    Promise.all(
      topWordsForDict.map(async (w) => {
        const info = await lookupWordDictionary(w);
        return [w, info];
      })
    )
  ]);

  const dictMap = Object.fromEntries(dictEntries);
  const uncuratedMeaningMap = new Map();
  uncuratedLemmas.forEach((lemma, idx) => {
    uncuratedMeaningMap.set(lemma, (translatedUncuratedMeanings[idx] || '').trim() || lemma);
  });

  let totalPhrases = 0;
  let totalVocab = 0;

  const enrichedSubtitles = sentences.map((s, idx) => {
    const rawKws = sentenceTutorKeywords[idx] || [];
    const keywords = rawKws.map((kw) => {
      const lowLemma = kw.lemma.toLowerCase();
      const dict = dictMap[lowLemma];
      let meaning = kw.meaning;
      let exampleEn = kw.exampleEn;
      let exampleZh = kw.exampleZh;
      let phonetic = dict?.phonetic || kw.phonetic;

      if (!meaning) {
        const baseM = uncuratedMeaningMap.get(lowLemma) || kw.lemma;
        meaning = kw.rootHint ? `${baseM}（${kw.rootHint}）` : baseM;
        exampleZh = `在專業溝通語境中，精準運用「${baseM}（${kw.lemma}）」能讓表達更具說服力。`;
      }
      if (dict?.exampleEn && !kw.isCurated) {
        exampleEn = dict.exampleEn;
      }

      if (kw.pos === 'phr.') totalPhrases++;
      else totalVocab++;

      return {
        word: kw.word,
        lemma: kw.lemma,
        pos: kw.pos,
        phonetic,
        meaning,
        level: kw.level,
        exampleEn,
        exampleZh
      };
    });

    const zhText = sentenceTranslations[idx] || s.en;
    const grammarNote = buildTutorGrammarNote(s.en, zhText, keywords);

    return {
      id: idx + 1,
      start: s.start,
      end: s.end,
      en: s.en,
      zh: zhText,
      grammarNote,
      keywords
    };
  });

  const subsWithKw = enrichedSubtitles.filter((s) => s.keywords && s.keywords.length > 0);
  const allUniqueWords = Array.from(
    new Set(subsWithKw.flatMap((s) => s.keywords.map((k) => k.word)))
  );

  // Build 5 comprehension questions from sentences with tutor-selected phrases or advanced words
  const quiz = [];
  const ratios = [0.06, 0.28, 0.52, 0.75, 0.92];
  const sampleIndices = ratios
    .map((r) => Math.min(subsWithKw.length - 1, Math.floor(subsWithKw.length * r)))
    .filter((v, i, a) => v >= 0 && a.indexOf(v) === i);

  for (let i = 0; i < sampleIndices.length; i++) {
    const sIdx = sampleIndices[i];
    const targetSub = subsWithKw[sIdx];
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
      distractors[(sIdx + 2) % Math.max(1, distractors.length)] || 'perspective',
      distractors[(sIdx + 7) % Math.max(1, distractors.length)] || 'framework',
      distractors[(sIdx + 13) % Math.max(1, distractors.length)] || 'momentum'
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
  const midZh =
    enrichedSubtitles[Math.floor(enrichedSubtitles.length / 2)]?.zh || '';
  const endZh = enrichedSubtitles[enrichedSubtitles.length - 1]?.zh || '';

  return {
    summary: {
      overviewZh: `已完整解析全片「${videoTitle}」（片長約 ${totalDurMin} 分鐘，共 ${enrichedSubtitles.length} 個完整語句、${allUniqueWords.length} 個精選字詞與片語）。全片脈絡從「${introZh.slice(0, 45)}⋯」展開，中段探討「${midZh.slice(0, 45)}⋯」，最終收斂於「${endZh.slice(0, 45)}」。`,
      keyTakeaways: [
        `全片 100% 雙語時間軸同步：共 ${enrichedSubtitles.length} 句中英對照字幕（${enrichedSubtitles[0]?.start || 0}s 至 ${
          enrichedSubtitles[enrichedSubtitles.length - 1]?.end || 0
        }s）`,
        `真人感家教精選：標記 ${totalPhrases} 處道地片語（Phrasal Verbs / Idioms）與 ${totalVocab} 個 B2–C2 專業字彙，自動過濾簡單基礎字`,
        `每句皆附「家教隨堂導讀（句型解析 × 母語語感 × 連音技巧）」與 ${quiz.length} 題時間軸實戰測驗`
      ],
      difficultyLevel: 'B2–C1 線上家教精講版',
      topicTags: ['線上家教導讀', `共 ${enrichedSubtitles.length} 句`, '道地片語＋進階字彙']
    },
    subtitles: enrichedSubtitles,
    quiz
  };
}
