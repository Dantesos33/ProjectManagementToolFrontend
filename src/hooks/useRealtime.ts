import { useEffect } from "react";
import { useStore } from "react-redux";
import {
  applyTaskEvent,
  type TaskChangedPayload,
} from "../store/tasks/realtime";
import { connectEcho, disconnectEcho } from "../lib/echo";
import { baseApi } from "../store/api/baseApi";
import type { RootState } from "../store/store";
import { authApi } from "../store/auth/authApi";
import { setCredentials } from "../store/auth/authSlice";
import {
  dragEnded,
  dragStarted,
  setRealtimeStatus,
} from "../store/theme/uiSlice";
import { useAppDispatch, useAppSelector } from "./index";

export function useRealtime() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const authed = useAppSelector((s) => !!s.auth.token);
  const tenantId = useAppSelector((s) => s.auth.user?.tenant_id);
  const isAdmin = useAppSelector((s) => s.auth.user?.role === "admin");
  const userId = useAppSelector((s) => s.auth.user?.id);

  // Depends on "is logged in", the tenant and the admin flag, NOT the token itself,
  // so the socket stays open across the 15-minute token refreshes.
  useEffect(() => {
    if (!authed || !tenantId || !userId) return;

    const echo = connectEcho({
      getToken: () => store.getState().auth.token,
      refreshToken: async () => {
        try {
          const payload = await dispatch(
            authApi.endpoints.refresh.initiate(),
          ).unwrap();
          dispatch(setCredentials(payload));
          return payload.token;
        } catch {
          return null;
        }
      },
    });

    const channelName = `tenant.${tenantId}`;
    const adminChannel = `tenant.${tenantId}.admin`;
    const connection = echo.connector.pusher.connection;
    let wasConnected = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const onStateChange = ({ current }: { current: string }) => {
      if (current === "connected") {
        dispatch(setRealtimeStatus("connected"));
        // Events may have been missed while offline: refetch everything on screen
        if (wasConnected) {
          dispatch(
            baseApi.util.invalidateTags([
              "Task",
              "Project",
              "Stats",
              "AuditLog",
            ]),
          );
        }
        wasConnected = true;
      } else if (current === "connecting" && !wasConnected) {
        dispatch(setRealtimeStatus("connecting"));
      } else {
        dispatch(setRealtimeStatus("reconnecting"));
      }
    };
    connection.bind("state_change", onStateChange);

    echo
      .private(channelName)
      .listen(".task.changed", (e: TaskChangedPayload) => {
        dispatch(dragEnded(e.task_id)); // the move landed, so clear the hint
        applyTaskEvent(dispatch, e);
      })
      .listenForWhisper(
        "task.dragging",
        (e: { taskId: number; name: string }) => {
          dispatch(dragStarted(e));
          // Safety net: if the "dropped" whisper is lost (tab closed mid-drag), clear it
          const timer = setTimeout(() => {
            dispatch(dragEnded(e.taskId));
            timers.delete(timer);
          }, 15000);
          timers.add(timer);
        },
      )
      .listenForWhisper("task.dropped", (e: { taskId: number }) => {
        dispatch(dragEnded(e.taskId));
      })
      .error(() => dispatch(setRealtimeStatus("error")));

    if (isAdmin) {
      echo.private(adminChannel).listen(".audit.logged", () => {
        dispatch(baseApi.util.invalidateTags(["AuditLog"]));
      });
    }

    const userChannel = `user.${userId}`;
    echo.private(userChannel).listen(".notification.created", () => {
      dispatch(baseApi.util.invalidateTags(["Notification"]));
    });

    return () => {
      timers.forEach(clearTimeout);
      connection.unbind("state_change", onStateChange);
      echo.leave(channelName);
      if (isAdmin) echo.leave(adminChannel);
      echo.leave(userChannel);
      disconnectEcho();
      dispatch(setRealtimeStatus("idle"));
    };
  }, [authed, tenantId, userId, isAdmin, dispatch, store]);
}
