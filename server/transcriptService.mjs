// YouTube Transcript Extractor (Innertube ANDROID v20.10.38 + XML Format 3 & 1) & Full-Video Smart Sentence Chunker

export function extractVideoId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1).split('/')[0]?.slice(0, 11) || null;
    }
    if (url.searchParams.get('v')) {
      return url.searchParams.get('v')?.slice(0, 11) || null;
    }
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIdx = parts.findIndex((p) => ['embed', 'shorts', 'v', 'live'].includes(p));
    if (embedIdx !== -1 && parts[embedIdx + 1]) {
      return parts[embedIdx + 1].slice(0, 11);
    }
  } catch {
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([0-9A-Za-z_-]{11})/);
    if (match) return match[1];
  }
  return null;
}

export async function fetchVideoMetadata(videoId) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        videoId,
        title: data.title || `YouTube Video (${videoId})`,
        channel: data.author_name || 'YouTube Creator',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  } catch {
    // ignore oembed failure
  }
  return {
    videoId,
    title: `YouTube 英文學習影片 (${videoId})`,
    channel: 'YouTube Channel',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTimedTextXml(xmlText) {
  const segments = [];

  // Format 3: <p t="12645" d="1370">...</p> (milliseconds)
  const pRegex = /<p\s+[^>]*t="(\d+)"[^>]*d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = pRegex.exec(xmlText)) !== null) {
    const startMs = parseInt(m[1], 10);
    const durMs = parseInt(m[2], 10);
    const inner = m[3].replace(/<[^>]+>/g, '');
    const text = decodeHtmlEntities(inner);
    if (!text || /^\[.*\]$/.test(text) || /^\(.*\)$/.test(text) || /^[♪♫]+$/.test(text)) {
      continue;
    }
    const start = Number((startMs / 1000).toFixed(2));
    const end = Number(((startMs + durMs) / 1000).toFixed(2));
    segments.push({ start, end, text });
  }

  if (segments.length > 0) {
    return segments;
  }

  // Format 1: <text start="12.64" dur="1.37">...</text> (seconds)
  const textRegex = /<text\s+[^>]*start="([\d.]+)"[^>]*dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g;
  while ((m = textRegex.exec(xmlText)) !== null) {
    const start = parseFloat(m[1]);
    const dur = parseFloat(m[2]);
    const text = decodeHtmlEntities(m[3].replace(/<[^>]+>/g, ''));
    if (!text || /^\[.*\]$/.test(text) || /^\(.*\)$/.test(text)) continue;
    segments.push({
      start: Number(start.toFixed(2)),
      end: Number((start + dur).toFixed(2)),
      text
    });
  }

  return segments;
}

export async function fetchRawYoutubeCaptions(videoId) {
  const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const html = await watchRes.text();

  const keyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);
  if (!keyMatch) {
    throw new Error('INNERTUBE_KEY_NOT_FOUND');
  }
  const innertubeKey = keyMatch[1];

  const playerRes = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${innertubeKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'ANDROID',
            clientVersion: '20.10.38'
          }
        },
        videoId
      })
    }
  );

  const playerData = await playerRes.json();
  const captionTracks =
    playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
    throw new Error('NO_CAPTIONS_FOUND');
  }

  const enManual = captionTracks.find(
    (t) => t.languageCode?.startsWith('en') && t.kind !== 'asr'
  );
  const enAuto = captionTracks.find((t) => t.languageCode?.startsWith('en'));
  const selectedTrack = enManual || enAuto || captionTracks[0];

  const xmlRes = await fetch(selectedTrack.baseUrl);
  const xmlText = await xmlRes.text();
  const segments = parseTimedTextXml(xmlText);

  if (segments.length === 0) {
    throw new Error('EMPTY_CAPTIONS');
  }

  return segments;
}

/**
 * Full-Video Smart Sentence Chunker (全片碎字幕合併演算法)
 * Merges fragmented 3-4 word YouTube captions into natural sentences across the ENTIRE video!
 */
export function chunkTranscriptIntoSentences(rawSegments, maxSentences = 2000) {
  if (!Array.isArray(rawSegments) || rawSegments.length === 0) return [];

  const merged = [];
  let current = null;

  for (let i = 0; i < rawSegments.length; i++) {
    const seg = rawSegments[i];
    const cleanText = (seg.text || '')
      .replace(/\[(?:music|applause|laughter|音樂|掌聲)\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) continue;

    if (!current) {
      current = {
        start: Number(seg.start.toFixed(1)),
        end: Number(seg.end.toFixed(1)),
        text: cleanText
      };
    } else {
      current.text = `${current.text} ${cleanText}`.replace(/\s+/g, ' ').trim();
      current.end = Number(Math.max(current.end, seg.end).toFixed(1));

      const wordCount = current.text.split(/\s+/).length;
      const duration = current.end - current.start;
      const endsWithPunctuation = /[.?!]["']?$/.test(cleanText);
      const nextSeg = rawSegments[i + 1];
      const nextGap = nextSeg ? nextSeg.start - seg.end : 99;

      const shouldSplit =
        (endsWithPunctuation && wordCount >= 6) ||
        (nextGap > 1.25 && wordCount >= 7) ||
        wordCount >= 22 ||
        duration >= 11;

      if (shouldSplit) {
        let formatted = current.text.charAt(0).toUpperCase() + current.text.slice(1);
        if (!/[.?!]["']?$/.test(formatted)) {
          formatted += '.';
        }
        merged.push({
          id: merged.length + 1,
          start: current.start,
          end: current.end,
          en: formatted
        });
        current = null;
      }
    }
  }

  if (current && current.text) {
    let formatted = current.text.charAt(0).toUpperCase() + current.text.slice(1);
    if (!/[.?!]["']?$/.test(formatted)) {
      formatted += '.';
    }
    merged.push({
      id: merged.length + 1,
      start: current.start,
      end: current.end,
      en: formatted
    });
  }

  // Ensure sequential non-overlapping timestamps
  for (let i = 0; i < merged.length - 1; i++) {
    if (merged[i].end > merged[i + 1].start) {
      merged[i].end = Number(
        Math.max(merged[i].start + 0.8, merged[i + 1].start - 0.1).toFixed(1)
      );
    }
  }

  return merged.slice(0, maxSentences);
}

/**
 * Parse user-pasted raw text or SRT subtitles into timestamped segments (full text, no truncation)
 */
export function parseCustomTranscriptText(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const segments = [];
  let cursorTime = 0;
  for (const line of lines) {
    if (/^\d+$/.test(line) || line.includes('-->')) continue;
    const timeMatch = line.match(/^\[?(\d{1,2}):(\d{2})(?:\.(\d+))?\]?\s*(.+)$/);
    if (timeMatch) {
      const mins = parseInt(timeMatch[1], 10);
      const secs = parseInt(timeMatch[2], 10);
      const start = mins * 60 + secs;
      const text = timeMatch[4].trim();
      const wordCount = text.split(/\s+/).length;
      const dur = Math.max(2.5, Math.min(8, wordCount * 0.42));
      segments.push({ start, end: Number((start + dur).toFixed(1)), text });
      cursorTime = start + dur;
    } else {
      const wordCount = line.split(/\s+/).length;
      const dur = Math.max(3.0, Math.min(9, wordCount * 0.42));
      segments.push({
        start: Number(cursorTime.toFixed(1)),
        end: Number((cursorTime + dur).toFixed(1)),
        text: line
      });
      cursorTime += dur + 0.3;
    }
  }

  return chunkTranscriptIntoSentences(segments, 2000);
}
