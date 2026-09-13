(() => {
  'use strict';

  const endpoint = 'https://eden-center-crm.onrender.com/api/public/site/track';
  const sessionKey = 'edenAnalyticsSession';
  const previousPathKey = 'edenAnalyticsPreviousPath';
  let started = false;

  function uuid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
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

  function traffic() {
    const params = new URLSearchParams(location.search);
    const campaignSource = params.get('utm_source');
    let source = campaignSource || 'direct';
    if (!campaignSource && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.hostname !== location.hostname) source = referrer.hostname;
      } catch (_) { /* Keep direct source. */ }
    }
    return {
      source,
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
    };
  }

  function safeReferrer() {
    if (!document.referrer) return '';
    try { return new URL(document.referrer).hostname.slice(0, 180); }
    catch (_) { return ''; }
  }

  function deviceType() {
    const width = Math.min(screen.width || innerWidth, innerWidth || screen.width);
    if (width <= 700) return 'mobile';
    if (width <= 1050) return 'tablet';
    return 'desktop';
  }

  function send(payload) {
    fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  function begin() {
    if (started || !window.EdenPrivacy?.allowsAnalytics?.()) return;
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
    const common = {
      sessionId,
      viewId,
      path,
      title: document.title.slice(0, 180),
      previousPath,
      referrer: safeReferrer(),
      ...traffic(),
      deviceType: deviceType(),
    };
    let activeSeconds = 0;
    let lastTick = Date.now();
    const countActiveTime = () => {
      const now = Date.now();
      if (document.visibilityState === 'visible') activeSeconds += Math.min(5, Math.max(0, Math.round((now - lastTick) / 1000)));
      lastTick = now;
    };

    send({ event: 'page_view', ...common });
    const timer = setInterval(() => {
      countActiveTime();
      send({ event: 'heartbeat', ...common, activeSeconds });
    }, 15000);

    document.addEventListener('visibilitychange', countActiveTime);
    document.addEventListener('click', event => {
      const link = event.target.closest('a,button');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
      let interactionType = '';
      if (href.startsWith('tel:')) interactionType = 'phone';
      else if (href.startsWith('mailto:')) interactionType = 'email';
      else if (/wa\.me|whatsapp/i.test(href)) interactionType = 'whatsapp';
      else if (/contact\.html/.test(href)) interactionType = 'contact';
      else if (link.matches('.btn,[data-cta]')) interactionType = 'cta';
      if (interactionType) send({ event: 'interaction', ...common, interactionType, target: text || href.slice(0, 120) });
    });
    addEventListener('pagehide', () => {
      clearInterval(timer);
      countActiveTime();
      send({ event: 'page_leave', ...common, activeSeconds });
    }, { once: true });
  }

  if (location.pathname.endsWith('/article.html')) {
    addEventListener('edenarticlerendered', begin, { once: true });
    setTimeout(begin, 3000);
  } else begin();
})();
