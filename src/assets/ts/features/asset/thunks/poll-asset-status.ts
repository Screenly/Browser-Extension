import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@/types/store';
import { User } from '@/types/core';
import { getWebAsset } from '@/main';
import { setIsPollingTakingLong } from '@/features/asset/slice';
import { notifyAssetSaveFailure } from '@/features/popup-slice';

const MAX_ASSET_STATUS_POLL_COUNT = 30;
const ASSET_STATUS_POLL_INTERVAL_MS = 1000;

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
