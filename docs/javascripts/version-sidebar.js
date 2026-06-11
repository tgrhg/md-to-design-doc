const escapeText = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

const scriptRoot = new URL('../', document.currentScript?.src || document.baseURI);
const pageRoot = scriptRoot;
const metadataUrl = new URL('version.json', pageRoot);
const previewRootMatch = window.location.pathname.match(/^(.*\/)previews\/pr-\d+\//);
const productionRoot = previewRootMatch
  ? new URL(previewRootMatch[1] || '/', window.location.origin)
  : pageRoot;
const versionsUrl = new URL('previews/versions.json', productionRoot);

function renderVersionItem(preview) {
  const title = preview.title || `PR #${preview.prNumber}`;
  const ref = preview.refName || preview.headRefName || 'preview';
  const sha = preview.shortSha || (preview.sha ? String(preview.sha).slice(0, 7) : 'unknown');
  const built = preview.buildTime || preview.updatedAt || '';
  return `
    <a class="dd-version-card" href="${escapeText(preview.url)}">
      <span class="dd-version-kind">PR Preview</span>
      <strong>${escapeText(title)}</strong>
      <small>${escapeText(sha)} / ${escapeText(ref)}</small>
      ${built ? `<small>${escapeText(built)}</small>` : ''}
    </a>`;
}

function mountVersionPanel(metadata) {
  const sidebar = document.querySelector('.md-sidebar--primary .md-sidebar__scrollwrap');
  if (!sidebar) return;

  const panel = document.createElement('section');
  panel.className = 'dd-version-panel';
  panel.innerHTML = `
    <h2>公開済みバージョン</h2>
    <a class="dd-version-card dd-version-card--production" href="${escapeText(new URL('index.html', productionRoot).href)}">
      <span class="dd-version-kind">Production</span>
      <strong>Docs v${escapeText(metadata.docVersion || 'local')}</strong>
      <small>${escapeText(metadata.shortSha || 'local')} / ${escapeText(metadata.refName || 'local')}</small>
    </a>
    <p class="dd-version-empty">PR preview を確認中...</p>`;
  sidebar.append(panel);

  fetch(versionsUrl, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : { previews: [] })
    .then((data) => {
      const previews = Array.isArray(data) ? data : (data.previews || []);
      const validPreviews = previews.filter((preview) => preview && preview.url);
      const empty = panel.querySelector('.dd-version-empty');
      if (!validPreviews.length) {
        if (empty) empty.textContent = '公開中の PR preview はまだありません。';
        return;
      }
      if (empty) empty.remove();
      panel.insertAdjacentHTML('beforeend', validPreviews.map(renderVersionItem).join(''));
    })
    .catch(() => {
      const empty = panel.querySelector('.dd-version-empty');
      if (empty) empty.textContent = 'PR preview の履歴はまだ公開されていません。';
    });
}

function mountHeaderChip(metadata) {
  const header = document.querySelector('.md-header__topic');
  if (!header) return;
  const chip = document.createElement('span');
  chip.className = 'dd-version-chip';
  chip.textContent = `v${metadata.docVersion || 'local'} / ${metadata.shortSha || 'local'}`;
  header.append(chip);
}

fetch(metadataUrl, { cache: 'no-store' })
  .then((response) => response.ok ? response.json() : {})
  .catch(() => ({}))
  .then((metadata) => {
    mountHeaderChip(metadata);
    mountVersionPanel(metadata);
  });
