// Public images only. No CRM credentials or patient data are used here.
(() => {
  const api = 'https://eden-center-crm.onrender.com/api/settings/site-image/';
  const version = Date.now();
  const requests = new Map();

  function load(slot) {
    if (!requests.has(slot)) {
      requests.set(slot, new Promise((resolve, reject) => {
        const image = new Image();
        const finish = (error) => {
          clearTimeout(timer);
          image.onload = null;
          image.onerror = null;
          if (error) { image.src = ''; reject(error); }
          else resolve(image);
        };
        const timer = setTimeout(() => finish(new Error('image timeout')), 20000);
        image.onload = () => finish(image.naturalWidth && image.naturalHeight ? null : new Error('invalid image'));
        image.onerror = () => finish(new Error('image unavailable'));
        image.src = `${api}${encodeURIComponent(slot)}?v=${version}`;
      }));
    }
    return requests.get(slot);
  }

  document.querySelectorAll('[data-site-image]').forEach((container) => {
    const slot = container.dataset.siteImage;
    load(slot).then((loaded) => {
      const image = document.createElement('img');
      image.src = loaded.src;
      image.alt = container.getAttribute('aria-label') || container.querySelector('img')?.alt || '';
      image.width = loaded.naturalWidth;
      image.height = loaded.naturalHeight;
      image.decoding = 'async';
      container.replaceChildren(image);
      container.classList.add('managed-site-image');
      container.hidden = false;
    }).catch(() => {
      // No configured image, timeout or outage: preserve the original picture.
    });
  });
})();
