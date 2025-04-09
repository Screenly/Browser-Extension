import { AssetState } from '@/features/asset-slice';
import { PopupState } from '@/features/popup-slice';

export interface RootState {
  asset: AssetState;
  popup: PopupState;
}
