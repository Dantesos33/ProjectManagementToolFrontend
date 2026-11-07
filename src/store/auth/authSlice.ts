import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthPayload, User } from '../../types';

interface AuthState {
  token: string | null;
  user: User | null;
  bootstrapped: boolean;   // true once the first refresh attempt has finished
}

const initialState: AuthState = { token: null, user: null, bootstrapped: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }: PayloadAction<AuthPayload>) {
      state.token = payload.token;
      state.user = payload.user;
    },
    authBootstrapped(state) {
      state.bootstrapped = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, authBootstrapped, logout } = authSlice.actions;
export default authSlice.reducer;