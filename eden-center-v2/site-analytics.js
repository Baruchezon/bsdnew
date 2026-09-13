(() => {
  'use strict';

  const endpoint = 'https://eden-center-crm.onrender.com/api/public/site/track';
  const sessionKey = 'edenAnalyticsSession';
  const previousPathKey = 'edenAnalyticsPreviousPath';
  let started = false;

  function uuid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  }

  function currentPath() {
    const url = new URL(location.href);
    if (url.pathname.endsWith('/article.html')) {
      const slug = url.searchParams.get('slug');
      return slug ? `${url.pathname}?slug=${encodeURIComponent(slug)}` : url.pathname;
    }
    return url.pathname || '/';
  }

  function detailedAnalyticsAllowed() {
    return window.EdenPrivacy?.allowsAnalytics?.() === true;
  }

  function traffic() {
    if (!detailedAnalyticsAllowed()) return { source: 'direct', medium: '', campaign: '' };
    const params = new URLSearchParams(location.search);
    const campaignSource = params.get('utm_source');
    let source = campaignSource || 'direct';
    if (!campaignSource && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.hostname !== location.hostname) source = referrer.hostname.slice(0, 80);
      } catch (_) { /* Keep direct source. */ }
    }
    return {
      source,
      medium: (params.get('utm_medium') || '').slice(0, 80),
      campaign: (params.get('utm_campaign') || '').slice(0, 120),
    };
  }

  function safeReferrer() {
    if (!detailedAnalyticsAllowed() || !document.referrer) return '';
    try { return new URL(document.referrer).hostname.slice(0, 180); }
    catch (_) { return ''; }
  }

  function deviceType() {
    if (!detailedAnalyticsAllowed()) return 'unknown';
    const width = Math.min(screen.width || innerWidth, innerWidth || screen.width);
    if (width <= 700) return 'mobile';
    if (width <= 1050) return 'tablet';
    return 'desktop';
  }

  function send(base, event, extra = {}) {
    const detail = traffic();
    fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        ...base,
        referrer: safeReferrer(),
        ...detail,
        deviceType: deviceType(),
        ...extra,
      }),
    }).catch(() => {});
  }

  function begin() {
    if (started) return;
    started = true;

    let sessionId;
    try {
      sessionId = sessionStorage.getItem(sessionKey) || uuid();
      sessionStorage.setItem(sessionKey, sessionId);
    } catch (_) { sessionId = uuid(); }

    const viewId = uuid();
    const path = currentPath();
    let previousPath = '';
    try {
      previousPath = sessionStorage.getItem(previousPathKey) || '';
      sessionStorage.setItem(previousPathKey, path);
    } catch (_) { /* Session storage may be unavailable. */ }

    const base = {
      sessionId,
      viewId,
      path,
      title: (document.title || '').slice(0, 180),
      previousPath,
    };

    let activeSeconds = 0;
    let lastTick = Date.now();
    const countActiveTime = () => {
      const now = Date.now();
      if (document.visibilityState === 'visible') {
        activeSeconds += Math.min(5, Math.max(0, Math.round((now - lastTick) / 1000)));
      }
      lastTick = now;
    };

    // Basic anonymous counting always runs. No name, phone, email, form content,
    // fingerprint or persistent cookie is sent. Detailed dimensions remain opt-in.
    send(base, 'page_view');

    const timer = setInterval(() => {
      countActiveTime();
      send(base, 'heartbeat', { activeSeconds });
    }, 15000);

    document.addEventListener('visibilitychange', countActiveTime);
    document.addEventListener('click', event => {
      if (!detailedAnalyticsAllowed()) return;
      const link = event.target.closest?.('a,button');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
      let interactionType = '';
      if (href.startsWith('tel:')) interactionType = 'phone';
      else if (href.startsWith('mailto:')) interactionType = 'email';
      else if (/wa\.me|whatsapp/i.test(href)) interactionType = 'whatsapp';
      else if (/contact\.html/.test(href)) interactionType = 'contact';
      else if (link.matches('.btn,[data-cta]')) interactionType = 'cta';
      if (interactionType) {
        send(base, 'interaction', { interactionType, target: text || href.slice(0, 120) });
      }
    });

    addEventListener('pagehide', () => {
      clearInterval(timer);
      countActiveTime();
      send(base, 'page_leave', { activeSeconds });
    }, { once: true });
  }

  if (location.pathname.endsWith('/article.html')) {
    addEventListener('edenarticlerendered', begin, { once: true });
    setTimeout(begin, 3000);
  } else {
    begin();
  }
})();