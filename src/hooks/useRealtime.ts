import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { applyTaskEvent, type TaskChangedPayload } from '../store/tasks/realtime';
import { connectEcho, disconnectEcho } from '../lib/echo';
import { baseApi } from '../store/api/baseApi';
import type { RootState } from '../store/store';
import { authApi } from '../store/auth/authApi';
import { setCredentials } from '../store/auth/authSlice';
import { setRealtimeStatus } from '../store/theme/uiSlice';
import { useAppDispatch, useAppSelector } from './index';

export function useRealtime() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const authed = useAppSelector((s) => !!s.auth.token);
  const tenantId = useAppSelector((s) => s.auth.user?.tenant_id);

  // Depends on "is logged in" and the tenant, NOT the token itself,
  // so the socket stays open across the 15-minute token refreshes.
  useEffect(() => {
    if (!authed || !tenantId) return;

    const echo = connectEcho({
      getToken: () => store.getState().auth.token,
      refreshToken: async () => {
        try {
          const payload = await dispatch(authApi.endpoints.refresh.initiate()).unwrap();
          dispatch(setCredentials(payload));
          return payload.token;
        } catch {
          return null;
        }
      },
    });

    const channelName = `tenant.${tenantId}`;
    const connection = echo.connector.pusher.connection;
    let wasConnected = false;

    const onStateChange = ({ current }: { current: string }) => {
      if (current === 'connected') {
        dispatch(setRealtimeStatus('connected'));
        // Events may have been missed while offline: refetch everything on screen
        if (wasConnected) dispatch(baseApi.util.invalidateTags(['Task', 'Project', 'Stats']));
        wasConnected = true;
      } else if (current === 'connecting' && !wasConnected) {
        dispatch(setRealtimeStatus('connecting'));
      } else {
        dispatch(setRealtimeStatus('reconnecting'));
      }
    };
    connection.bind('state_change', onStateChange);

    echo
      .private(channelName)
      .listen('.task.changed', (e: TaskChangedPayload) => applyTaskEvent(dispatch, e))
      .error(() => dispatch(setRealtimeStatus('error')));

    return () => {
      connection.unbind('state_change', onStateChange);
      echo.leave(channelName);
      disconnectEcho();
      dispatch(setRealtimeStatus('idle'));
    };
  }, [authed, tenantId, dispatch, store]);
}