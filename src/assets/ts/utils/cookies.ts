import { Cookie } from '@/types/core';

// Cookie values from the browser are already in their on-the-wire form, so
// they must be used verbatim: re-encoding them (e.g. with encodeURIComponent)
// corrupts values containing characters like `=`, `+`, `/`, or `%`.
export function buildCookieHeader(cookieJar: Cookie[]): string {
  return cookieJar
    .map((cookie: Cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

// Domain cookies are stored with a leading dot (e.g. `.example.com`) and
// match the apex domain as well as any subdomain. Host-only cookies must
// match the hostname exactly.
export function filterCookiesByOriginDomain(
  cookieJar: Cookie[],
  originHostname: string,
): Cookie[] {
  return cookieJar.filter((cookie: Cookie) => {
    const cookieDomain = cookie.domain.replace(/^\./, '');

    if (cookie.hostOnly) {
      return originHostname === cookieDomain;
    }

    return (
      originHostname === cookieDomain ||
      originHostname.endsWith(`.${cookieDomain}`)
    );
  });
}
