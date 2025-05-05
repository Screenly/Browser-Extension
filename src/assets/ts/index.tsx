import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import 'bootstrap-icons/font/bootstrap-icons.scss';
import '@/scss/style.scss';

import { PopupPage } from '@/components/popup-page';
import { store } from '@/store';

const container = document.getElementById('app');
if (!container) throw new Error('Failed to find the app element');

const root = ReactDOM.createRoot(container);
root.render(
  <Provider store={store}>
    <PopupPage />
  </Provider>,
);
