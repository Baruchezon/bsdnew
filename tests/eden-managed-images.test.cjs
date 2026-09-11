const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '../eden-center-v2');
const source = fs.readFileSync(path.join(root, 'managed-images.js'), 'utf8');
async function run(outcome, slots = ['about']) {
  let loads = 0;
  const containers = slots.map(slot => ({ dataset: { siteImage: slot }, hidden: true, children: ['original'], classes: [],
    getAttribute: () => 'original alt', querySelector: () => null,
    replaceChildren(image) { this.children = [image]; },
    classList: { add(name) { this.owner.classes.push(name); } },
  }));
  containers.forEach(c => c.classList.owner = c);
  class Image {
    set src(value) { this._src = value; if (!value) return; loads++; this.naturalWidth = 1200; this.naturalHeight = 1800;
      if (outcome === 'success') queueMicrotask(() => this.onload?.());
      if (outcome === 'error') queueMicrotask(() => this.onerror?.());
    }
    get src() { return this._src; }
  }
  vm.runInNewContext(source, { Image, document: { querySelectorAll: () => containers, createElement: () => ({}) }, encodeURIComponent, Map, Date, Error, setTimeout: cb => setTimeout(cb, 10), clearTimeout });
  await new Promise(resolve => setTimeout(resolve, 25));
  return { containers, loads };
}
test('shows a full portrait only after it has loaded; reuses one request per slot', async () => {
  const { containers, loads } = await run('success', ['about', 'about']); assert.equal(loads, 1);
  for (const c of containers) {
    assert.equal(c.hidden, false); assert.equal(c.children[0].width, 1200); assert.equal(c.children[0].height, 1800);
    assert.equal(c.children[0].alt, 'original alt'); assert.ok(c.classes.includes('managed-site-image'));
    assert.match(c.children[0].src, /\/site-image\/about\?v=/);
  }
});
test('missing image and timeout preserve defaults without showing a broken picture', async () => {
  for (const outcome of ['error', 'timeout']) {
    const { containers } = await run(outcome);
    assert.deepEqual(containers[0].children, ['original']); assert.deepEqual(containers[0].classes, []);
  }
});
test('all sixteen CRM image slots are wired and style loads after mobile rules', () => {
  const found = new Set();
  for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const m of html.matchAll(/data-site-image="([^"]+)"/g)) found.add(m[1]);
    if (html.includes('data-site-image=')) {
      assert.match(html, /managed-images\.js[^>]+defer/);
      assert.ok(html.indexOf('managed-images.css') > html.indexOf('mobile-public.css'));
    }
  }
  assert.deepEqual([...found].sort(), ['about','autism','pools','eden_baby','hydrotherapy_children','hydrotherapy_adults','therapeutic_swimming','cooking_baking','emotional_water','swimming_lessons','watsu','water_exercise','parent_guidance','team_ronit','team_adva','team_aviv'].sort());
});
