import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/types/store';
import { Cookie } from '@/types/core';
import * as cookiejs from 'cookie';
import {
  getAssetDashboardLink,
  getTeamInfo,
  createWebAsset,
  updateWebAsset,
} from '@/main';
import { ApiError } from '@/types/core';
import {
  setButtonState,
  setError,
  setBypassVerification,
} from '@/features/asset/slice';
import { notifyAssetSaveSuccess } from '@/features/popup-slice';
import { pollAssetStatus } from '@/features/asset/thunks/poll-asset-status';

export const submitAsset = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>('asset/submitAsset', async (_, { getState, dispatch }) => {
  const state = getState();
  const { proposal, buttonState, saveAuthentication, bypassVerification } =
    state.asset;

  if (!proposal || buttonState === 'loading') {
    return;
  }

  dispatch(setButtonState('loading'));
  let headers: Record<string, string> = {};

  if (saveAuthentication && proposal.cookieJar) {
    headers = {
      Cookie: proposal.cookieJar
        .map((cookie: Cookie) => cookiejs.serialize(cookie.name, cookie.value))
        .join('; '),
    };
  }

  const assetState = proposal.state;

  try {
    const result = !assetState
      ? await createWebAsset(
          proposal.user,
          proposal.url,
          proposal.title,
          headers,
          bypassVerification,
        )
      : await updateWebAsset(
          assetState.assetId,
          proposal.user,
          proposal.url,
          proposal.title,
          headers,
          bypassVerification,
        );

    if (result.length === 0) {
      throw new Error('No asset data returned');
    }

    if (!assetState) {
      const success = await dispatch(
        pollAssetStatus({
          assetId: result[0].id,
          user: proposal.user,
        }),
      ).unwrap();

      if (!success) {
        return;
      }
    }

    dispatch(setButtonState(assetState ? 'update' : 'add'));

    const teamInfo = await getTeamInfo(proposal.user, result[0].team_id);
    const teamDomain = teamInfo[0].domain;

    const event = new CustomEvent('set-asset-dashboard-link', {
      detail: getAssetDashboardLink(result[0].id, teamDomain),
    });
    document.dispatchEvent(event);

    dispatch(notifyAssetSaveSuccess());
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.statusCode === 401) {
      dispatch(
        setError({
          show: true,
          message:
            'Screenly authentication failed. Try signing out and back in again.',
        }),
      );
      return;
    }

    try {
      const errorJson = await (error as ApiError).json();
      if (errorJson.type && errorJson.type[0] === 'AssetUnreachableError') {
        dispatch(setBypassVerification(true));
        dispatch(
          setError({
            show: true,
            message:
              "Screenly couldn't reach this web page. To save it anyhow, use the Bypass Verification option.",
          }),
        );
      } else if (!errorJson.type) {
        throw JSON.stringify(errorJson);
      } else {
        throw new Error('Unknown error');
      }
    } catch (jsonError) {
      const prefix = assetState
        ? 'Failed to update asset'
        : 'Failed to save web page';

      dispatch(
        setError({
          show: true,
          message: `${prefix}: ${jsonError}`,
        }),
      );

      dispatch(setButtonState(assetState ? 'update' : 'add'));
    }
  }
});
