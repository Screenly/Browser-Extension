import { ButtonState, ErrorState, ProposalState } from '@/types/core';

export interface AssetState {
  isLoading: boolean;
  assetTitle: string;
  assetUrl: string;
  assetHostname: string;
  buttonState: ButtonState;
  error: ErrorState;
  bypassVerification: boolean;
  saveAuthentication: boolean;
  proposal: ProposalState | null;
  isPollingTakingLong: boolean;
}

export const initialState: AssetState = {
  isLoading: false,
  assetTitle: '',
  assetUrl: '',
  assetHostname: '',
  buttonState: 'add',
  error: {
    show: false,
    message: 'Failed to add or update asset',
  },
  bypassVerification: false,
  saveAuthentication: false,
  proposal: null,
  isPollingTakingLong: false,
};
