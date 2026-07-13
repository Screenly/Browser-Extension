'use strict';

/// <reference types="jasmine" />
/* global describe, it, expect */

import {
  buildCookieHeader,
  filterCookiesByOriginDomain,
} from '@/utils/cookies';
import { Cookie } from '@/types/core';

const makeCookie = (
  name: string,
  value: string,
  domain = 'example.com',
  hostOnly = false,
): Cookie => ({ name, value, domain, hostOnly });

describe('buildCookieHeader', function () {
  it('joins cookies with a semicolon and space', () => {
    const jar = [makeCookie('a', '1'), makeCookie('b', '2')];

    expect(buildCookieHeader(jar)).toBe('a=1; b=2');
  });

  it('returns an empty string for an empty jar', () => {
    expect(buildCookieHeader([])).toBe('');
  });

  const verbatimValues = [
    'dG9rZW4=',
    'a+b/c==',
    'value%3Dalready%2Fencoded',
    'left=right',
  ];

  for (const value of verbatimValues) {
    it(`keeps ${value} verbatim without re-encoding`, () => {
      const jar = [makeCookie('session', value)];

      expect(buildCookieHeader(jar)).toBe(`session=${value}`);
    });
  }
});

describe('filterCookiesByOriginDomain', function () {
  const behaviours: [string, Cookie, string, boolean][] = [
    [
      'keeps a host-only cookie on the exact hostname',
      makeCookie('a', '1', 'app.example.com', true),
      'app.example.com',
      true,
    ],
    [
      'drops a host-only cookie from a sibling subdomain',
      makeCookie('a', '1', 'id.example.com', true),
      'app.example.com',
      false,
    ],
    [
      'keeps a domain cookie on a subdomain',
      makeCookie('a', '1', '.example.com'),
      'app.example.com',
      true,
    ],
    [
      'keeps a domain cookie on the apex domain',
      makeCookie('a', '1', '.example.com'),
      'example.com',
      true,
    ],
    [
      'keeps a domain cookie stored without a leading dot',
      makeCookie('a', '1', 'example.com'),
      'app.example.com',
      true,
    ],
    [
      'drops a domain cookie from an unrelated domain',
      makeCookie('a', '1', '.other.com'),
      'app.example.com',
      false,
    ],
    [
      'drops a cookie whose domain is only a suffix of the hostname',
      makeCookie('a', '1', '.example.com'),
      'evilexample.com',
      false,
    ],
  ];

  for (const [description, cookie, originHostname, kept] of behaviours) {
    it(description, () => {
      const result = filterCookiesByOriginDomain([cookie], originHostname);

      expect(result.length).toBe(kept ? 1 : 0);
    });
  }
});
