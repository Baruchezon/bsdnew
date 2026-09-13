/* Only presentation preferences are optional. No analytics or advertising is installed. */
(() => {
  'use strict';
  const key = 'edenPrivacyChoice';
  const version = '2026-09-13';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let choice = null;
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && value.version === version && typeof value.preferences === 'boolean' &&
        Number.isFinite(value.savedAt) && value.savedAt <= Date.now() && Date.now() - value.savedAt < lifetime) choice = value;
    else localStorage.removeItem(key);
  } catch (_) { /* Storage may be blocked; default to necessary only. */ }
  function clearOptional() { try { sessionStorage.removeItem('edenThoughtIndex'); } catch (_) {} }
  if (!choice?.preferences) clearOptional();
  window.EdenPrivacy = { allowsPreferences: () => choice?.preferences === true };
  function setup() {
    const panel = document.createElement('aside');
    panel.className = 'privacy-banner';
    panel.setAttribute('aria-label', 'העדפות פרטיות ועוגיות');
    panel.innerHTML = '<p><strong>הפרטיות שלכם חשובה לנו</strong> אנחנו שומרים את בחירת הפרטיות במכשיר. ברשותכם, נזכור גם איזה משפט פתיחה הוצג במהלך הביקור. אין כאן כלי פרסום או מדידת קהל.</p><div class="privacy-actions"><button type="button" data-choice="necessary">רק הכרחי</button><button type="button" data-choice="preferences">אישור התאמה אישית</button><a href="cookies.html">פרטים על עוגיות ואחסון</a></div><p class="privacy-storage-note" hidden></p>';
    panel.hidden = !!choice;
    document.body.append(panel);
    let opener = null;
    function reserveSpace() {
      document.body.classList.toggle('privacy-open', !panel.hidden);
      document.body.style.setProperty('--privacy-space', panel.hidden ? '0px' : `${panel.getBoundingClientRect().height + 20}px`);
    }
    function close() { panel.hidden = true; reserveSpace(); if (opener) opener.focus({ preventScroll: true }); else document.getElementById('main-content')?.focus({ preventScroll: true }); }
    panel.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
      choice = { version, preferences: button.dataset.choice === 'preferences', savedAt: Date.now() };
      try { localStorage.setItem(key, JSON.stringify(choice)); } catch (_) { /* Choice remains valid for this page only. */ }
      if (!choice.preferences) clearOptional();
      window.dispatchEvent(new CustomEvent('edenprivacychange'));
      close();
    }));
    document.querySelectorAll('[data-privacy-settings]').forEach(button => button.addEventListener('click', () => {
      opener = button;
      panel.hidden = false;
      reserveSpace();
      panel.querySelector('[data-choice]').focus();
    }));
    panel.addEventListener('keydown', event => { if (event.key === 'Escape' && choice) close(); });
    if ('ResizeObserver' in window) new ResizeObserver(reserveSpace).observe(panel);
    reserveSpace();
    const skip = document.querySelector('.skip-link');
    skip?.addEventListener('click', () => document.getElementById('main-content')?.focus());
    const menu = document.querySelector('.menu');
    const button = document.querySelector('.mobileBtn');
    if (menu && button) {
      menu.id = menu.id || 'primary-menu';
      button.setAttribute('aria-controls', menu.id);
      button.setAttribute('aria-expanded', String(menu.classList.contains('open')));
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menu.classList.contains('open')) {
          menu.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.focus();
        }
      });
    }
    document.querySelectorAll('.menu a.active').forEach(a => a.setAttribute('aria-current', 'page'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
