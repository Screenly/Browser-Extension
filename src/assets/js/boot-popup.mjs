/* global browser */

import ReactDOM from 'react-dom/client';
import React from 'react';
import { useEffect } from 'react';
import {
  Provider,
  useDispatch,
  useSelector,
} from 'react-redux';

import 'bootstrap/scss/bootstrap.scss';
import '@/scss/style.scss';
import '@/scss/sweetalert-icons.scss';

import { PopupSignIn } from '@/components/popup/sign-in.jsx';
import { Success } from '@/components/popup/success.jsx';
import { Proposal } from '@/components/popup/proposal.jsx';

import { store } from '@/store.js';

import {
  setShowSignIn,
  setShowProposal,
} from '@/features/popup/popupSlice.js';

const Popup = () => {
  const dispatch = useDispatch();

  const showSignIn = useSelector((state) => state.popup.showSignIn);
  const showProposal = useSelector((state) => state.popup.showProposal);
  const showSuccess = useSelector((state) => state.popup.showSuccess);

  useEffect(() => {
    browser.storage.sync.get('token').then((result) => {
      if (result.token) {
        dispatch(setShowSignIn(false));
        dispatch(setShowProposal(true));
      }
    });
  }, []);

  return (
    <>
      {showSignIn && <PopupSignIn />}
      {showProposal && <Proposal />}
      {showSuccess && <Success />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <Provider store={store}>
    <Popup />
  </Provider>
);
