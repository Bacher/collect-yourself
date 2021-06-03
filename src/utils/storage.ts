import {Point} from '../types';

const LINES_KEY = 'cys_lines';

export type LinesState = Record<string, [Point, Point]>;

export function loadLinesFromStorage(): LinesState {
  try {
    const json = window.localStorage.getItem(LINES_KEY);

    if (json) {
      return JSON.parse(json);
    }
  } catch {}

  return {};
}

function saveLinesToStorage(state: LinesState) {
  localStorage.setItem(LINES_KEY, JSON.stringify(state));
}

export function saveLineToStorage(fileName: string, line: [Point, Point]) {
  const state = loadLinesFromStorage();

  state[fileName] = line;

  saveLinesToStorage(state);
}
