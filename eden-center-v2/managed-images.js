// Public images only. No CRM credentials or patient data are used here.
(() => {
  const api = 'https://eden-center-crm.onrender.com/api/settings/site-image/';
  const requests = new Map();

  function load(slot, priority = 'low') {
    if (!requests.has(slot)) {
      requests.set(slot, new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = priority;
        const finish = (error) => {
          clearTimeout(timer);
          image.onload = null;
          image.onerror = null;
          if (error) {
            image.src = '';
            requests.delete(slot);
            reject(error);
          } else {
            resolve(image);
          }
        };
        const timer = setTimeout(() => finish(new Error('image timeout')), 20000);
        image.onload = () => finish(image.naturalWidth && image.naturalHeight ? null : new Error('invalid image'));
        image.onerror = () => finish(new Error('image unavailable'));
        image.src = api + encodeURIComponent(slot);
      }));
    }
    return requests.get(slot);
  }

  function hydrate(container) {
    if (container.dataset.siteImageLoading === '1') return;
    const slot = container.dataset.siteImage;
    if (!slot) return;
    container.dataset.siteImageLoading = '1';
    const rect = container.getBoundingClientRect();
    const priority = rect.top <= window.innerHeight + 120 ? 'high' : 'low';

    load(slot, priority).then((loaded) => {
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
      container.dataset.siteImageLoading = '0';
      // Preserve the original picture if the managed image is unavailable.
    });
  }

  const containers = [...document.querySelectorAll('[data-site-image]')];
  if (!containers.length) return;

  if (!('IntersectionObserver' in window)) {
    containers.forEach(hydrate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      hydrate(entry.target);
    });
  }, { rootMargin: '700px 0px' });

  containers.forEach((container) => {
    const rect = container.getBoundingClientRect();
    if (container.hidden || rect.top <= window.innerHeight + 700) hydrate(container);
    else observer.observe(container);
  });
})();
