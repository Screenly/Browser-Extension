import { createSlice } from '@reduxjs/toolkit';

const popupSlice = createSlice({
  name: 'popup',
  initialState: {
    loading: false,
    showSignIn: true,
    showProposal: false,
    showSuccess: false,
    assetDashboardLink: '',
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setShowSignIn: (state, action) => {
      state.showSignIn = action.payload;
    },
    setShowProposal: (state, action) => {
      state.showProposal = action.payload;
    },
    setShowSuccess: (state, action) => {
      state.showSuccess = action.payload;
    },
    setAssetDashboardLink: (state, action) => {
      state.assetDashboardLink = action.payload;
    },
  },
});

export const {
  setLoading,
  setShowSignIn,
  setShowProposal,
  setShowSuccess,
  setAssetDashboardLink,
} = popupSlice.actions;
export default popupSlice.reducer;
