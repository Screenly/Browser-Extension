/* global EventListener */
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import 'bootstrap-icons/font/bootstrap-icons.scss';

import '@/scss/style.scss';

import { SignInForm } from '@/components/sign-in';
import { AssetSaveSuccess } from '@/components/asset-save-success';
import { AssetSaveFailure } from '@/components/asset-save-failure';
import { Proposal } from '@/components/proposal';
import { SignInSuccess } from '@/components/sign-in-success';
import { Settings } from '@/components/settings';

import { store } from '@/store';
import { signIn } from '@/features/popup-slice';
import { RootState, AppDispatch } from '@/store';
import { CustomEvent } from '@/types/core';

const PopupPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    showSignIn,
    showProposal,
    showSuccess,
    showSignInSuccess,
    showSettings,
    showAssetSaveFailure,
  } = useSelector((state: RootState) => state.popup);

  const [assetDashboardLink, setAssetDashboardLink] = useState<string>('');

  useEffect(() => {
    dispatch(signIn());

    const handleAssetDashboardLink = ((event: CustomEvent) => {
      setAssetDashboardLink(event.detail);
    }) as EventListener;

    document.addEventListener(
      'set-asset-dashboard-link',
      handleAssetDashboardLink,
    );

    return (): void => {
      document.removeEventListener(
        'set-asset-dashboard-link',
        handleAssetDashboardLink,
      );
    };
  }, []);

  return (
    <>
      {showSignIn && <SignInForm />}
      {showProposal && <Proposal />}
      {showSuccess && (
        <AssetSaveSuccess assetDashboardLink={assetDashboardLink} />
      )}
      {showSignInSuccess && <SignInSuccess />}
      {showSettings && <Settings />}
      {showAssetSaveFailure && <AssetSaveFailure />}
    </>
  );
};

const container = document.getElementById('app');
if (!container) throw new Error('Failed to find the app element');

const root = ReactDOM.createRoot(container);
root.render(
  <Provider store={store}>
    <PopupPage />
  </Provider>,
);
