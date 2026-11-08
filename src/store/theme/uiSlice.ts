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

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  realtime: RealtimeStatus;
}


const initialState: UiState = { theme: getInitialTheme(), sidebarOpen: false, realtime: 'idle' };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, { payload }: PayloadAction<Theme>) { state.theme = payload; },
    toggleTheme(state) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; },
    openSidebar(state) { state.sidebarOpen = true; },
    closeSidebar(state) { state.sidebarOpen = false; },
    setRealtimeStatus(state, { payload }: PayloadAction<RealtimeStatus>) { state.realtime = payload; },
  },
});

export const { setTheme, toggleTheme, openSidebar, closeSidebar, setRealtimeStatus } = uiSlice.actions;
export default uiSlice.reducer;