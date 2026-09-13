(() => {
  'use strict';
  const apiBase = 'https://eden-center-crm.onrender.com';
  const feedUrl = `${apiBase}/api/public/site/articles`;

  function imageUrl(value) {
    if (!value) return '';
    return value.startsWith('http') ? value : `${apiBase}${value}`;
  }

  function create(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderBody(container, body) {
    let list = null;
    String(body || '').split(/\n+/).forEach(rawLine => {
      const line = rawLine.trim();
      if (!line) return;
      if (/^[-•] /.test(line)) {
        if (!list) { list = document.createElement('ul'); container.append(list); }
        list.append(create('li', '', line.slice(2)));
        return;
      }
      list = null;
      if (line.startsWith('### ')) container.append(create('h3', '', line.slice(4)));
      else if (line.startsWith('## ')) container.append(create('h2', '', line.slice(3)));
      else container.append(create('p', '', line));
    });
  }

  async function renderKnowledge() {
    const container = document.querySelector('[data-articles-list]');
    if (!container) return;
    try {
      const response = await fetch(feedUrl, { credentials: 'omit' });
      if (!response.ok) throw new Error('feed');
      const data = await response.json();
      container.replaceChildren();
      if (!data.items?.length) {
        container.append(create('div', 'knowledge-empty', 'מאמרים מקצועיים חדשים יעלו כאן בקרוב.'));
        return;
      }
      data.items.forEach(article => {
        const card = create('article', 'article knowledge-card');
        if (article.image_url) {
          const image = document.createElement('img');
          image.src = imageUrl(article.image_url);
          image.alt = article.image_alt || article.title;
          image.loading = 'lazy';
          card.append(image);
        }
        card.append(create('span', 'tag', article.category || 'מרכז ידע'));
        card.append(create('h2', '', article.title));
        card.append(create('p', '', article.excerpt || 'לקריאת המאמר המלא'));
        const link = create('a', 'cardLink', 'למאמר המלא ←');
        link.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
        link.setAttribute('aria-label', `לקריאת המאמר ${article.title}`);
        card.append(link);
        container.append(card);
      });
    } catch (_) {
      container.replaceChildren(create('div', 'knowledge-empty', 'לא הצלחנו לטעון את המאמרים כרגע. אפשר לנסות שוב בעוד זמן קצר.'));
    }
  }

  async function renderArticle() {
    const root = document.querySelector('[data-article-page]');
    if (!root) return;
    const slug = new URLSearchParams(location.search).get('slug') || '';
    if (!/^[a-z0-9-]{2,100}$/.test(slug)) {
      root.replaceChildren(create('p', 'knowledge-empty', 'כתובת המאמר אינה תקינה.'));
      return;
    }
    try {
      const response = await fetch(`${feedUrl}/${encodeURIComponent(slug)}`, { credentials: 'omit' });
      if (!response.ok) throw new Error('article');
      const article = await response.json();
      const canonical = `https://eden-center.co.il/article.html?slug=${encodeURIComponent(slug)}`;
      document.title = article.seo_title || `${article.title} | מרכז עדן`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', article.seo_description || article.excerpt || 'מאמר מקצועי ממרכז עדן');
      document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index,follow,max-image-preview:large');
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
      root.replaceChildren();
      if (article.image_url) {
        const image = document.createElement('img');
        image.className = 'article-hero-image';
        image.src = imageUrl(article.image_url);
        image.alt = article.image_alt || article.title;
        root.append(image);
      }
      root.append(create('span', 'tag', article.category || 'מרכז ידע'));
      root.append(create('h1', 'title', article.title));
      if (article.excerpt) root.append(create('p', 'article-lead', article.excerpt));
      const body = create('div', 'article-body');
      renderBody(body, article.body);
      root.append(body);
      const cta = create('aside', 'article-cta');
      cta.append(create('h2', '', 'רוצים לבדוק מה מתאים לכם'));
      cta.append(create('p', '', 'צוות מרכז עדן ישמח להכיר את הצורך ולכוון אתכם למסגרת המתאימה.'));
      const link = create('a', 'btn', 'לשיחת התאמה');
      link.href = 'contact.html';
      cta.append(link);
      root.append(cta);
      const schema = document.querySelector('[data-article-schema]');
      if (schema) schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.seo_description || article.excerpt,
        image: article.image_url ? [imageUrl(article.image_url)] : undefined,
        datePublished: article.published_at,
        dateModified: article.updated_at,
        author: { '@type': 'Organization', name: 'מרכז עדן' },
        publisher: { '@type': 'Organization', name: 'מרכז עדן' },
        mainEntityOfPage: canonical,
      });
      dispatchEvent(new CustomEvent('edenarticlerendered'));
    } catch (_) {
      root.replaceChildren(create('p', 'knowledge-empty', 'המאמר אינו זמין כרגע או שטרם פורסם.'));
      dispatchEvent(new CustomEvent('edenarticlerendered'));
    }
  }

  renderKnowledge();
  renderArticle();
})();
