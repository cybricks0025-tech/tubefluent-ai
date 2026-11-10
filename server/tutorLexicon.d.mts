import type { FocusMode, KeywordItem } from '../src/types';

export interface RawTutorKeyword extends KeywordItem {
  rootHint?: string;
  isCurated?: boolean;
}

export function selectTutorKeywordsForSentence(
  enText: string,
  focusMode?: FocusMode | string
): RawTutorKeyword[];

export function buildTutorGrammarNote(
  enText: string,
  zhText: string,
  keywords?: KeywordItem[]
): string;
