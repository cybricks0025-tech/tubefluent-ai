import { GoogleGenAI, Type } from '@google/genai';
import { FocusMode, SubtitleItem, VideoLesson } from '../types';

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
  const regexMatch = trimmed.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
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
    const cleanText = line.replace(/<[^>]+>/g, '').trim();
    if (!cleanText) continue;
    const words = cleanText.split(/\s+/).length;
    const dur = Math.max(3, Math.min(8, Math.round(words * 0.42)));
    items.push({
      start: Number(cursorTime.toFixed(1)),
      end: Number((cursorTime + dur).toFixed(1)),
      en: cleanText
    });
    cursorTime += dur;
  }

  return items;
}

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

  // 1. Check static pre-cached lessons in ./cache/ first
  if (!customTranscript) {
    for (const candidate of [
      `./cache/${videoId}_${focusMode}.json`,
      `./cache/${videoId}_tech-interview.json`
    ]) {
      try {
        const staticRes = await fetch(candidate);
        if (staticRes.ok) {
          const cachedLesson = await staticRes.json();
          if (cachedLesson && Array.isArray(cachedLesson.subtitles)) {
            return { ...cachedLesson, cached: true };
          }
        }
      } catch {
        // ignore
      }
    }
  }

  const meta = await fetchVideoMetadataClient(videoId);
  const finalTitle = customTitle?.trim() || meta.title;

  // 2. If user provided a Gemini API Key, run Gemini 2.5 Flash directly in the browser!
  if (apiKey && apiKey.trim()) {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const focusInstruction = FOCUS_PROMPTS[focusMode] || FOCUS_PROMPTS['tech-interview'];

    const fullSchema = {
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
      required: ['summary', 'subtitles', 'quiz']
    };

    const contents = customTranscript?.trim()
      ? [
          {
            text: `請針對以下英文影片字幕「${finalTitle}」進行雙語翻譯、句構語法解析、句中核心單字（含音標、詞性、繁中字義、例句）與 4 題隨堂測驗生成。\n【專項模式】：${focusInstruction}\n【字幕內容】：\n${customTranscript}`
          }
        ]
      : [
          {
            fileData: {
              fileUri: `https://www.youtube.com/watch?v=${videoId}`,
              mimeType: 'video/mp4'
            }
          },
          {
            text: `請直接觀看並聽譯這支 YouTube 影片「${finalTitle}」，完整擷取核心英文句子（含準確的 start 與 end 秒數）、流暢繁體中文翻譯、語法解析、句中重點單字（keywords）與 4 題隨堂測驗（quiz）。\n【專項學習模式】：${focusInstruction}`
          }
        ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: fullSchema,
        temperature: 0.25
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const subs: SubtitleItem[] = Array.isArray(parsed.subtitles) ? parsed.subtitles : [];
    const duration = subs.length > 0 ? Math.ceil(subs[subs.length - 1].end) : 180;

    return {
      id: `yt_${videoId}`,
      videoId,
      title: finalTitle,
      channel: meta.channel,
      duration,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      focusMode,
      summary: parsed.summary || {
        overviewZh: `由 Gemini 2.5 Flash 即時完成「${finalTitle}」全片雙語解析。`,
        keyTakeaways: ['支援逐句點擊跳轉', '標亮重點單字音標與例句', '隨堂測驗檢驗理解度'],
        difficultyLevel: 'B2 Upper-Intermediate',
        topicTags: ['Gemini 2.5 Flash', focusMode]
      },
      subtitles: subs,
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : []
    };
  }

  // 3. If customTranscript is provided without API key on GitHub Pages, translate via MyMemory CORS API
  if (customTranscript && customTranscript.trim()) {
    const rawItems = parseCustomTranscriptClient(customTranscript);
    const subtitles: SubtitleItem[] = await Promise.all(
      rawItems.slice(0, 60).map(async (item, idx) => {
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
          id: idx + 1,
          start: item.start,
          end: item.end,
          en: item.en,
          zh,
          grammarNote: '點擊右上角「AI 深度拆解此句」可查看詳細句構分析。',
          keywords: []
        };
      })
    );

    return {
      id: `yt_${videoId}`,
      videoId,
      title: finalTitle,
      channel: meta.channel,
      duration: subtitles[subtitles.length - 1]?.end || 120,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      focusMode,
      summary: {
        overviewZh: `已從自訂字幕匯入「${finalTitle}」共 ${subtitles.length} 句雙語對照。`,
        keyTakeaways: ['若需在靜態網頁直接解析任意新 YouTube 網址，請於右上角「設定」填入免費 Gemini API Key。'],
        difficultyLevel: 'B2 Upper-Intermediate',
        topicTags: ['Custom Transcript', focusMode]
      },
      subtitles,
      quiz: []
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
  if (apiKey && apiKey.trim()) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
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
        contents: `你是一位專精於「科技外商與母語口語」的英文私教。
影片標題：「${videoTitle}」
目標英文原句：「${sentenceEn}」
目標中文翻譯：「${sentenceZh}」
學習者提問：「${
          userQuestion || '請幫我拆解這句話的文法結構、母語連音技巧與職場替換表達。'
        }」`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.3
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
