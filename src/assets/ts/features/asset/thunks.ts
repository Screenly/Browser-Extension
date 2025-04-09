/* global browser */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/types/store';
import { Cookie, User, ProposalState } from '@/types/core';
import * as cookiejs from '@/vendor/cookie.mjs';
import {
  callApi,
  getAssetDashboardLink,
  getUser,
  getWebAsset,
  getTeamInfo,
  createWebAsset,
  updateWebAsset,
  normalizeUrlString,
} from '@/main';
import { AssetResponse } from '@/types/screenly-api';
import { ApiError } from '@/types/core';
import {
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
} from '@/features/asset/slice';
import {
  openSettings,
  notifyAssetSaveFailure,
  notifyAssetSaveSuccess,
} from '@/features/popup-slice';

const MAX_ASSET_STATUS_POLL_COUNT = 30;
const ASSET_STATUS_POLL_INTERVAL_MS = 1000;

export const prepareToAddToScreenly = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>('asset/prepareToAddToScreenly', async (_, { dispatch }) => {
  dispatch(setIsLoading(true));

  try {
    const onlyPrimaryDomain = true;
    const user = await getUser();

    if (!user.token) {
      dispatch(setIsLoading(false));
      return;
    }

    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tabId = tabs[0].id;

    if (!tabId) {
      dispatch(setIsLoading(false));
      return;
    }

    try {
      const result = await browser.scripting.executeScript({
        target: { tabId },
        func: () => {
          return [
            window.location.href,
            document.title,
            performance.getEntriesByType('resource').map((e) => e.name),
          ] as [string, string, string[]];
        },
      });

      if (!result?.[0]?.result || !Array.isArray(result[0].result)) {
        throw new Error('Failed to get page information');
      }

      const [pageUrl, pageTitle, resourceEntries] = result[0].result as [
        string,
        string,
        string[],
      ];

      if (!resourceEntries) {
        dispatch(setIsLoading(false));
        return;
      }

      const originDomain = new URL(pageUrl).host;

      const results = await Promise.all(
        resourceEntries.map((url: string) => browser.cookies.getAll({ url })),
      );

      let cookieJar = Array.from(
        new Map(
          results
            .flat(1)
            .map((cookie: Cookie) => [
              JSON.stringify([cookie.domain, cookie.name]),
              cookie,
            ]),
        ).values(),
      ) as Cookie[];

      if (onlyPrimaryDomain) {
        cookieJar = cookieJar.filter(
          (cookie: Cookie) =>
            cookie.domain === originDomain ||
            (!cookie.hostOnly && originDomain.endsWith(cookie.domain)),
        );
      }

      await dispatch(
        proposeToAddToScreenly({
          user: user as User,
          url: pageUrl,
          title: pageTitle,
          cookieJar,
        }),
      );
    } catch {
      dispatch(openSettings());
    }
  } finally {
    dispatch(setIsLoading(false));
  }
});

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

export const pollAssetStatus = createAsyncThunk<
  boolean,
  { assetId: string; user: User },
  { state: RootState; dispatch: AppDispatch }
>('asset/pollAssetStatus', async ({ assetId, user }, { dispatch }) => {
  let pollCount = 0;
  let longPollingTimeout: number | null = null;

  try {
    // Set a timeout to show the "taking longer than expected" message after a few seconds
    longPollingTimeout = window.setTimeout(() => {
      dispatch(setIsPollingTakingLong(true));
    }, 2000);

    while (pollCount < MAX_ASSET_STATUS_POLL_COUNT) {
      const asset = await getWebAsset(assetId, user);
      if (!asset || !asset[0] || !asset[0].status) {
        break;
      }

      const status = asset[0].status;
      if (['downloading', 'processing', 'finished'].includes(status)) {
        break;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, ASSET_STATUS_POLL_INTERVAL_MS),
      );
      pollCount++;
    }

    // Clear the timeout if it hasn't fired yet
    if (longPollingTimeout) {
      clearTimeout(longPollingTimeout);
    }

    // Reset the polling message state
    dispatch(setIsPollingTakingLong(false));

    if (pollCount >= MAX_ASSET_STATUS_POLL_COUNT) {
      dispatch(notifyAssetSaveFailure());
      return false;
    }

    return true;
  } catch {
    // Clear the timeout if it hasn't fired yet
    if (longPollingTimeout) {
      clearTimeout(longPollingTimeout);
    }

    // Reset the polling message state
    dispatch(setIsPollingTakingLong(false));

    dispatch(notifyAssetSaveFailure());
    return false;
  }
});

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
