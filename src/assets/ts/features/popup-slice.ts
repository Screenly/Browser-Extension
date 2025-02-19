/* global browser */

import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { getPlaylists } from '@/main';

interface Playlist {
  id: string;
  title: string;
}

interface PopupState {
  showSignIn: boolean;
  showProposal: boolean;
  showSuccess: boolean;
  showSignInSuccess: boolean;
  assetDashboardLink: string;
  showSettings: boolean;
  playlists: Playlist[];
  selectedPlaylistIds: string[];
}

const initialState: PopupState = {
  showSignIn: true,
  showProposal: false,
  showSuccess: false,
  showSignInSuccess: false,
  assetDashboardLink: '',
  showSettings: false,
  playlists: [],
  selectedPlaylistIds: [],
};

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

export const fetchPlaylists = createAsyncThunk(
  'popup/fetchPlaylists',
  async () => {
    const result = await browser.storage.sync.get('token');
    if (result.token) {
      const playlists = await getPlaylists(result.token);
      return playlists;
    }
    return [];
  }
);

const popupSlice = createSlice({
  name: 'popup',
  initialState,
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
    setSelectedPlaylists: (state, action: PayloadAction<string[]>) => {
      state.selectedPlaylistIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.fulfilled, (state, action: PayloadAction<boolean>) => {
        if (action.payload) {
          state.showSignIn = false;
          state.showProposal = true;
        }
      })
      .addCase(signOut.fulfilled, (state) => {
        state.showSettings = false;
        state.showSignIn = true;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action: PayloadAction<Playlist[]>) => {
        state.playlists = [
          ...action.payload,
        ];
      });
  },
});

export const {
  notifyAssetSaveSuccess,
  notifySignInSuccess,
  openSettings,
  setSelectedPlaylists,
} = popupSlice.actions;
export default popupSlice.reducer;
