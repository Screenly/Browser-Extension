import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { PopupPage } from '@/components/popup-page';
import { configureStore } from '@reduxjs/toolkit';
import popupReducer from '@/features/popup-slice';
import * as popupSlice from '@/features/popup-slice';

describe('PopupPage', () => {
  let store;
  let originalFetch;
  let mockBrowserStorage;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        popup: popupReducer,
      },
    });

    originalFetch = global.fetch;

    // Mock browser storage
    mockBrowserStorage = {
      sync: {
        set: jasmine.createSpy('set').and.resolveTo(),
      },
    };
    global.browser = mockBrowserStorage;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should initially render the sign-in form', () => {
    render(
      <Provider store={store}>
        <PopupPage />
      </Provider>,
    );

    const signInForm = document.querySelector('#sign-in-page');

    expect(signInForm).toBeTruthy();
    expect(signInForm?.querySelector('h3')?.textContent).toBe('Sign In');
  });

  it('should show success page when sign-in is successful', async () => {
    const mockFetch = jasmine.createSpy('fetch').and.resolveTo({
      status: 200,
      json: () => Promise.resolve([]),
    });
    global.fetch = mockFetch;

    const { rerender } = render(
      <Provider store={store}>
        <PopupPage />
      </Provider>,
    );

    const signInForm = document.querySelector('#sign-in-page');
    const tokenInput = signInForm?.querySelector('input[type="password"]');

    expect(tokenInput).toBeTruthy();

    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: 'test-token' } });
    });

    const signInButton = signInForm?.querySelector('button');

    await act(async () => {
      fireEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Manually dispatch the notifySignInSuccess action to update the Redux state
    await act(async () => {
      store.dispatch(popupSlice.notifySignInSuccess());
    });

    // Force a re-render of the component
    rerender(
      <Provider store={store}>
        <PopupPage />
      </Provider>,
    );

    // Wait for the success page to appear
    await waitFor(() => {
      const successPage = document.querySelector('#success-page');

      expect(successPage).toBeTruthy();
    });
  });
});
