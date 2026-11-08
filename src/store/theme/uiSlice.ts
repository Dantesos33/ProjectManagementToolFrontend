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

export interface RemoteDrag { name: string; at: number }

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  realtime: RealtimeStatus;
  dragging: Record<number, RemoteDrag>; 
}


const initialState: UiState = { theme: getInitialTheme(), sidebarOpen: false, realtime: 'idle', dragging: {} };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, { payload }: PayloadAction<Theme>) { state.theme = payload; },
    toggleTheme(state) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; },
    openSidebar(state) { state.sidebarOpen = true; },
    closeSidebar(state) { state.sidebarOpen = false; },
    setRealtimeStatus(state, { payload }: PayloadAction<RealtimeStatus>) { state.realtime = payload; },
    dragStarted(state, { payload }: PayloadAction<{ taskId: number; name: string }>) {
  state.dragging[payload.taskId] = { name: payload.name, at: Date.now() };
},
dragEnded(state, { payload }: PayloadAction<number>) {
  delete state.dragging[payload];
},
  },
});

export const { setTheme, toggleTheme, openSidebar, closeSidebar, setRealtimeStatus, dragStarted, dragEnded } = uiSlice.actions;
export default uiSlice.reducer;