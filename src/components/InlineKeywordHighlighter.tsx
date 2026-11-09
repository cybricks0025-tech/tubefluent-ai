import React from 'react';
import { KeywordItem, SubtitleItem } from '../types';

interface InlineKeywordHighlighterProps {
  sentence: SubtitleItem;
  savedWordSet: Set<string>;
  onSelectKeyword: (keyword: KeywordItem, sentence: SubtitleItem) => void;
  darkOverlay?: boolean;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const InlineKeywordHighlighter: React.FC<InlineKeywordHighlighterProps> = ({
  sentence,
  savedWordSet,
  onSelectKeyword,
  darkOverlay = false
}) => {
  const { en, keywords } = sentence;
  if (!keywords || keywords.length === 0) {
    return <span>{en}</span>;
  }

  // Sort keywords by length descending so multi-word phrases match before single words
  const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length);
  const patternStr = sortedKeywords
    .map((k) => escapeRegExp(k.word.trim()))
    .filter(Boolean)
    .join('|');

  if (!patternStr) {
    return <span>{en}</span>;
  }

  // Enforce whole-word boundaries so short keywords never split longer words in half
  const regex = new RegExp(`(?<![A-Za-z])(${patternStr})(?![A-Za-z])`, 'gi');
  const parts = en.split(regex);

  return (
    <>
      {parts.map((part, idx) => {
        const matchedKw = sortedKeywords.find(
          (k) => k.word.trim().toLowerCase() === part.trim().toLowerCase()
        );
        if (!matchedKw) {
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        }

        const isSaved = savedWordSet.has(matchedKw.lemma.toLowerCase());

        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectKeyword(matchedKw, sentence);
            }}
            className={`inline-flex items-baseline gap-0.5 font-semibold underline decoration-2 underline-offset-4 rounded px-1 -mx-0.5 transition cursor-pointer ${
              isSaved
                ? darkOverlay
                  ? 'decoration-amber-400 text-amber-300 bg-amber-500/20 hover:bg-amber-500/30'
                  : 'decoration-amber-500 text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25'
                : darkOverlay
                  ? 'decoration-indigo-400 text-indigo-200 hover:bg-indigo-500/30'
                  : 'decoration-indigo-500 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15'
            }`}
          >
            <span>{part}</span>
          </button>
        );
      })}
    </>
  );
};
