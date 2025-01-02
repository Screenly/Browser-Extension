import ReactDOM from 'react-dom/client';
import {
  useEffect,
  useState,
} from 'react';
import {
  Provider,
  useDispatch,
  useSelector,
} from 'react-redux';
import 'bootstrap-icons/font/bootstrap-icons.scss';

import '@/scss/style.scss';
import '@/scss/sweetalert-icons.scss';

import { SignInForm } from '@/components/sign-in';
import { Success } from '@/components/success';
import { Proposal } from '@/components/proposal';
import { SignInSuccess } from '@/components/sign-in-success';
import { Settings } from '@/components/settings';

import { store } from '@/store';
import { signIn } from '@/features/popup-slice';
import { RootState } from '@/types';

interface CustomEvent extends Event {
  detail: string;
}

const PopupPage: React.FC = () => {
  const dispatch = useDispatch();

  const {
    showSignIn,
    showProposal,
    showSuccess,
    showSignInSuccess,
    showSettings,
  } = useSelector((state: RootState) => state.popup);

  const [assetDashboardLink, setAssetDashboardLink] = useState<string>('');

  useEffect(() => {
    dispatch(signIn());

    document.addEventListener('set-asset-dashboard-link', ((event: CustomEvent) => {
      setAssetDashboardLink(event.detail);
    }) as EventListener);
  }, []);

  return (
    <>
      {showSignIn && <SignInForm />}
      {showProposal && <Proposal />}
      {showSuccess && <Success assetDashboardLink={assetDashboardLink} />}
      {showSignInSuccess && <SignInSuccess />}
      {showSettings && <Settings />}
    </>
  );
};

const container = document.getElementById('app');
if (!container) throw new Error('Failed to find the app element');

const root = ReactDOM.createRoot(container);
root.render(
  <Provider store={store}>
    <PopupPage />
  </Provider>
);