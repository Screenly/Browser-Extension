/* global browser */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/types/store';
import { Cookie, User } from '@/types/core';
import { getUser } from '@/main';
import { setIsLoading } from '@/features/asset/slice';
import { openSettings } from '@/features/popup-slice';
import { proposeToAddToScreenly } from '@/features/asset/thunks/propose-to-add-to-screenly';

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
