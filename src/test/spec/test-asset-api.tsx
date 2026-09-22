'use strict';

/// <reference types="@types/chrome" />
/// <reference types="jasmine" />
/* global describe, beforeEach, it, expect, spyOn */

import { createWebAsset, updateWebAsset, getWebAsset } from '@/main';
import { API_BASE_URL, API_VERSION } from '@/constants';
import { User } from '@/types/core';

const user: User = { token: 'test-token' };
const assetId = '01HC9RFEFP1ATEH5ZT5VQMF65P';
const userAgent = 'Mozilla/5.0 (Test) TestBrowser/1.0';

describe('asset API requests', function () {
  let fetchSpy: jasmine.Spy;

  beforeEach(function () {
    fetchSpy = spyOn(globalThis, 'fetch').and.resolveTo({
      status: 200,
      json: () => Promise.resolve([{ id: assetId }]),
    } as Response);
  });

  const requestUrl = (): string => String(fetchSpy.calls.mostRecent().args[0]);

  const requestInit = (): { method: string; body?: string } =>
    fetchSpy.calls.mostRecent().args[1] as { method: string; body?: string };

  const requestBody = (): Record<string, unknown> =>
    JSON.parse(requestInit().body as string);

  describe('createWebAsset', function () {
    beforeEach(async function () {
      await createWebAsset(
        user,
        'https://example.com',
        'My Asset',
        { Cookie: 'session=abc' },
        false,
        userAgent,
      );
    });

    it('posts to the v4.1 assets endpoint', function () {
      expect(requestUrl()).toBe(`${API_BASE_URL}/${API_VERSION}/assets/`);
      expect(requestInit().method).toBe('POST');
    });

    it('sends the browser user agent as user_agent on create', function () {
      expect(requestBody().user_agent).toBe(userAgent);
    });

    it('still sends the pre-existing fields on create', function () {
      expect(requestBody()).toEqual(
        jasmine.objectContaining({
          source_url: 'https://example.com',
          title: 'My Asset',
          headers: { Cookie: 'session=abc' },
          disable_verification: false,
        }),
      );
    });
  });

  describe('updateWebAsset', function () {
    beforeEach(async function () {
      await updateWebAsset(
        assetId,
        user,
        'https://example.com',
        'My Asset',
        {},
        true,
        userAgent,
      );
    });

    it('patches the v4.1 assets endpoint for the given asset', function () {
      const expected = `${API_BASE_URL}/${API_VERSION}/assets/?id=eq.${assetId}`;

      expect(requestUrl()).toBe(expected);
      expect(requestInit().method).toBe('PATCH');
    });

    it('sends the browser user agent as user_agent on update', function () {
      expect(requestBody().user_agent).toBe(userAgent);
    });

    it('still sends the pre-existing fields on update', function () {
      expect(requestBody()).toEqual(
        jasmine.objectContaining({
          title: 'My Asset',
          headers: {},
          disable_verification: true,
        }),
      );
    });
  });

  describe('getWebAsset', function () {
    it('reads from the v4.1 assets endpoint for the given asset', async function () {
      await getWebAsset(assetId, user);
      const expected = `${API_BASE_URL}/${API_VERSION}/assets/?id=eq.${assetId}`;

      expect(requestUrl()).toBe(expected);
      expect(requestInit().method).toBe('GET');
    });
  });

  describe('API_VERSION', function () {
    it('is the first version exposing a writable user_agent column', function () {
      expect(API_VERSION).toBe('v4.1');
    });
  });
});
