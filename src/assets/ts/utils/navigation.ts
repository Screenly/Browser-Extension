import { goToProposal } from '@/features/popup-slice';
import { AppDispatch } from '@/store';

export const navigateToProposal = (dispatch: AppDispatch): void => {
  dispatch(goToProposal());
};
