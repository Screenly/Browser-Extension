'use strict';

import normalizeUrl from 'normalize-url';
interface RequestInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

declare global {
  const browser: any;
  interface Window {
    normalizeUrl: (url: string, options: any) => string;
  }
}

type BrowserStorageState = Record<string, any>;

export function callApi(
  method: string,
  url: string,
  data: any,
  token: string
) {
  let init: RequestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    }
  };

  if (data !== undefined && data !== null) {
    init.body = JSON.stringify(data);
  }

  if (token) {
    init.headers['Authorization'] = `Token ${token}`;
  }

  return fetch(url, init)
    .then(response => {
      if (!(response.status >= 200 && response.status < 300)) {
        throw response;
      }

      return response.json();
    }).then((jsonResponse) => {
      return jsonResponse;
    }).catch((error) => {
      // Do some basic logging but then just rethrow the error.

      if (error.status)

      throw error;
    });
}

export function getUser() {
  return browser.storage.sync.get(['token']);
}

export function createWebAsset(
  user: any,
  url: string,
  title: string,
  headers: any,
  disableVerification: boolean
) {
  return callApi(
    'POST',
    'https://api.screenlyapp.com/api/v4/assets/',
    {
      'source_url': url,
      'title': title,
      'headers': headers,
      'disable_verification': disableVerification,
    },
    user.token
  );
}

export function updateWebAsset(
  assetId: string,
  user: any,
  url: string,
  title: string,
  headers: any,
  disableVerification: boolean
) { // eslint-disable-line no-unused-vars
  let queryParams = `id=eq.${encodeURIComponent(assetId)}`;
  return callApi(
    'PATCH',
    `https://api.screenlyapp.com/api/v4/assets/?${queryParams}`,
    {
      'title': title,
      'headers': headers,
    },
    user.token
  );
}

export function getWebAsset(assetId: string, user: any) {
  return callApi(
    'GET',
    `https://api.screenlyapp.com/api/v4/assets/${encodeURIComponent(assetId)}/`,
    null,
    user.token
  )
}

export function getAssetDashboardLink(assetId: string) {
  return `https://login.screenlyapp.com/login?next=/manage/assets/${assetId}`;
}


export class State {
  constructor() {
  }

  // Make a new URL equivalent to the given URL but in a normalized format.
  static normalizeUrl(url: string) {
    return normalizeUrl(url, {
      removeTrailingSlash: false,
      sortQueryParameters: false,
      stripWWW: false,
    });
  }

  // Simplify a URL heavily, even if it slightly changes its meaning.
  static simplifyUrl(url: string) {
    return normalizeUrl(url, {
      removeTrailingSlash: true,
      sortQueryParameters: true,
      stripHash: true,
      stripProtocol: true,
      stripWWW: true,
    })
  }

  static setSavedAssetState(
    url: string,
    assetId: string | null,
    withCookies: boolean,
    withBypass: boolean
  ) {
    url = State.simplifyUrl(url);

    const savedState = {
      assetId: assetId,
      withCookies: withCookies,
      withBypass: withBypass
    };

    return browser.storage.sync.get(['state'])
      .then((state: BrowserStorageState) => {
        state = state || {};

        if (assetId) {
          state[url] = savedState;
        } else
          delete state[url];

        return browser.storage.sync.set({'state': state})
          .catch((error: Error) => {

            if (!error || !error.message || !error.message.includes('QUOTA_BYTES')) {
              // Unknown error. Ignore.
              throw error;
            }

            // Storage full - clear it, then try again.
            // TODO Use LRU to ensure the dictionary doesn't ever grow larger than the
            // sync storage limit.
            return browser.storage.sync.remove('state').then(() => {
              if (assetId) {
                state = {};
                state[url] = savedState;
                return browser.storage.sync.set({'state': state});
              } else
                return browser.storage.sync.set({'state': {}});
            });
          });
      });
  }

  static getSavedAssetState(url: string) {
    url = State.simplifyUrl(url);

    return browser.storage.sync.get(['state'])
      .then(({state}: {state: BrowserStorageState}) => {
        state = state || {};
        const v = state[url];
        if (typeof v != 'object') {
          // Backwards compatibility with 0.2. Just ignore the old format.
          return undefined;
        }
        return v;
      });
  }
}
