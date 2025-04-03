'use strict';

/// <reference types="@types/chrome" />
/* global browser */
declare const global: typeof globalThis;

import { State, SavedAssetState, BrowserStorageState } from '@/main';

type BrowserMock = {
  storage: {
    sync: {
      set: () => void;
      get: () => void;
      remove: () => void;
    };
  };
};

describe('State.normalizeUrl', function () {
  const behaviours = [
    ['https://example.com', 'https://example.com'],
    ['https://www.example.com', 'https://www.example.com'],
    ['https://example.com/', 'https://example.com'],
    ['https://example.com//', 'https://example.com'],
    ['https://example.com/hello/', 'https://example.com/hello/'],
    ['https://bob:secret@example.com/a', 'https://example.com/a'],
    [
      'https://www.example.com/a?hat=1&cat=2',
      'https://www.example.com/a?hat=1&cat=2',
    ],
  ];

  for (const behaviour of behaviours) {
    const [k, v] = behaviour;

    it(`for ${k} returns ${v}`, () => {
      expect(State.normalizeUrl(k)).toBe(v);
    });
  }
});

describe('State.simplifyUrl', function () {
  const behaviours = [
    ['https://example.com', 'example.com'],
    ['https://www.example.com', 'example.com'],
    ['https://example.com/', 'example.com'],
    ['https://example.com//', 'example.com'],
    ['https://example.com/hello/', 'example.com/hello'],
    ['https://bob:secret@example.com/a', 'example.com/a'],
    ['https://www.example.com/a?hat=1&cat=2', 'example.com/a?cat=2&hat=1'],
  ];

  for (const behaviour of behaviours) {
    const [k, v] = behaviour;

    it(`for ${k} returns ${v}`, () => {
      expect(State.simplifyUrl(k)).toBe(v);
    });
  }
});

class StateMocker {
  private fakeStorage: Record<string, SavedAssetState | undefined>;
  private nextFailure: string | null;

  constructor() {
    this.fakeStorage = {};
    this.nextFailure = null;

    // Check if we're in a browser environment
    if (typeof browser === 'undefined') {
      // If we're in Node.js for testing, we don't have `browser` nor `chrome`. Stub it out.
      (global as unknown as { browser: BrowserMock }).browser = {
        storage: {
          sync: {
            set: (): void => {},
            get: (): void => {},
            remove: (): void => {},
          },
        },
      };
    }

    /* eslint-disable jasmine/no-unsafe-spy */

    spyOn(browser.storage.sync, 'set').and.callFake(
      (d: BrowserStorageState) => {
        if (this.nextFailure) {
          const theFailure = this.nextFailure;
          this.nextFailure = null;
          if (theFailure.includes('QUOTA_BYTES')) {
            // Clear storage when quota is exceeded
            this.fakeStorage = {};
            // Only save the new state if it's not null
            if (d.state) {
              // Set only the new state
              for (const [key, value] of Object.entries(d.state)) {
                this.fakeStorage[key] = value;
              }
            }
          }
          return Promise.reject(new Error(theFailure));
        }

        for (const [key, value] of Object.entries(d.state)) {
          this.fakeStorage[key] = value;
        }
        return Promise.resolve();
      },
    );

    spyOn(browser.storage.sync, 'get').and.callFake(
      (keys: string | string[]) => {
        if (typeof keys === 'string') {
          if (keys === 'state') {
            return Promise.resolve({ state: this.fakeStorage });
          }
          return Promise.resolve({ [keys]: this.fakeStorage[keys] });
        }

        if (Array.isArray(keys)) {
          const r: Record<string, unknown> = {};
          for (const key of keys) {
            if (key === 'state') {
              r[key] = this.fakeStorage;
            } else {
              r[key] = this.fakeStorage[key];
            }
          }
          return Promise.resolve(r);
        }

        throw new Error('Unimplemented');
      },
    );

    spyOn(browser.storage.sync, 'remove').and.callFake(
      (keys: string | string[]) => {
        if (typeof keys === 'string') {
          if (keys === 'state') {
            this.fakeStorage = {};
          } else {
            delete this.fakeStorage[keys];
          }
          return Promise.resolve();
        }

        if (Array.isArray(keys)) {
          for (const key of keys) {
            if (key === 'state') {
              this.fakeStorage = {};
            } else {
              delete this.fakeStorage[key];
            }
          }
          return Promise.resolve();
        }

        throw new Error('Unimplemented');
      },
    );

    /* eslint-enable jasmine/no-unsafe-spy */
  }

  setNextFailure(aFailure: string): void {
    this.nextFailure = aFailure;
  }
}

describe('State', function () {
  it('save asset from empty starting point should work', async () => {
    new StateMocker();

    await State.setSavedAssetState('https://example.com', 'abc', true, false);
    const r = await State.getSavedAssetState('https://example.com');

    expect(r).toEqual({
      assetId: 'abc',
      withCookies: true,
      withBypass: false,
    });
  });

  it('save asset over existing state should overwrite', async () => {
    new StateMocker();

    await State.setSavedAssetState('https://example.com', 'abc', true, false);
    await State.setSavedAssetState('https://example.com', 'def', false, true);
    const r = await State.getSavedAssetState('https://example.com');

    expect(r).toEqual({
      assetId: 'def',
      withCookies: false,
      withBypass: true,
    });
  });

  it('save asset with equivalent url should overwrite', async () => {
    new StateMocker();

    await State.setSavedAssetState('https://example.com', 'abc', true, false);
    await State.setSavedAssetState('https://example.com/', 'def', false, true);
    const r = await State.getSavedAssetState('https://example.com');

    expect(r).toEqual({
      assetId: 'def',
      withCookies: false,
      withBypass: true,
    });
  });

  it('get asset for equivalent url should get equivalent', async () => {
    new StateMocker();

    await State.setSavedAssetState(
      'https://example.com/?a=0&b=1#banana',
      'abc',
      true,
      false,
    );
    const r = await State.getSavedAssetState('https://example.com/?b=1&a=0');

    expect(r).toEqual({
      assetId: 'abc',
      withCookies: true,
      withBypass: false,
    });
  });

  it('save asset with null should clear save', async () => {
    new StateMocker();

    await State.setSavedAssetState('https://example.com', 'abc', true, false);
    await State.setSavedAssetState('https://example.com', null, false, true);
    const r = await State.getSavedAssetState('https://example.com');

    expect(r).toBeUndefined();
  });

  it('save asset when out of storage space should clear all and save last one', async () => {
    const stateMocker = new StateMocker();

    await State.setSavedAssetState('https://example.com', 'abc', true, false);
    stateMocker.setNextFailure('QUOTA_BYTES quota exceeded');
    await State.setSavedAssetState('https://example.com/2', 'def', false, true);

    const r = await State.getSavedAssetState('https://example.com');

    expect(r).toBeUndefined();

    const r2 = await State.getSavedAssetState('https://example.com/2');

    expect(r2).toEqual({
      assetId: 'def',
      withCookies: false,
      withBypass: true,
    });
  });
});
