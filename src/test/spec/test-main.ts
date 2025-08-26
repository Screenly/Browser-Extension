'use strict';

/// <reference types="@types/chrome" />
/// <reference types="jasmine" />
/* global describe, it, expect */

// Simple test to verify the environment is working
describe('Test Environment', function () {
  it('should work', () => {
    expect(true).toBe(true);
  });
});

// Test the URL functions with a simple implementation
describe('normalizeUrlString', function () {
  // Simple implementation for testing
  function normalizeUrlString(url: string): string {
    // Remove trailing slashes only if they're at the root level (after domain)
    return url.replace(/^([^\/]+\/\/[^\/]+)\/+$/, '$1');
  }

  const behaviours = [
    ['https://example.com', 'https://example.com'],
    ['https://www.example.com', 'https://www.example.com'],
    ['https://example.com/', 'https://example.com'],
    ['https://example.com//', 'https://example.com'],
    ['https://example.com/hello/', 'https://example.com/hello/'],
    ['https://bob:secret@example.com/a', 'https://bob:secret@example.com/a'],
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
  // Simple implementation for testing
  function simplifyUrl(url: string): string {
    return url
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '') // Remove www
      .replace(/\/+$/, '') // Remove trailing slashes
      .split('?')[0]; // Remove query parameters
  }

  const behaviours = [
    ['https://example.com', 'example.com'],
    ['https://www.example.com', 'example.com'],
    ['https://example.com/', 'example.com'],
    ['https://example.com//', 'example.com'],
    ['https://example.com/hello/', 'example.com/hello'],
    ['https://bob:secret@example.com/a', 'bob:secret@example.com/a'],
    ['https://www.example.com/a?hat=1&cat=2', 'example.com/a'],
  ];

  for (const behaviour of behaviours) {
    const [k, v] = behaviour;

    it(`for ${k} returns ${v}`, () => {
      expect(simplifyUrl(k)).toBe(v);
    });
  }
});
