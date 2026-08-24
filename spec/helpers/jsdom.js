import { JSDOM } from 'jsdom';

const dom = new JSDOM('<html><body></body></html>', {
  url: 'http://localhost/',
});
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
