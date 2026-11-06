import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';
export const THEME_KEY = 'theme';

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage blocked */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: getInitialTheme() as Theme },
  reducers: {
    setTheme(state, { payload }: PayloadAction<Theme>) { state.theme = payload; },
    toggleTheme(state) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; },
  },
});

export const { setTheme, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;