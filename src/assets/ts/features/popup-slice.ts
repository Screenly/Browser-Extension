/* global browser */

import {
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';
import { getPlaylists } from '@/main';

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
  initialState: {
    showSignIn: true,
    showProposal: false,
    showSuccess: false,
    showSignInSuccess: false,
    assetDashboardLink: '',
    showSettings: false,
    playlists: [
      {
        id: '',
        title: 'None',
      }
    ],
    selectedPlaylistId: '',
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
    setSelectedPlaylist: (state, action) => {
      state.selectedPlaylistId = action.payload;
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
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.playlists = [
          {
            id: '',
            title: 'None',
          },
          ...action.payload,
        ];
      });
  },
});

export const {
  notifyAssetSaveSuccess,
  notifySignInSuccess,
  openSettings,
  setSelectedPlaylist,
} = popupSlice.actions;
export default popupSlice.reducer;
