const { JSDOM } = require('jsdom');
const React = require('react');
const ReactDOM = require('react-dom');
const { act } = require('@testing-library/react');

// Create a new JSDOM instance
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
});

// Set up the global window and document objects
Object.defineProperty(global, 'window', { value: dom.window });
Object.defineProperty(global, 'document', { value: dom.window.document });
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'node.js',
    language: 'en-US',
  },
});
Object.defineProperty(global, 'HTMLElement', { value: dom.window.HTMLElement });
Object.defineProperty(global, 'XMLHttpRequest', {
  value: dom.window.XMLHttpRequest,
});

// Add any other browser globals you might need
Object.defineProperty(global, 'location', { value: dom.window.location });
Object.defineProperty(global, 'history', { value: dom.window.history });
Object.defineProperty(global, 'localStorage', {
  value: dom.window.localStorage,
});
Object.defineProperty(global, 'sessionStorage', {
  value: dom.window.sessionStorage,
});

// Set up React globals
Object.defineProperty(global, 'React', { value: React });
Object.defineProperty(global, 'ReactDOM', { value: ReactDOM });
Object.defineProperty(global, 'act', { value: act });

// Mock matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {},
    };
  },
});
