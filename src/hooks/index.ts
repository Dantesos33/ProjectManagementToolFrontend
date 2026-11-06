import { useLogout } from './useLogout';
import { useTheme } from './useTheme';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';

export const useAppLogout = useLogout;
export const useAppTheme = useTheme;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();