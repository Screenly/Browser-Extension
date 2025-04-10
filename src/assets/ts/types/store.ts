import { AssetState } from '@/features/asset';
import { PopupState } from '@/features/popup-slice';
import { store } from '@/store';

export interface RootState {
  asset: AssetState;
  popup: PopupState;
}

export type AppDispatch = typeof store.dispatch;
