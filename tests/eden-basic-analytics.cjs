const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');

const source = fs.readFileSync('eden-center-v2/site-analytics.js', 'utf8');

function run(allowsAnalytics) {
  const calls = [];
  const storage = new Map();
  const context = {
    console,
    URL,
    URLSearchParams,
    crypto: webcrypto,
    globalThis: null,
    location: {
      href: 'https://eden-center.co.il/services.html?utm_source=google&utm_medium=cpc',
      pathname: '/services.html',
      hostname: 'eden-center.co.il',
      search: '?utm_source=google&utm_medium=cpc',
    },
    screen: { width: 390 },
    innerWidth: 390,
    sessionStorage: {
      getItem: key => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    document: {
      title: 'שירותים | מרכז עדן',
      referrer: 'https://www.google.com/search?q=eden',
      visibilityState: 'visible',
      addEventListener: () => {},
    },
    window: { EdenPrivacy: { allowsAnalytics: () => allowsAnalytics } },
    fetch: async (_url, options) => {
      calls.push(JSON.parse(options.body));
      return { ok: true };
    },
    setInterval: () => 1,
    clearInterval: () => {},
    addEventListener: () => {},
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return calls;
}

(async () => {
  const basic = run(false);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(basic.length, 1);
  assert.equal(basic[0].event, 'page_view');
  assert.equal(basic[0].path, '/services.html');
  assert.equal(basic[0].source, 'direct');
  assert.equal(basic[0].referrer, '');
  assert.equal(basic[0].deviceType, 'unknown');
  assert.ok(basic[0].sessionId);
  assert.ok(basic[0].viewId);

  const detailed = run(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(detailed.length, 1);
  assert.equal(detailed[0].source, 'google');
  assert.equal(detailed[0].medium, 'cpc');
  assert.equal(detailed[0].referrer, 'www.google.com');
  assert.equal(detailed[0].deviceType, 'mobile');

  console.log('PASS: basic page views are counted without optional consent, detailed dimensions remain opt-in.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
