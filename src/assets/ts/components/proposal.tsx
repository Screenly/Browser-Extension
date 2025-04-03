/* global browser */

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { User } from '@/main';

import { PopupSpinner } from '@/components/popup-spinner';
import { SaveAuthWarning } from '@/components/save-auth-warning';
import { SaveAuthHelp } from '@/components/save-auth-help';

import * as cookiejs from '@/vendor/cookie.mjs';
import {
  getAssetDashboardLink,
  getUser,
  getWebAsset,
  getTeamInfo,
  createWebAsset,
  updateWebAsset,
  State,
  SavedAssetState,
} from '@/main';
import {
  notifyAssetSaveSuccess,
  notifyAssetSaveFailure,
  openSettings,
} from '@/features/popup-slice';

const MAX_ASSET_STATUS_POLL_COUNT = 30;
const ASSET_STATUS_POLL_INTERVAL_MS = 1000;

interface ErrorState {
  show: boolean;
  message: string;
}

interface ProposalState {
  user: User;
  title: string;
  url: string;
  cookieJar: Cookie[];
  state?: SavedAssetState;
}

interface Cookie {
  domain: string;
  name: string;
  value: string;
  hostOnly?: boolean;
}

type ButtonState = 'add' | 'update' | 'loading';

interface AssetError {
  type?: string[];
}

interface ApiError {
  status?: number;
  statusCode?: number;
  json(): Promise<AssetError>;
}

export const Proposal: React.FC = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assetTitle, setAssetTitle] = useState<string>('');
  const [assetUrl, setAssetUrl] = useState<string>('');
  const [assetHostname, setAssetHostname] = useState<string>('');
  const [buttonState, setButtonState] = useState<ButtonState>('add');
  const [error, setError] = useState<ErrorState>({
    show: false,
    message: 'Failed to add or update asset',
  });
  const [bypassVerification, setBypassVerification] = useState<boolean>(false);
  const [saveAuthentication, setSaveAuthentication] = useState<boolean>(false);
  const [proposal, setProposal] = useState<ProposalState | null>(null);

  const updateProposal = async (newProposal: ProposalState): Promise<void> => {
    setError((prev) => ({
      ...prev,
      show: false,
    }));

    const currentProposal = newProposal;
    const url = currentProposal.url;

    try {
      const state = await State.getSavedAssetState(url);

      if (state) {
        try {
          await getWebAsset(state.assetId, newProposal.user);
          currentProposal.state = state;
        } catch (error: unknown) {
          const apiError = error as ApiError;
          if (apiError.status === 404) {
            State.setSavedAssetState(url, null, false, false);
            currentProposal.state = undefined;
          } else {
            throw error;
          }
        }
      }

      setAssetTitle(currentProposal.title);
      setAssetUrl(currentProposal.url);
      setAssetHostname(new URL(url).hostname);

      setProposal(currentProposal);

      const resetAssetState = async (): Promise<void> => {
        setButtonState('add');
        setSaveAuthentication(false);
        setProposal(currentProposal);
        await State.removeSavedAssetState(url);
      };

      if (currentProposal.state) {
        setSaveAuthentication(currentProposal.state.withCookies);

        try {
          const assets = await getWebAsset(
            currentProposal.state.assetId,
            currentProposal.user,
          );

          if (assets.length === 0) {
            await resetAssetState();
          } else {
            setButtonState('update');
          }
        } catch (error) {
          setError((prev) => ({
            ...prev,
            show: true,
            message: `Failed to get asset details: ${(error as Error).message}`,
          }));
          await resetAssetState();
        }
      } else {
        setButtonState('add');
      }
    } catch (error) {
      setError((prev) => ({
        ...prev,
        show: true,
        message: 'Failed to check asset.',
      }));
      throw error;
    }
  };

  const proposeToAddToScreenly = async (
    user: User,
    url: string,
    title: string,
    cookieJar: Cookie[],
  ): Promise<void> => {
    await updateProposal({
      user,
      title,
      url: State.normalizeUrl(url),
      cookieJar,
    });
  };

  const prepareToAddToScreenly = async (): Promise<void> => {
    const onlyPrimaryDomain = true;
    const user = await getUser();

    if (!user.token) {
      return;
    }

    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tabId = tabs[0].id;

    if (!tabId) return;

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
            .map((cookie) => [
              JSON.stringify([cookie.domain, cookie.name]),
              cookie,
            ]),
        ).values(),
      );

      if (onlyPrimaryDomain) {
        cookieJar = cookieJar.filter(
          (cookie) =>
            cookie.domain === originDomain ||
            (!cookie.hostOnly && originDomain.endsWith(cookie.domain)),
        );
      }

      await proposeToAddToScreenly(user as User, pageUrl, pageTitle, cookieJar);
    } catch {
      dispatch(openSettings());
    }
  };

  useEffect(() => {
    setIsLoading(true);
    prepareToAddToScreenly().then(() => {
      setIsLoading(false);
    });
  }, []);

  const handleSettings = (event: React.MouseEvent): void => {
    event.preventDefault();
    dispatch(openSettings());
  };

  const pollAssetStatus = async (
    assetId: string,
    user: User,
  ): Promise<boolean> => {
    let pollCount = 0;
    try {
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

      if (pollCount >= MAX_ASSET_STATUS_POLL_COUNT) {
        dispatch(notifyAssetSaveFailure());
        return false;
      }
      return true;
    } catch {
      dispatch(notifyAssetSaveFailure());
      return false;
    }
  };

  const handleSubmission = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!proposal || buttonState === 'loading') {
      return;
    }

    setButtonState('loading');
    let headers: Record<string, string> = {};

    if (saveAuthentication && proposal.cookieJar) {
      headers = {
        Cookie: proposal.cookieJar
          .map((cookie) => cookiejs.serialize(cookie.name, cookie.value))
          .join('; '),
      };
    }

    const state = proposal.state;

    try {
      const result = !state
        ? await createWebAsset(
            proposal.user,
            proposal.url,
            proposal.title,
            headers,
            bypassVerification,
          )
        : await updateWebAsset(
            state.assetId,
            proposal.user,
            proposal.url,
            proposal.title,
            headers,
            bypassVerification,
          );

      if (result.length === 0) {
        throw new Error('No asset data returned');
      }

      if (!state) {
        const success = await pollAssetStatus(result[0].id, proposal.user);
        if (!success) {
          return;
        }
      }

      State.setSavedAssetState(
        proposal.url,
        result[0].id,
        saveAuthentication,
        bypassVerification,
      );

      setButtonState(state ? 'update' : 'add');

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
        setError((prev) => ({
          ...prev,
          show: true,
          message:
            'Screenly authentication failed. Try signing out and back in again.',
        }));
        return;
      }

      try {
        const errorJson = await (error as ApiError).json();
        if (errorJson.type && errorJson.type[0] === 'AssetUnreachableError') {
          setBypassVerification(true);
          setError((prev) => ({
            ...prev,
            show: true,
            message:
              "Screenly couldn't reach this web page. To save it anyhow, use the Bypass Verification option.",
          }));
        } else if (!errorJson.type) {
          throw JSON.stringify(errorJson);
        } else {
          throw new Error('Unknown error');
        }
      } catch (jsonError) {
        const prefix = state
          ? 'Failed to update asset'
          : 'Failed to save web page';

        setError((prev) => ({
          ...prev,
          show: true,
          message: `${prefix}: ${jsonError}`,
        }));

        setButtonState(state ? 'update' : 'add');
      }
    }
  };

  if (isLoading) {
    return <PopupSpinner />;
  }

  return (
    <div className="page" id="proposal-page">
      <form id="add-it">
        <section>
          <h5 id="title">{assetTitle}</h5>
        </section>
        <section className="bg-light">
          <div className="break-anywhere text-monospace" id="url">
            {assetUrl}
          </div>
        </section>
        <section>
          <div className="form-check">
            <input
              className="form-check-input shadow-none"
              id="with-auth-check"
              type="checkbox"
              checked={saveAuthentication}
              onChange={(e) => setSaveAuthentication(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="with-auth-check">
              Save Authentication
            </label>
          </div>
          <SaveAuthWarning
            hostname={assetHostname}
            hidden={!saveAuthentication}
          />
          <SaveAuthHelp />
        </section>

        <section id="verification" hidden={!bypassVerification}>
          <div className="form-check">
            <input
              className="form-check-input"
              id="no-verification-check"
              type="checkbox"
            />
            <label className="form-check-label" htmlFor="no-verification-check">
              Bypass Verification
            </label>
          </div>
        </section>

        <section>
          <div className="d-flex">
            <button
              className="btn btn-primary w-100 me-1"
              id="add-it-submit"
              type="submit"
              onClick={handleSubmission}
            >
              <span className="add label" hidden={buttonState !== 'add'}>
                Add to Screenly
              </span>

              <span
                className="spinner-border spinner-border-sm"
                hidden={buttonState !== 'loading'}
              ></span>

              <span className="label update" hidden={buttonState !== 'update'}>
                Update Asset
              </span>
            </button>
            <button className="btn btn-primary" onClick={handleSettings}>
              <i className="bi bi-gear"></i>
            </button>
          </div>
          <div
            className="alert alert-danger mb-0 mt-3"
            id="add-it-error"
            hidden={!error.show}
          >
            {error.message}
          </div>
        </section>
      </form>
    </div>
  );
};
