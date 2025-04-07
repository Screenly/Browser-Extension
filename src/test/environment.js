const { JSDOM } = require('jsdom');

// Create a new JSDOM instance
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  runScripts: 'dangerously',
});

// Set up the global window and document objects
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.XMLHttpRequest = dom.window.XMLHttpRequest;

// Add any other browser globals you might need
global.location = dom.window.location;
global.history = dom.window.history;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;

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
