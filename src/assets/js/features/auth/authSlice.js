import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    signedIn: false,
  },
  reducers: {
    signIn: (state) => {
      state.signedIn = true;
    },
    signOut: (state) => {
      state.signedIn = false;
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
