/* global browser */

import {
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';

export const signIn = createAsyncThunk(
  'popup/signIn',
  async () => {
    const result = await browser.storage.sync.get('token');
    if (result.token) {
      return true;
    }
    return false;
  }
);

export const signOut = createAsyncThunk(
  'popup/signOut',
  async () => {
    await browser.storage.sync.clear();
  }
);

const popupSlice = createSlice({
  name: 'popup',
  initialState: {
    showSignIn: true,
    showProposal: false,
    showSuccess: false,
    showSignInSuccess: false,
    assetDashboardLink: '',
    showSettings: false,
  },
  reducers: {
    notifyAssetSaveSuccess: (state) => {
      state.showSuccess = true;
      state.showProposal = false;
    },
    notifySignInSuccess: (state) => {
      state.showSignIn = false;
      state.showSignInSuccess = true;
    },
    openSettings: (state) => {
      state.showSettings = true;
      state.showProposal = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.fulfilled, (state, action) => {
        if (action.payload) {
          state.showSignIn = false;
          state.showProposal = true;
        }
      })
      .addCase(signOut.fulfilled, (state) => {
        state.showSettings = false;
        state.showSignIn = true;
      });
  },
});

export const {
  setAssetDashboardLink,
  notifyAssetSaveSuccess,
  notifySignInSuccess,
  openSettings,
} = popupSlice.actions;
export default popupSlice.reducer;
