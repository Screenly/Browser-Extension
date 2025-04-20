import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SignInForm } from '@/components/sign-in';
import popupReducer from '@/features/popup-slice';

describe('SignInForm', () => {
  let store;
  let mockBrowserStorage;
  let originalFetch;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        popup: popupReducer,
      },
    });

    mockBrowserStorage = {
      sync: {
        set: jasmine.createSpy('set').and.resolveTo(),
      },
    };
    global.browser = mockBrowserStorage;

    // Save the original fetch function
    originalFetch = global.fetch;
  });

  afterEach(() => {
    // Restore the original fetch function
    global.fetch = originalFetch;
  });

  it('renders the sign-in form correctly', () => {
    render(
      <Provider store={store}>
        <SignInForm />
      </Provider>,
    );

    const headingText = document.querySelector('h3')?.textContent;
    const passwordInput = document.querySelector('input[type="password"]');
    const passwordInputPlaceholder = passwordInput?.getAttribute('placeholder');
    const submitButton = document.querySelector('button[type="submit"]');

    expect(headingText).toBe('Sign In');
    expect(passwordInput).toBeTruthy();
    expect(passwordInputPlaceholder).toBe('Enter token');
    expect(submitButton).toBeTruthy();
  });

  it('should call fetch when the sign in button is clicked', async () => {
    const mockFetch = jasmine.createSpy('fetch').and.resolveTo({
      status: 200,
      json: () => Promise.resolve([]),
    });
    global.fetch = mockFetch;

    render(
      <Provider store={store}>
        <SignInForm />
      </Provider>,
    );

    const tokenInput = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]');

    fireEvent.change(tokenInput, { target: { value: 'test-token' } });

    expect(tokenInput.value).toBe('test-token');

    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const spinner = submitButton?.querySelector('.spinner');
      const label = submitButton?.querySelector('.label');

      expect(spinner).toBeFalsy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe('Sign In');
    });
  });
});
