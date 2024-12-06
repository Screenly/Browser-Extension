/* global browser */

import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { PopupSpinner } from '@/components/popup/popup-spinner';
import { SaveAuthWarning } from '@/components/popup/save-auth-warning';
import { SaveAuthHelp } from '@/components/popup/save-auth-help';

import * as cookiejs from '@/vendor/cookie';
import {
  getAssetDashboardLink,
  getUser,
  getWebAsset,
  createWebAsset,
  updateWebAsset,
  State,
} from '@/main';
import { notifyAssetSaveSuccess } from '@/features/popup/popupSlice';

export const Proposal = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [assetTitle, setAssetTitle] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetHostname, setAssetHostname] = useState('');
  const [buttonState, setButtonState] = useState('add');
  const [error, setError] = useState({
    show: false,
    message: 'Failed to add or update asset'
  });
  const [bypassVerification, setBypassVerification] = useState(false);
  const [saveAuthentication, setSaveAuthentication] = useState(false);
  const [proposal, setProposal] = useState(null);

  const updateProposal = (newProposal) => {
    setError((prev) => {
      return {
        ...prev,
        show: false
      };
    });

    let currentProposal = newProposal;
    const url = currentProposal.url;

    return State.getSavedAssetState(url)
      .then((state) => {
        if (state)
          // Does the asset still exist?
          return getWebAsset(state.assetId, newProposal.user)
            .then(() => {
              // Yes it does. Proceed with the update path.
              return state;
            })
            .catch((error) => {
              if (error.status === 404) {
                // It's gone. Proceed like if we never had it.
                State.setSavedAssetState(url, null);
                return undefined;
              }

              throw error;
            });
      })
      .then((state) => {
        currentProposal.state = state;

        setAssetTitle(currentProposal.title);
        setAssetUrl(currentProposal.url);
        setAssetHostname(new URL(url).hostname);

        setProposal(currentProposal);

        if (state) {
          setSaveAuthentication(state.withCookies);
          setButtonState('update');
        } else {
          setButtonState('add');
        }
      })
      .catch((error) => {
        // Unknown error.
        setError((prev) => {
          return {
            ...prev,
            show: true,
            message: 'Failed to check asset.'
          };
        });
        throw error;
      });
  }

  const proposeToAddToScreenly = async(user, url, title, cookieJar) => {
    await updateProposal({
      user,
      title,
      url: State.normalizeUrl(url),
      cookieJar
    });
  };

  const prepareToAddToScreenly = async() => {
    const onlyPrimaryDomain = true;
    const user = await getUser();

    if (!user.token) {
      return;
    }

    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    let tabId = tabs[0].id;

    try {
      let result = await browser.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          return [
            window.location.href,
            document.title,
            performance.getEntriesByType('resource').map(e => e.name)
          ];
        }
      });

      let [pageUrl, pageTitle, resourceEntries] = result[0].result;

      if (!resourceEntries) {
        return;
      }

      const originDomain = new URL(pageUrl).host;

      let results = await Promise.all(
        resourceEntries.map(url =>
          browser.cookies.getAll({ url })
        )
      );

      let cookieJar = Array.from(
        new Map(
          results
            .flat(1)
            .map(cookie =>
              [
                JSON.stringify([cookie.domain, cookie.name]),
                cookie
              ]
            )
        ).values()
      );

      if (onlyPrimaryDomain) {
        // noinspection JSUnresolvedVariable
        cookieJar = cookieJar.filter(cookie =>
          cookie.domain === originDomain || (!cookie.hostOnly && originDomain.endsWith(cookie.domain))
        )
      }

      await proposeToAddToScreenly(user, pageUrl, pageTitle, cookieJar);
    } catch {
      window.close();
    }
  };

  useEffect(() => {
    setIsLoading(true);
    prepareToAddToScreenly()
      .then(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubmission = async(event) => {
    event.preventDefault();

    let currentProposal = proposal;

    if (buttonState === 'loading') {
      return;
    }

    setButtonState('loading');
    let headers = {};

    if (saveAuthentication && currentProposal.cookieJar) {
      headers = {
        'Cookie': currentProposal.cookieJar.map(
          cookie => cookiejs.serialize(cookie.name, cookie.value)
        ).join('; ')
      };
    }

    const state = currentProposal.state;
    let action = (
      !state ?
        createWebAsset(
          currentProposal.user,
          currentProposal.url,
          currentProposal.title,
          headers,
          bypassVerification
        ) :
        updateWebAsset(
          state.assetId,
          currentProposal.user,
          currentProposal.url,
          currentProposal.title,
          headers,
          bypassVerification
        )
    );

    action
      .then((result) => {
        if (result.length === 0) {
          throw 'No asset data returned';
        }

        State.setSavedAssetState(
          currentProposal.url,
          result[0].id,
          saveAuthentication,
          bypassVerification
        );

        setButtonState(state ? 'update' : 'add');

        const event = new CustomEvent('set-asset-dashboard-link', {
          detail: getAssetDashboardLink(result[0].id)
        });
        document.dispatchEvent(event);

        dispatch(notifyAssetSaveSuccess());
      })
      .catch((error) => {
        if (error.statusCode === 401) {
          setError((prev) => {
            return {
              ...prev,
              show: true,
              message: 'Screenly authentication failed. Try signing out and back in again.'
            };
          });
          return;
        }

        error.json()
          .then((errorJson) => {
            if (
              errorJson.type &&
              errorJson.type[0] === 'AssetUnreachableError'
            ) {
              setBypassVerification(true);
              setError((prev) => {
                return {
                  ...prev,
                  show: true,
                  message: 'Screenly couldn\'t reach this web page. To save it anyhow, use the Bypass Verification option.'
                };
              });
            } else if (!errorJson.type) {
              throw JSON.stringify(errorJson);
            } else {
              throw 'Unknown error';
            }
          }).catch((error) => {
            const prefix = (
              state ?
                'Failed to update asset' :
                'Failed to save web page'
            );
            setError((prev) => {
              return {
                ...prev,
                show: true,
                message: (
                  `${prefix}: ${error}`
                )
              };
            });

            setButtonState(state ? 'update' : 'add');
          });
      });
  };

  if (isLoading) {
    return <PopupSpinner />;
  }

  return (
    <>
      <div className="page" id="proposal-page">
        <form id="add-it">
          <section>
            <h5 id="title">{assetTitle}</h5>
          </section>
          <section className="bg-light">
            <div
              className="break-anywhere text-monospace"
              id="url"
            >
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
              <label
                className="form-check-label"
                htmlFor="with-auth-check"
              >
              Save Authentication
              </label>
            </div>
            <SaveAuthWarning hostname={assetHostname} hidden={!saveAuthentication} />
            <SaveAuthHelp />
          </section>

          <section id="verification" hidden={!bypassVerification}>
            <div className="form-check">
              <input
                className="form-check-input"
                id="no-verification-check"
                type="checkbox"
              />
              <label
                className="form-check-label"
                htmlFor="no-verification-check"
              >
                Bypass Verification
              </label>
            </div>
          </section>

          <section>
            <button
              className="btn btn-primary w-100"
              id="add-it-submit"
              type="submit"
              onClick={handleSubmission}
            >
              <span
                className="add label"
                hidden={buttonState !== "add"}
              >
                Add to Screenly
              </span>

              <span
                className="spinner-border spinner-border-sm"
                hidden={buttonState !== "loading"}
              >
              </span>

              <span
                className="label update"
                hidden={buttonState !== "update"}
              >
                Update Asset
              </span>
            </button>
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
    </>
  );
};
