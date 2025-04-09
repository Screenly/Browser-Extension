/* global browser */

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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
  normalizeUrlString,
  simplifyUrl,
} from '@/main';
import {
  notifyAssetSaveSuccess,
  notifyAssetSaveFailure,
  openSettings,
} from '@/features/popup-slice';
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
    setError((prev: ErrorState) => ({
      ...prev,
      show: false,
    }));

    const currentProposal = newProposal;
    const url = currentProposal.url;

    try {
      setAssetTitle(currentProposal.title);
      setAssetUrl(currentProposal.url);
      setAssetHostname(new URL(url).hostname);

      setProposal(currentProposal);
      setButtonState('add');
      setSaveAuthentication(false);
    } catch (error) {
      setError((prev: ErrorState) => ({
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
      url: normalizeUrlString(url),
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
            .map((cookie: any) => [
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
    } catch (error) {
      dispatch(notifyAssetSaveFailure());
      return false;
    }
  };

  const handleSubmission = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!proposal) {
      return;
    }

    setButtonState('loading');
    setError((prev: ErrorState) => ({
      ...prev,
      show: false,
    }));

    try {
      const headers = saveAuthentication
        ? {
            Cookie: proposal.cookieJar
              .map((cookie: Cookie) => `${cookie.name}=${cookie.value}`)
              .join('; '),
          }
        : null;

      let assetId: string | null = null;
      let assets: AssetResponse[] = [];

      if (buttonState === 'add') {
        assets = await createWebAsset(
          proposal.user,
          proposal.url,
          assetTitle,
          headers,
          bypassVerification,
        );
      } else if (buttonState === 'update' && proposal.state?.assetId) {
        assets = await updateWebAsset(
          proposal.state.assetId,
          proposal.user,
          proposal.url,
          assetTitle,
          headers,
          bypassVerification,
        );
      }

      if (assets.length === 0) {
        throw new Error('Failed to create or update asset');
      }

      assetId = assets[0].id;

      if (assetId) {
        const success = await pollAssetStatus(assetId, proposal.user);

        if (success) {
          dispatch(notifyAssetSaveSuccess());
        }
      }
    } catch (error) {
      setError((prev: ErrorState) => ({
        ...prev,
        show: true,
        message: `Failed to add or update asset: ${(error as Error).message}`,
      }));
    } finally {
      setButtonState('add');
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
