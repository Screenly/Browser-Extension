import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/types/store';
import { ProposalState } from '@/types/core';
import { callApi } from '@/main';
import { AssetResponse } from '@/types/screenly-api';
import {
  setAssetTitle,
  setAssetUrl,
  setAssetHostname,
  setButtonState,
  setError,
  setSaveAuthentication,
  setProposal,
} from '@/features/asset/slice';

export const updateProposal = createAsyncThunk<
  void,
  ProposalState,
  { state: RootState; dispatch: AppDispatch }
>('asset/updateProposal', async (newProposal, { dispatch }) => {
  dispatch(setError({ show: false, message: 'Failed to add or update asset' }));

  const currentProposal = newProposal;
  const url = currentProposal.url;
  const user = currentProposal.user;

  try {
    dispatch(setAssetTitle(currentProposal.title));
    dispatch(setAssetUrl(currentProposal.url));
    dispatch(setAssetHostname(new URL(url).hostname));

    dispatch(setProposal(currentProposal));
    dispatch(setSaveAuthentication(false));

    const queryParams = [
      'and=(type.not.eq.edge-app-file,type.not.eq.edge-app)',
      'or=(status.eq.downloading,status.eq.processing,status.eq.finished)',
      `source_url=eq.${url}`,
    ].join('&');
    const result = await callApi(
      'GET',
      `https://api.screenlyapp.com/api/v4/assets/?${queryParams.toString()}`,
      null,
      user.token,
    );

    if (result.length > 0) {
      dispatch(setButtonState('update'));
      const asset = result[0] as AssetResponse;
      const withCookies = asset.headers?.Cookie !== undefined;

      const updatedProposal = {
        ...currentProposal,
        state: {
          assetId: asset.id,
          withCookies,
          withBypass: asset.disable_verification,
        },
      };

      dispatch(setProposal(updatedProposal));
      dispatch(setSaveAuthentication(withCookies));
    } else {
      dispatch(setButtonState('add'));
    }
  } catch (error) {
    dispatch(setError({ show: true, message: 'Failed to check asset.' }));
    throw error;
  }
});
