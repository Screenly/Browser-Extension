import { configureStore } from '@reduxjs/toolkit';

import popupReducer from '@/features/popup-slice';
import assetReducer from '@/features/asset-slice';

export const store = configureStore({
  reducer: {
    popup: popupReducer,
    asset: assetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
