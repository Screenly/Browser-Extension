'use strict';

/// <reference types="@types/chrome" />
/// <reference types="jasmine" />
/* global describe, it, expect */

import { normalizeUrlString, simplifyUrl } from '@/main';

describe('normalizeUrlString', function () {
  const behaviours = [
    ['https://example.com', 'https://example.com'],
    ['https://www.example.com', 'https://www.example.com'],
    ['https://example.com/', 'https://example.com'],
    ['https://example.com//', 'https://example.com'],
    ['https://example.com/hello/', 'https://example.com/hello/'],
    ['https://bob:secret@example.com/a', 'https://example.com/a'],
    [
      'https://www.example.com/a?hat=1&cat=2',
      'https://www.example.com/a?hat=1&cat=2',
    ],
  ];

  for (const behaviour of behaviours) {
    const [k, v] = behaviour;

    it(`for ${k} returns ${v}`, () => {
      expect(normalizeUrlString(k)).toBe(v);
    });
  }
});

describe('simplifyUrl', function () {
  const behaviours = [
    ['https://example.com', 'example.com'],
    ['https://www.example.com', 'example.com'],
    ['https://example.com/', 'example.com'],
    ['https://example.com//', 'example.com'],
    ['https://example.com/hello/', 'example.com/hello'],
    ['https://bob:secret@example.com/a', 'example.com/a'],
    ['https://www.example.com/a?hat=1&cat=2', 'example.com/a?cat=2&hat=1'],
  ];

  for (const behaviour of behaviours) {
    const [k, v] = behaviour;

    it(`for ${k} returns ${v}`, () => {
      expect(simplifyUrl(k)).toBe(v);
    });
  }
});
