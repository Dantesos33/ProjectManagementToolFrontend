import {configureStore} from '@reduxjs/toolkit';
import { Slice } from './Slice';

const store = configureStore({
  reducer: {
    [Slice.reducerPath]: Slice.reducer,
  },
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware().concat(Slice.middleware)
  ),
});

export default store;