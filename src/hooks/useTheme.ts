import { useEffect } from 'react';
import { useAppSelector } from './index';
import { THEME_KEY } from '../store/theme/uiSlice';

export function useTheme() {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);
}