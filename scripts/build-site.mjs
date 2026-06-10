import { deflateRawSync } from 'node:zlib';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'docs');
const siteDir = path.join(root, 'site');

const plantUmlAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function encode6bit(value) {
  return plantUmlAlphabet[value & 0x3f];
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

function encodePlantUml(source) {
  const compressed = deflateRawSync(Buffer.from(source, 'utf8'));
  let encoded = '';
  for (let i = 0; i < compressed.length; i += 3) {
    if (i + 2 === compressed.length) {
      encoded += append3bytes(compressed[i], compressed[i + 1], 0);
    } else if (i + 1 === compressed.length) {
      encoded += append3bytes(compressed[i], 0, 0);
    } else {
      encoded += append3bytes(compressed[i], compressed[i + 1], compressed[i + 2]);
    }
  }
  return encoded;
}

function plantUmlUrl(source) {
  return `https://www.plantuml.com/plantuml/svg/${encodePlantUml(source)}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inlineMarkdown(value, currentDir) {
  let out = escapeHtml(value);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    let resolved = src;
    if (src.endsWith('.puml.svg')) {
      const pumlPath = path.resolve(currentDir, src.replace(/\.svg$/, ''));
      if (existsSync(pumlPath)) {
        resolved = plantUmlUrl(readFileSync(pumlPath, 'utf8'));
      }
    }
    return `<img src="${escapeHtml(resolved)}" alt="${escapeHtml(alt)}">`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const resolved = href.endsWith('.md') ? href.replace(/\.md$/, '.html') : href;
    return `<a href="${escapeHtml(resolved)}">${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function renderMarkdown(markdown, sourcePath) {
  const currentDir = path.dirname(sourcePath);
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inFence = false;
  let fenceLang = '';
  let fenceLines = [];
  let inList = false;
  let inOrderedList = false;
  let inTable = false;
  let tableRows = [];

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      html.push('</ol>');
      inOrderedList = false;
    }
  }

  function closeTable() {
    if (!inTable) return;
    html.push('<table>');
    tableRows.forEach((row, index) => {
      if (index === 1 && row.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))) return;
      const tag = index === 0 ? 'th' : 'td';
      html.push('<tr>' + row.map((cell) => `<${tag}>${inlineMarkdown(cell.trim(), currentDir)}</${tag}>`).join('') + '</tr>');
    });
    html.push('</table>');
    tableRows = [];
    inTable = false;
  }

  function closeBlocks() {
    closeList();
    closeTable();
  }

  for (const line of lines) {
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence && !inFence) {
      closeBlocks();
      inFence = true;
      fenceLang = fence[1] || '';
      fenceLines = [];
      continue;
    }
    if (fence && inFence) {
      const code = fenceLines.join('\n');
      if (fenceLang === 'plantuml') {
        html.push(`<figure><img src="${plantUmlUrl(code)}" alt="PlantUML diagram"><figcaption>PlantUML diagram</figcaption></figure>`);
      } else if (fenceLang === 'mermaid') {
        html.push(`<pre class="mermaid">${escapeHtml(code)}</pre>`);
      } else {
        html.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
      inFence = false;
      fenceLang = '';
      fenceLines = [];
      continue;
    }
    if (inFence) {
      fenceLines.push(line);
      continue;
    }

    if (!line.trim()) {
      closeBlocks();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeBlocks();
      const level = heading[1].length;
      const text = inlineMarkdown(heading[2], currentDir);
      const id = heading[2].toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-|-$/g, '');
      html.push(`<h${level} id="${id}">${text}</h${level}>`);
      continue;
    }

    const list = line.match(/^-\s+(.+)$/);
    if (list) {
      closeTable();
      if (inOrderedList) {
        html.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(list[1], currentDir)}</li>`);
      continue;
    }

    const orderedList = line.match(/^\d+\.\s+(.+)$/);
    if (orderedList) {
      closeTable();
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        html.push('<ol>');
        inOrderedList = true;
      }
      html.push(`<li>${inlineMarkdown(orderedList[1], currentDir)}</li>`);
      continue;
    }

    if (/^\|.*\|$/.test(line.trim())) {
      closeList();
      inTable = true;
      tableRows.push(line.trim().slice(1, -1).split('|'));
      continue;
    }

    closeBlocks();
    html.push(`<p>${inlineMarkdown(line, currentDir)}</p>`);
  }
  closeBlocks();
  return html.join('\n');
}

function walk(dir, matcher, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, matcher, files);
    else if (matcher(full)) files.push(full);
  }
  return files;
}

function copyDir(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const src = path.join(from, entry);
    const dest = path.join(to, entry);
    if (statSync(src).isDirectory()) copyDir(src, dest);
    else copyFileSync(src, dest);
  }
}

function relativeHref(fromRel, toRel) {
  const fromDir = path.posix.dirname(fromRel.split(path.sep).join(path.posix.sep));
  const rel = path.posix.relative(fromDir === '.' ? '' : fromDir, toRel.split(path.sep).join(path.posix.sep));
  return rel.startsWith('.') ? rel : `./${rel}`;
}

function navItems(currentRel) {
  return walk(docsDir, (file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const rel = path.relative(docsDir, file).replace(/\.md$/, '.html');
      const title = readFileSync(file, 'utf8').match(/^#\s+(.+)$/m)?.[1] || rel;
      const active = rel === currentRel ? ' aria-current="page" class="active"' : '';
      return `<a href="${relativeHref(currentRel, rel)}"${active}><span class="nav-icon">article</span><span>${escapeHtml(title)}</span></a>`;
    })
    .join('\n');
}

function pageTemplate(title, body, currentRel) {
  const cssHref = relativeHref(currentRel, 'assets/site.css');
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${cssHref}">
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="${relativeHref(currentRel, 'index.html')}" aria-label="Design Docs home">
        <span class="brand-mark">docs</span>
        <span><strong>Design Docs</strong><small>Material style</small></span>
      </a>
      <nav aria-label="ドキュメント一覧">${navItems(currentRel)}</nav>
    </aside>
    <div class="page-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Markdown / UML / Architecture</p>
          <div class="page-title">${escapeHtml(title)}</div>
        </div>
        <span class="github-chip"><span class="nav-icon">code</span>GitHub Pages Ready</span>
      </header>
      <main class="content"><article class="doc-card">${body}</article></main>
    </div>
  </div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'base', themeVariables: { primaryColor: '#eaddff', primaryTextColor: '#1d1b20', lineColor: '#6750a4' } });
  </script>
</body>
</html>`;
}

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });
copyDir(path.join(docsDir, 'assets'), path.join(siteDir, 'assets'));
copyDir(path.join(docsDir, 'diagrams'), path.join(siteDir, 'diagrams'));

const siteCss = `:root {
  color-scheme: light;
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;
  --md-sys-color-secondary-container: #e8def8;
  --md-sys-color-surface: #fffbfe;
  --md-sys-color-surface-container: #f3edf7;
  --md-sys-color-surface-container-high: #ece6f0;
  --md-sys-color-outline: #79747e;
  --md-sys-color-outline-variant: #cac4d0;
  --md-sys-color-on-surface: #1d1b20;
  --md-sys-color-on-surface-variant: #49454f;
  --md-sys-elevation-1: 0 1px 2px rgb(0 0 0 / 18%), 0 1px 3px rgb(0 0 0 / 10%);
  --md-sys-elevation-2: 0 2px 6px rgb(0 0 0 / 16%), 0 4px 12px rgb(0 0 0 / 10%);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--md-sys-color-on-surface);
  background:
    radial-gradient(circle at top left, rgb(103 80 164 / 20%), transparent 36rem),
    linear-gradient(135deg, #fffbfe 0%, #f7f2fa 48%, #fef7ff 100%);
  font-family: "Noto Sans JP", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.app-shell {
  display: grid;
  grid-template-columns: 304px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px 18px;
  background: rgb(255 251 254 / 84%);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 14px 22px;
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
}

.brand-mark,
.nav-icon {
  font-family: "Material Symbols Rounded";
  font-weight: 500;
  font-style: normal;
  line-height: 1;
  font-feature-settings: "liga";
}

.brand-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  color: var(--md-sys-color-on-primary);
  background: var(--md-sys-color-primary);
  border-radius: 16px;
  box-shadow: var(--md-sys-elevation-1);
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  font-size: 1.1rem;
}

.brand small {
  color: var(--md-sys-color-on-surface-variant);
  font-size: .78rem;
}

.sidebar nav {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.sidebar nav a {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 12px;
  align-items: center;
  min-height: 48px;
  padding: 0 16px;
  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  border-radius: 24px;
  transition: background .18s ease, color .18s ease, transform .18s ease;
}

.sidebar nav a:hover {
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-high);
  transform: translateX(2px);
}

.sidebar nav a.active {
  color: var(--md-sys-color-on-primary-container);
  background: var(--md-sys-color-primary-container);
  font-weight: 700;
}

.page-shell {
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  min-height: 96px;
  padding: 18px clamp(24px, 5vw, 64px);
  background: rgb(255 251 254 / 78%);
  border-bottom: 1px solid rgb(202 196 208 / 65%);
  backdrop-filter: blur(18px);
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--md-sys-color-primary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.page-title {
  font-size: clamp(1.2rem, 2.4vw, 1.7rem);
  font-weight: 700;
}

.github-chip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  color: var(--md-sys-color-primary);
  text-decoration: none;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  background: var(--md-sys-color-surface);
}

.content {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 36px clamp(20px, 5vw, 64px) 72px;
}

.doc-card {
  padding: clamp(24px, 5vw, 56px);
  background: rgb(255 251 254 / 94%);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 28px;
  box-shadow: var(--md-sys-elevation-2);
}

h1,
h2,
h3 {
  color: var(--md-sys-color-on-surface);
  letter-spacing: -.02em;
}

h1 {
  margin-top: 0;
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.14;
}

h2 {
  margin-top: 2.4em;
  padding-top: .4em;
  font-size: clamp(1.4rem, 3vw, 2rem);
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

h3 {
  margin-top: 1.8em;
  font-size: 1.25rem;
}

p,
li,
td,
th {
  line-height: 1.85;
}

p,
ul,
table,
figure,
pre {
  margin-bottom: 1.25rem;
}

a {
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

ul {
  padding-left: 1.25rem;
}

li::marker {
  color: var(--md-sys-color-primary);
}

img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  background: white;
  box-shadow: var(--md-sys-elevation-1);
}

pre {
  padding: 18px 20px;
  overflow: auto;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  background: #211f26;
  color: #f5eff7;
}

pre.mermaid {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}

code {
  padding: 2px 7px;
  color: var(--md-sys-color-on-primary-container);
  background: var(--md-sys-color-primary-container);
  border-radius: 8px;
}

pre code {
  padding: 0;
  color: inherit;
  background: transparent;
}

table {
  width: 100%;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

th {
  color: var(--md-sys-color-on-primary-container);
  background: var(--md-sys-color-primary-container);
  font-weight: 700;
}

tr:last-child td {
  border-bottom: 0;
}

figure {
  margin: 28px 0;
}

figcaption {
  color: var(--md-sys-color-on-surface-variant);
  font-size: .9rem;
  margin-top: 10px;
}

@media (max-width: 920px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }

  .sidebar nav {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .topbar {
    position: static;
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .content {
    padding-inline: 14px;
  }

  .doc-card {
    border-radius: 22px;
  }

  .github-chip {
    width: 100%;
    justify-content: center;
  }
}
`;

writeFileSync(path.join(siteDir, 'assets', 'site.css'), siteCss);

for (const mdFile of walk(docsDir, (file) => file.endsWith('.md'))) {
  const markdown = readFileSync(mdFile, 'utf8');
  const title = markdown.match(/^#\s+(.+)$/m)?.[1] || path.basename(mdFile);
  const body = renderMarkdown(markdown, mdFile);
  const rel = path.relative(docsDir, mdFile).replace(/\.md$/, '.html');
  const out = path.join(siteDir, rel);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, pageTemplate(title, body, rel));
}

copyFileSync(path.join(siteDir, 'index.html'), path.join(siteDir, '404.html'));
console.log(`Built ${siteDir}`);
