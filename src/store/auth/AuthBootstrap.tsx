import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/index';
import { authApi } from '../../store/auth/authApi';
import { authBootstrapped, setCredentials } from '../../store/auth/authSlice';

// Module-level so React StrictMode's double effect only fires one request
let bootstrap: Promise<void> | null = null;

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const ready = useAppSelector((state) => state.auth.bootstrapped);

  useEffect(() => {
    bootstrap ??= dispatch(authApi.endpoints.refresh.initiate())
      .unwrap()
      .then((payload) => {
        dispatch(setCredentials(payload));
      })
      .catch(() => {
        /* no valid cookie: stay logged out */
      })
      .finally(() => {
        dispatch(authBootstrapped());
      });
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return <>{children}</>;
}