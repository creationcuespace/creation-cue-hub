const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'blog');
const POSTS_JSON = path.join(BLOG_DIR, 'posts.json');
const TEMPLATE_HTML = path.join(BLOG_DIR, 'post.html');
const SITEMAP_XML = path.join(ROOT_DIR, 'sitemap.xml');

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripFrontmatter(md) {
  if (md.startsWith('---')) {
    const endIdx = md.indexOf('---', 3);
    if (endIdx !== -1) {
      return md.slice(endIdx + 3).trim();
    }
  }
  return md.trim();
}

function buildSidebarHtml(posts, currentSlug) {
  const otherPosts = posts
    .filter(p => p.slug !== currentSlug && p.draft !== true)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    .slice(0, 5);

  if (otherPosts.length === 0) return '';

  return otherPosts.map(post => {
    const thumbUrl = post.thumbnail
      ? `https://wsrv.nl/?url=${encodeURIComponent(post.thumbnail)}&w=120&h=120&output=webp&q=80`
      : 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp';
    const pinBadge = post.pinned ? '<span style="color:var(--accent); font-size:11px; margin-right:4px;">📌</span>' : '';
    return `
          <a class="sidebar-item" href="/blog/${escapeHtml(post.slug)}">
            <img class="sidebar-thumb" src="${thumbUrl}" alt="${escapeHtml(post.title)}" loading="lazy">
            <div class="sidebar-info">
              <div class="sidebar-item-title" title="${escapeHtml(post.title)}">${pinBadge}${escapeHtml(post.title)}</div>
              <div class="sidebar-item-date">${escapeHtml(post.date || '')}</div>
            </div>
          </a>`;
  }).join('\n');
}

function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
  const template = fs.readFileSync(TEMPLATE_HTML, 'utf8');
  const published = posts.filter(p => p.draft !== true);

  let generatedCount = 0;

  for (const post of published) {
    const mdPath = path.join(BLOG_DIR, 'posts', `${post.slug}.md`);
    if (!fs.existsSync(mdPath)) {
      console.warn(`Skipping ${post.slug}: markdown file not found.`);
      continue;
    }

    const rawMd = fs.readFileSync(mdPath, 'utf8');
    const cleanMd = stripFrontmatter(rawMd);
    marked.setOptions({ breaks: true });
    const contentHtml = marked.parse(cleanMd);

    const canonicalUrl = `https://creationcue.web.app/blog/${post.slug}`;
    const coverImg = post.thumbnail || 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp';
    const coverProxy = `https://wsrv.nl/?url=${encodeURIComponent(coverImg)}&w=800&output=webp&q=85`;
    const excerpt = post.excerpt || `${post.title} — CreationCue™ Blog`;
    const isoDate = post.timestamp || new Date().toISOString();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: excerpt,
      image: coverImg,
      datePublished: isoDate,
      author: {
        '@type': 'Person',
        name: 'Sotirios Liontos',
        url: 'https://creationcue.web.app/go'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Creation Cue™ Studio',
        logo: {
          '@type': 'ImageObject',
          url: 'https://cdn.jsdelivr.net/gh/creationcuespace/creation-cue-hub@main/images/logo.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      }
    };

    let html = template;

    // Update head meta tags
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHtml(post.title)} | CreationCue™ Blog</title>`
    );
    html = html.replace(
      /<meta name="description" content=".*?">/,
      `<meta name="description" content="${escapeHtml(excerpt)}">`
    );
    html = html.replace(
      /<link rel="canonical" id="canonical-link" href=".*?">/,
      `<link rel="canonical" id="canonical-link" href="${canonicalUrl}">`
    );
    html = html.replace(
      /<meta property="og:title" id="og-title" content=".*?">/,
      `<meta property="og:title" id="og-title" content="${escapeHtml(post.title)}">\n  <meta property="og:url" content="${canonicalUrl}">`
    );
    html = html.replace(
      /<meta property="og:description" id="og-desc" content=".*?">/,
      `<meta property="og:description" id="og-desc" content="${escapeHtml(excerpt)}">`
    );
    html = html.replace(
      /<meta property="og:image" content=".*?">/,
      `<meta property="og:image" content="${escapeHtml(coverImg)}">`
    );
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n</head>`
    );

    // Pre-render body content
    html = html.replace(
      '<span id="post-date">Loading...</span>',
      `<span id="post-date">${escapeHtml(post.date || 'Recent')}</span>`
    );
    html = html.replace(
      '<span id="post-readtime">Loading...</span>',
      `<span id="post-readtime">${escapeHtml(post.readTime || '2 min read')}</span>`
    );
    html = html.replace(
      '<h1 class="post-title" id="post-title">Loading Article...</h1>',
      `<h1 class="post-title" id="post-title">${escapeHtml(post.title)}</h1>`
    );
    html = html.replace(
      '<img id="post-cover-image" class="post-cover-image" src="" alt="Featured Watch Face" style="display:none;">',
      `<img id="post-cover-image" class="post-cover-image" src="${escapeHtml(coverProxy)}" alt="${escapeHtml(post.title)}" style="display:block;">`
    );
    html = html.replace(
      '<div class="post-content" id="post-content">\n          <p>Loading article content...</p>\n        </div>',
      `<div class="post-content" id="post-content">\n${contentHtml}\n        </div>`
    );
    html = html.replace(
      '<!-- Loaded dynamically -->',
      buildSidebarHtml(posts, post.slug)
    );

    // Disable dynamic article fetch on pre-rendered static pages
    html = html.replace(
      'loadMarkdownArticle();',
      '/* Static pre-rendered page — no client fetch needed */'
    );

    const outPath = path.join(BLOG_DIR, `${post.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    generatedCount++;
  }

  // Update sitemap.xml with clean static blog URLs
  const staticUrls = [
    { loc: 'https://creationcue.web.app/', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://creationcue.web.app/blog', changefreq: 'daily', priority: '0.8' },
    { loc: 'https://creationcue.web.app/install', changefreq: 'monthly', priority: '0.6' },
    { loc: 'https://creationcue.web.app/privacy', changefreq: 'monthly', priority: '0.3' },
    { loc: 'https://creationcue.web.app/privacy_manager.html', changefreq: 'monthly', priority: '0.3' },
    ...published.map(p => ({
      loc: `https://creationcue.web.app/blog/${p.slug}`,
      changefreq: 'weekly',
      priority: p.slug === 'top-free-watch-face-apps' ? '0.9' : '0.7'
    }))
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls
    .map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`;

  fs.writeFileSync(SITEMAP_XML, sitemapXml, 'utf8');
  console.log(`Generated ${generatedCount} static SEO blog pages and updated sitemap.xml.`);
}

main();
