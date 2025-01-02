import { configureStore } from '@reduxjs/toolkit';

import popupReducer from '@/features/popup-slice';

export const store = configureStore({
  reducer: {
    popup: popupReducer,
  },
});
