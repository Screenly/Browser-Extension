/* global browser */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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
import {
  ErrorState,
  ButtonState,
  ApiError,
  Cookie,
  ProposalState,
  User,
} from '@/types/core';
import { AssetResponse } from '@/types/screenly-api';

const MAX_ASSET_STATUS_POLL_COUNT = 30;
const ASSET_STATUS_POLL_INTERVAL_MS = 1000;

export interface AssetState {
  isLoading: boolean;
  assetTitle: string;
  assetUrl: string;
  assetHostname: string;
  buttonState: ButtonState;
  error: ErrorState;
  bypassVerification: boolean;
  saveAuthentication: boolean;
  proposal: ProposalState | null;
  isPollingTakingLong: boolean;
}

const initialState: AssetState = {
  isLoading: false,
  assetTitle: '',
  assetUrl: '',
  assetHostname: '',
  buttonState: 'add',
  error: {
    show: false,
    message: 'Failed to add or update asset',
  },
  bypassVerification: false,
  saveAuthentication: false,
  proposal: null,
  isPollingTakingLong: false,
};

// Async thunks
export const prepareToAddToScreenly = createAsyncThunk(
  'asset/prepareToAddToScreenly',
  async (_, { dispatch }) => {
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
        dispatch({ type: 'popup/openSettings' });
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  },
);

export const proposeToAddToScreenly = createAsyncThunk(
  'asset/proposeToAddToScreenly',
  async (
    proposalData: {
      user: User;
      url: string;
      title: string;
      cookieJar: Cookie[];
    },
    { dispatch },
  ) => {
    const newProposal: ProposalState = {
      user: proposalData.user,
      title: proposalData.title,
      url: normalizeUrlString(proposalData.url),
      cookieJar: proposalData.cookieJar,
    };

    await dispatch(updateProposal(newProposal));
  },
);

export const updateProposal = createAsyncThunk(
  'asset/updateProposal',
  async (newProposal: ProposalState, { dispatch }) => {
    dispatch(
      setError({ show: false, message: 'Failed to add or update asset' }),
    );

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
      alert(error);
      throw error;
    }
  },
);

export const pollAssetStatus = createAsyncThunk(
  'asset/pollAssetStatus',
  async ({ assetId, user }: { assetId: string; user: User }, { dispatch }) => {
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
        dispatch({ type: 'popup/notifyAssetSaveFailure' });
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

      dispatch({ type: 'popup/notifyAssetSaveFailure' });
      return false;
    }
  },
);

export const submitAsset = createAsyncThunk(
  'asset/submitAsset',
  async (_, { getState, dispatch }) => {
    const state = getState() as { asset: AssetState };
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
          .map((cookie: Cookie) =>
            cookiejs.serialize(cookie.name, cookie.value),
          )
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

      dispatch({ type: 'popup/notifyAssetSaveSuccess' });
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
  },
);

// Slice
const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAssetTitle: (state, action: PayloadAction<string>) => {
      state.assetTitle = action.payload;
    },
    setAssetUrl: (state, action: PayloadAction<string>) => {
      state.assetUrl = action.payload;
    },
    setAssetHostname: (state, action: PayloadAction<string>) => {
      state.assetHostname = action.payload;
    },
    setButtonState: (state, action: PayloadAction<ButtonState>) => {
      state.buttonState = action.payload;
    },
    setError: (state, action: PayloadAction<ErrorState>) => {
      state.error = action.payload;
    },
    setBypassVerification: (state, action: PayloadAction<boolean>) => {
      state.bypassVerification = action.payload;
    },
    setSaveAuthentication: (state, action: PayloadAction<boolean>) => {
      state.saveAuthentication = action.payload;
    },
    setProposal: (state, action: PayloadAction<ProposalState | null>) => {
      state.proposal = action.payload;
    },
    setIsPollingTakingLong: (state, action: PayloadAction<boolean>) => {
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
