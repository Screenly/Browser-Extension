/// <reference types="chrome"/>
/* global browser, chrome */
'use strict';

import normalizeUrl from 'normalize-url';
import {
  AssetResponse,
  ApiResponseData,
  UserResponse,
  TeamResponse,
} from '@/types/screenly-api';
import { User, RequestInit } from '@/types/core';

declare global {
  const browser: typeof chrome;
}

export function callApi(
  method: string,
  url: string,
  data: object | null,
  token?: string,
): Promise<ApiResponseData[]> {
  const init: RequestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  };

  if (data !== undefined && data !== null) {
    init.body = JSON.stringify(data);
  }

  if (token) {
    init.headers['Authorization'] = `Token ${token}`;
  }

  return fetch(url, init)
    .then((response) => {
      if (!(response.status >= 200 && response.status < 300)) {
        throw response;
      }

      return response.json();
    })
    .then((jsonResponse) => {
      return jsonResponse;
    })
    .catch((error) => {
      // Do some basic logging but then just rethrow the error.

      if (error.status) throw error;
    });
}

export function getUser(): Promise<User> {
  return browser.storage.sync.get(['token']);
}

export function createWebAsset(
  user: User,
  url: string,
  title: string,
  headers: object | null,
  disableVerification: boolean,
): Promise<AssetResponse[]> {
  return callApi(
    'POST',
    'https://api.screenlyapp.com/api/v4/assets/',
    {
      source_url: url,
      title: title,
      headers: headers,
      disable_verification: disableVerification,
    },
    user.token,
  ).then((response: ApiResponseData[]) => {
    return response as AssetResponse[];
  });
}

export function updateWebAsset(
  assetId: string | null,
  user: User,
  url: string,
  title: string,
  headers: object | null,
  disableVerification: boolean,
): Promise<AssetResponse[]> {
  const params = new URLSearchParams({ id: `eq.${assetId || ''}` });

  return callApi(
    'PATCH',
    `https://api.screenlyapp.com/api/v4/assets/?${params.toString()}`,
    {
      // API expects snake_case, so we transform from camelCase
      title: title,
      headers: headers,
      disable_verification: disableVerification,
    },
    user.token,
  ).then((response: ApiResponseData[]) => {
    return response as AssetResponse[];
  });
}

export function getWebAsset(
  assetId: string | null,
  user: User,
): Promise<AssetResponse[]> {
  const params = new URLSearchParams({ id: `eq.${assetId || ''}` });

  return callApi(
    'GET',
    `https://api.screenlyapp.com/api/v4/assets/?${params.toString()}`,
    null,
    user.token,
  ).then((response: ApiResponseData[]) => {
    return response as AssetResponse[];
  });
}

export function getTeamInfo(
  user: User,
  teamId: string,
): Promise<TeamResponse[]> {
  const params = new URLSearchParams({ id: `eq.${teamId || ''}` });

  return callApi(
    'GET',
    `https://api.screenlyapp.com/api/v4.1/teams/?${params.toString()}`,
    null,
    user.token,
  ).then((response: ApiResponseData[]) => {
    return response as TeamResponse[];
  });
}

export async function getCompany(user: User): Promise<string> {
  const result = await callApi(
    'GET',
    'https://api.screenlyapp.com/api/v4/users/',
    null,
    user.token,
  ).then((response: ApiResponseData[]) => {
    return response as UserResponse[];
  });

  return result[0].company;
}

export function getAssetDashboardLink(
  assetId: string,
  teamDomain: string,
): string {
  return `https://${teamDomain}.screenlyapp.com/manage/assets/${assetId}`;
}

// URL normalization functions
export function normalizeUrlString(url: string): string {
  return normalizeUrl(url, {
    removeTrailingSlash: false,
    sortQueryParameters: false,
    stripWWW: false,
  });
}

export function simplifyUrl(url: string): string {
  return normalizeUrl(url, {
    removeTrailingSlash: true,
    sortQueryParameters: true,
    stripHash: true,
    stripProtocol: true,
    stripWWW: true,
  });
}
