import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/types/store';
import { Cookie, User } from '@/types/core';
import { normalizeUrlString } from '@/main';
import { updateProposal } from '@/features/asset/thunks/update-proposal';

export const proposeToAddToScreenly = createAsyncThunk<
  void,
  {
    user: User;
    url: string;
    title: string;
    cookieJar: Cookie[];
  },
  { state: RootState; dispatch: AppDispatch }
>('asset/proposeToAddToScreenly', async (proposalData, { dispatch }) => {
  const newProposal = {
    user: proposalData.user,
    title: proposalData.title,
    url: normalizeUrlString(proposalData.url),
    cookieJar: proposalData.cookieJar,
  };

  await dispatch(updateProposal(newProposal));
});
