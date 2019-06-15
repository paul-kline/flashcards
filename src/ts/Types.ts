import FlashCard from "./FlashCard";
export interface ToAdd {
  originalKey: string;
  originalValue: string;
  key: string;
  value: string;
  reverse: boolean;
  collection: string;
}
export interface EntriesMap {
  [s: string]: EntryValue;
}
export interface CollectionMap {
  [s: string]: EntriesMap;
}
export interface FlashCardsMap {
  [s: string]: FlashCard[];
}
export interface EntryValue {
  key: string;
  value: string;
  reverse: boolean;
  created: Date;
  stats: Stats;
}
export interface Stats {
  got: Date[];
  missed: Date[];
  reverseGot: Date[];
  reverseMissed: Date[];
}
export function emptyStats(): Stats {
  const a: Stats = { got: [], missed: [], reverseGot: [], reverseMissed: [] };
  return a;
}
