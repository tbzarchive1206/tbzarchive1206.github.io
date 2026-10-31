/* No dependencies. Works in static pages, hash routes, and standalone mode. */
(() => {
  'use strict';
  if (document.getElementById('tbz-mobile-nav')) return;
  const home = 'https://tbzarchive.com/';
  const schedule = 'https://tbzarchive.com/schedule-archive/';
  // history.length may include an empty browser tab. Mark real page entries so
  // a direct standalone launch falls back to Home instead of opening a blank.
  const stateKey = '__tbzMobileNavigationV1';
  const nativePush = window.history.pushState.bind(window.history);
  const nativeReplace = window.history.replaceState.bind(window.history);
  let canGoBack = window.history.state?.[stateKey]?.back ?? Boolean(document.referrer && window.history.length > 1);
  const withNavigation = (state, back) => ({ ...(state || {}), [stateKey]: { back } });
  nativeReplace(withNavigation(window.history.state, canGoBack), '');
  window.history.pushState = function (state, title, url) {
    const result = nativePush(withNavigation(state, true), title, url);
    canGoBack = true;
    return result;
  };
  window.history.replaceState = function (state, title, url) {
    return nativeReplace(withNavigation(state, canGoBack), title, url);
  };
  function trackEntry() {
    const marker = window.history.state?.[stateKey];
    canGoBack = marker ? marker.back : true;
    if (!marker) nativeReplace(withNavigation(window.history.state, canGoBack), '');
  }
  window.addEventListener('popstate', trackEntry);
  window.addEventListener('hashchange', trackEntry);
  const nav = document.createElement('nav');
  nav.id = 'tbz-mobile-nav';
  nav.setAttribute('aria-label', 'Mobile navigation');
  const icon = paths => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
  nav.innerHTML = `<button type="button" aria-label="Go back" title="Go back">${icon('<path d="m12 5-7 7 7 7M5 12h14"/>')}</button><a href="${home}" aria-label="Home — THE BOYZ Archive" title="Home">${icon('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-8H9v8H4a1 1 0 0 1-1-1Z"/>')}</a><a href="${schedule}" aria-label="Schedule Archive" title="Schedule Archive">${icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2M8 18h2"/>')}</a>`;
  nav.querySelector('button').addEventListener('click', () => {
    if (canGoBack && window.history.length > 1) window.history.back();
    else window.location.assign(home);
  });
  const spacer = document.createElement('div');
  spacer.id = 'tbz-mobile-nav-space';
  spacer.setAttribute('aria-hidden', 'true');
  document.body.append(spacer, nav);
  // React may insert headers/footers after this deferred script has run.
  function markHomeLinks() {
    document.querySelectorAll('header a[href], footer a[href], .utility a[href], .topbar a[href]').forEach(link => {
      if (nav.contains(link) || link.classList.contains('tbz-mobile-home-link')) return;
      const url = new URL(link.getAttribute('href'), document.baseURI);
      const isHome = (url.origin === new URL(home).origin && /^\/(?:index\.html)?$/.test(url.pathname)) ||
        (url.hostname === 'tbzarchive1206.github.io' && /^\/(?:tbzarchive\/?)?(?:index\.html)?$/.test(url.pathname));
      const explicitLabel = link.matches('[data-i18n="mainArchive"], [data-i18n="mainPage"]') ||
        link.querySelector('[data-i18n="mainArchive"], [data-i18n="mainPage"]');
      if (!isHome && !explicitLabel) return;
      // Keep local fragment navigation, e.g. TBZ/#top and a gallery's #home.
      if (link.getAttribute('href').startsWith('#')) return;
      link.classList.add('tbz-mobile-home-link');
      const separator = link.nextElementSibling;
      if (separator && separator.tagName === 'SPAN' && separator.textContent.trim() === '/') separator.classList.add('tbz-mobile-home-separator');
    });
  }
  markHomeLinks();
  document.documentElement.classList.add('tbz-mobile-nav-ready');
  const observer = new MutationObserver(markHomeLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();
