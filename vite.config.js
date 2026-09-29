import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Vite's built-in html asset scanner treats the `href` of ANY <link> tag as a
// resolvable local asset, regardless of `rel`. That is correct for things like
// <link rel="stylesheet"> but incorrectly pulls in our hreflang alternates
// (<link rel="alternate" hreflang="ka" href="/ka/about.html">) as if they were
// build entries, producing stray duplicate HTML files under dist/assets/.
// This plugin stashes those specific tags before Vite's core HTML processing
// and restores them verbatim afterwards, so hreflang links are never touched
// by the bundler and no extra files get emitted.
const _hreflangStash = new Map();

function hreflangGuardPlugin() {
  const LINK_TAG_RE = /<link\b[^>]*>/g;
  return {
    name: 'hreflang-guard',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const found = [];
        html = html.replace(LINK_TAG_RE, (tag) => {
          if (tag.includes('rel="alternate"') && tag.includes('hreflang=')) {
            found.push(tag);
            return `<!--HREFLANG_PLACEHOLDER_${found.length - 1}-->`;
          }
          return tag;
        });
        if (found.length) {
          _hreflangStash.set(ctx.filename, found);
        }
        return html;
      },
    },
  };
}

function hreflangRestorePlugin() {
  return {
    name: 'hreflang-restore',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const list = _hreflangStash.get(ctx.filename);
        if (!list) return html;
        return html.replace(/<!--HREFLANG_PLACEHOLDER_(\d+)-->/g, (m, idx) => list[Number(idx)] ?? m);
      },
    },
  };
}

export default defineConfig({
  plugins: [hreflangGuardPlugin(), hreflangRestorePlugin()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        tips: resolve(__dirname, 'tips.html'),
                staff: resolve(__dirname, 'staff.html'),
        'dental-crown-guide': resolve(__dirname, 'dental-crown-guide.html'),

        'ka-index': resolve(__dirname, 'ka/index.html'),
        'ka-about': resolve(__dirname, 'ka/about.html'),
        'ka-tips': resolve(__dirname, 'ka/tips.html'),
        'ka-dental-crown-guide': resolve(__dirname, 'ka/dental-crown-guide.html'),

        'ru-index': resolve(__dirname, 'ru/index.html'),
        'ru-about': resolve(__dirname, 'ru/about.html'),
        'ru-tips': resolve(__dirname, 'ru/tips.html'),
        'ru-dental-crown-guide': resolve(__dirname, 'ru/dental-crown-guide.html'),

        'hy-index': resolve(__dirname, 'hy/index.html'),
        'hy-about': resolve(__dirname, 'hy/about.html'),
        'hy-tips': resolve(__dirname, 'hy/tips.html'),
        'hy-dental-crown-guide': resolve(__dirname, 'hy/dental-crown-guide.html'),      },
    },
  },
});
