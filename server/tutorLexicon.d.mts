import type { KeywordAnnotation } from '../src/types';

export function selectTutorKeywordsForSentence(
  enText: string,
  maxItems?: number
): KeywordAnnotation[];

export function buildTutorGrammarNote(
  enText: string,
  selectedKeywords: KeywordAnnotation[]
): string;
