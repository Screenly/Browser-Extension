import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ButtonState, ErrorState, ProposalState } from '@/types/core';
import { AssetState, initialState } from '@/features/asset/types';

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    setIsLoading: (state: AssetState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAssetTitle: (state: AssetState, action: PayloadAction<string>) => {
      state.assetTitle = action.payload;
    },
    setAssetUrl: (state: AssetState, action: PayloadAction<string>) => {
      state.assetUrl = action.payload;
    },
    setAssetHostname: (state: AssetState, action: PayloadAction<string>) => {
      state.assetHostname = action.payload;
    },
    setButtonState: (state: AssetState, action: PayloadAction<ButtonState>) => {
      state.buttonState = action.payload;
    },
    setError: (state: AssetState, action: PayloadAction<ErrorState>) => {
      state.error = action.payload;
    },
    setBypassVerification: (
      state: AssetState,
      action: PayloadAction<boolean>,
    ) => {
      state.bypassVerification = action.payload;
    },
    setSaveAuthentication: (
      state: AssetState,
      action: PayloadAction<boolean>,
    ) => {
      state.saveAuthentication = action.payload;
    },
    setProposal: (
      state: AssetState,
      action: PayloadAction<ProposalState | null>,
    ) => {
      state.proposal = action.payload;
    },
    setIsPollingTakingLong: (
      state: AssetState,
      action: PayloadAction<boolean>,
    ) => {
      state.isPollingTakingLong = action.payload;
    },
  },
});

export const {
  setIsLoading,
  setAssetTitle,
  setAssetUrl,
  setAssetHostname,
  setButtonState,
  setError,
  setBypassVerification,
  setSaveAuthentication,
  setProposal,
  setIsPollingTakingLong,
} = assetSlice.actions;

export default assetSlice.reducer;
