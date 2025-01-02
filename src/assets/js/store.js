import { configureStore } from '@reduxjs/toolkit';

import popupReducer from '@/features/popupSlice';

export const store = configureStore({
  reducer: {
    popup: popupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
