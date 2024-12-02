'use strict';

/* global browser */

import {
  assert,
  getUser,
  hideElement,
  setButtonWaitState,
  showElement,
  showPage,
} from "@/main.mjs";

const elements = {
  signedInPage: document.querySelector('#signed-in-page'),
  signInForm: document.querySelector('form.sign-in'),
  signInPage: document.querySelector('#sign-in-page'),
  signInButton: document.querySelector('button#sign-in-submit'),
  signInError: document.querySelector('#sign-in-error'),
  signOutButton: document.querySelector('button#sign-out'),
  signUpLink: document.querySelector('a#sign-up-link'),
};

function reload() {
  location.reload();
}

function submitSignIn(e) {
  e.preventDefault();
  hideElement(elements.signInError);
  setButtonWaitState(elements.signInButton, true);

  const token = document.querySelector('form.sign-in #token').value;

  browser.storage.sync
    .set({
      token: token,
    })
    .then(reload)
    .catch(error => {
      console.error(error);
      showElement(elements.signInError);
      setButtonWaitState(elements.signInButton, false);
    });
}

function signOut() {
  // Kind of unnecessary because sign out is pretty much instant. But just in case Google does something
  // weird.
  setButtonWaitState(elements.signOutButton, true);
  browser.storage.sync.clear().then(reload);
}

export function initOptions() {
  for (let [key, value] of Object.entries(elements)) {
    assert(value, `${key} not found`);
  }

  elements.signInForm.addEventListener('submit', submitSignIn);
  elements.signOutButton.addEventListener('click', signOut);
  elements.signUpLink.href = `https://login.screenlyapp.com/sign-up?next=${window.location.href}`

  getUser().then((user) => {
    if (user.token) {
      showPage(elements.signedInPage);
    } else {
      showPage(elements.signInPage);
    }
  });
}
