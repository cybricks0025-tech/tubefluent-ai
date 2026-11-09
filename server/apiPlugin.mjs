import fs from 'node:fs/promises';
import path from 'node:path';
import {
  extractVideoId,
  fetchVideoMetadata,
  fetchRawYoutubeCaptions,
  chunkTranscriptIntoSentences,
  parseCustomTranscriptText
} from './transcriptService.mjs';
import {
  analyzeTranscriptWithGemini,
  analyzeYoutubeVideoDirectlyWithGemini,
  askSentenceTutorWithGemini,
  buildSmartLocalAnalysis
} from './geminiService.mjs';

const CACHE_DIR = path.resolve(process.cwd(), 'server', 'cache');

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function createApiMiddleware() {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0] || '';
    if (!url.startsWith('/api/')) {
      return next();
    }

    try {
      await ensureCacheDir();

      if (req.method === 'GET' && url === '/api/health') {
        const files = await fs.readdir(CACHE_DIR).catch(() => []);
        const cacheCount = files.filter((f) => f.endsWith('.json')).length;
        return sendJson(res, 200, {
          ok: true,
          hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
          cacheCount
        });
      }

      if (req.method === 'GET' && url === '/api/cache') {
        const isFull = req.url?.includes('full=1');
        const files = await fs.readdir(CACHE_DIR).catch(() => []);
        const items = [];
        for (const f of files) {
          if (!f.endsWith('.json')) continue;
          try {
            const raw = await fs.readFile(path.join(CACHE_DIR, f), 'utf-8');
            const parsed = JSON.parse(raw);
            if (isFull) {
              items.push({ ...parsed, cached: true });
            } else {
              items.push({
                cacheKey: f.replace('.json', ''),
                videoId: parsed.videoId,
                title: parsed.title,
                channel: parsed.channel,
                focusMode: parsed.focusMode,
                cachedAt: parsed.cachedAt,
                sentenceCount: parsed.subtitles?.length || 0
              });
            }
          } catch {
            // ignore malformed cache file
          }
        }
        items.sort((a, b) => String(b.cachedAt || '').localeCompare(String(a.cachedAt || '')));
        return sendJson(res, 200, { items });
      }

      if (req.method === 'POST' && url === '/api/analyze') {
        const body = await readJsonBody(req);
        const {
          urlOrId = '',
          focusMode = 'tech-interview',
          apiKey = '',
          customTranscript = '',
          customTitle = '',
          forceRefresh = false
        } = body;

        const videoId = extractVideoId(urlOrId) || `custom_${Date.now().toString(36)}`;
        const safeFocus = focusMode.replace(/[^a-z0-9-_]/gi, '');
        const hasKey = Boolean((apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY);
        const cachePath = path.join(CACHE_DIR, `${videoId}_${safeFocus}.json`);

        // 1. Check local JSON cache
        if (!forceRefresh && !customTranscript.trim()) {
          try {
            const cachedRaw = await fs.readFile(cachePath, 'utf-8');
            const cachedData = JSON.parse(cachedRaw);
            // If user now provides a Gemini key and cached was fallback, re-run with Gemini
            if (!(hasKey && cachedData.analysisSource !== 'gemini-2.5-flash')) {
              return sendJson(res, 200, {
                ...cachedData,
                cached: true
              });
            }
          } catch {
            // Not in cache, continue
          }
        }

        // 2. Fetch Video Metadata
        const meta = await fetchVideoMetadata(videoId);
        if (customTitle.trim()) {
          meta.title = customTitle.trim();
        }

        // 3. Extract & Chunk Subtitles
        let chunkedSentences = [];
        let transcriptSource = 'youtube-innertube-android';

        if (customTranscript && customTranscript.trim().length > 10) {
          chunkedSentences = parseCustomTranscriptText(customTranscript);
          transcriptSource = 'user-custom-transcript';
        } else {
          try {
            const rawSegments = await fetchRawYoutubeCaptions(videoId);
            chunkedSentences = chunkTranscriptIntoSentences(rawSegments, 2000);
          } catch (captionErr) {
            // If captions are missing on YouTube, but user has Gemini API Key, use Gemini Direct Video Multimodal!
            if (hasKey && !videoId.startsWith('custom_')) {
              try {
                const directResult = await analyzeYoutubeVideoDirectlyWithGemini({
                  videoId,
                  videoTitle: meta.title,
                  focusMode,
                  apiKey: apiKey.trim()
                });
                const finalDirectPayload = {
                  id: `${videoId}_${safeFocus}`,
                  videoId,
                  title: meta.title,
                  channel: meta.channel,
                  thumbnail: meta.thumbnail,
                  duration: Math.ceil(
                    directResult.subtitles?.[directResult.subtitles.length - 1]?.end || 180
                  ),
                  focusMode,
                  transcriptSource: 'gemini-multimodal-video',
                  analysisSource: 'gemini-2.5-flash',
                  cached: false,
                  cachedAt: new Date().toISOString(),
                  ...directResult
                };
                await fs.writeFile(
                  cachePath,
                  JSON.stringify(finalDirectPayload, null, 2),
                  'utf-8'
                );
                return sendJson(res, 200, finalDirectPayload);
              } catch {
                // fall through to helpful error message
              }
            }

            return sendJson(res, 422, {
              error: 'CAPTION_FETCH_FAILED',
              videoId,
              title: meta.title,
              message:
                '此 YouTube 影片未開放英文字幕軌。您可以：(1) 在「AI 設定」填入 Gemini API Key 由多模態直接聽譯影片，或 (2) 直接貼上英文逐字稿進行解析！',
              detail: captionErr?.message || String(captionErr)
            });
          }
        }

        if (chunkedSentences.length === 0) {
          return sendJson(res, 422, {
            error: 'EMPTY_TRANSCRIPT',
            message: '無法從該影片解析出有效的英文句子，請確認影片含有英文字幕或手動貼上字幕文字。'
          });
        }

        // 4. Run Gemini Structured Output Analysis OR Zero-Key Cloud Bilingual & Dictionary AI Pipeline
        let structuredResult;
        let analysisSource = 'gemini-2.5-flash';

        if (hasKey) {
          try {
            structuredResult = await analyzeTranscriptWithGemini({
              sentences: chunkedSentences,
              videoTitle: meta.title,
              focusMode,
              apiKey: apiKey.trim()
            });
          } catch (geminiErr) {
            // Gracefully fall back to cloud bilingual analysis if key is invalid/quota exceeded
            structuredResult = await buildSmartLocalAnalysis(
              chunkedSentences,
              meta.title,
              focusMode
            );
            analysisSource = 'cloud-bilingual-engine';
          }
        } else {
          structuredResult = await buildSmartLocalAnalysis(
            chunkedSentences,
            meta.title,
            focusMode
          );
          analysisSource = 'cloud-bilingual-engine';
        }

        const finalPayload = {
          id: `${videoId}_${safeFocus}`,
          videoId,
          title: meta.title,
          channel: meta.channel,
          thumbnail: meta.thumbnail,
          duration: Math.ceil(
            chunkedSentences[chunkedSentences.length - 1]?.end || 180
          ),
          focusMode,
          transcriptSource,
          analysisSource,
          cached: false,
          cachedAt: new Date().toISOString(),
          ...structuredResult
        };

        await fs.writeFile(cachePath, JSON.stringify(finalPayload, null, 2), 'utf-8');

        return sendJson(res, 200, finalPayload);
      }

      if (req.method === 'POST' && url === '/api/tutor') {
        const body = await readJsonBody(req);
        const result = await askSentenceTutorWithGemini(body);
        return sendJson(res, 200, result);
      }

      return sendJson(res, 404, { error: 'NOT_FOUND' });
    } catch (err) {
      console.error('[API Error]', err);
      return sendJson(res, 500, {
        error: 'INTERNAL_SERVER_ERROR',
        message: err?.message || '伺服器處理發生未預期錯誤'
      });
    }
  };
}

export function youtubeLearningApiPlugin() {
  const middleware = createApiMiddleware();
  return {
    name: 'youtube-learning-api-plugin',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    }
  };
}
