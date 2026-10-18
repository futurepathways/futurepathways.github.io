// Filters, sorts and paginates post cards in the browser (PRD 8, decision 15).
// Filter choices live in the page address (?grade=9-10&tags=neet&page=2).
import { refreshDeadlines } from './deadlines';
import { loadIndex, renderCard } from './cards';
import { refreshSaveButtons } from './bookmarks';

const GROUPS = ['cat', 'grade', 'stream', 'country', 'tags', 'type', 'mode', 'cost', 'status'] as const;
type Group = (typeof GROUPS)[number];
const ATTR: Record<Group, string> = {
  cat: 'cat',
  grade: 'grade',
  stream: 'stream',
  country: 'country',
  tags: 'tags',
  type: 'type',
  mode: 'mode',
  cost: 'cost',
  status: 'status',
};

function tokens(card: HTMLElement, attr: string): string[] {
  return (card.dataset[attr] || '').split(' ').filter(Boolean);
}

function matches_(card: HTMLElement, group: Group, wanted: string[]): boolean {
  if (!wanted.length) return true;
  const have = tokens(card, ATTR[group]);
  if (group === 'stream' && have.includes('any')) return true; // "any" suits every stream (decision 27)
  return wanted.some((w) => have.includes(w));
}

export function initListings() {
  document.querySelectorAll<HTMLElement>('[data-listing]').forEach(initListing);
}

function initListing(root: HTMLElement) {
  if (root.dataset.ready) return;
  root.dataset.ready = '1';
  const form = root.querySelector<HTMLFormElement>('[data-filters]');
  const list = root.querySelector<HTMLElement>('[data-list]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  const pagination = root.querySelector<HTMLElement>('[data-pagination]');
  if (!form || !list) return;
  let cards = Array.from(list.querySelectorAll<HTMLElement>('[data-card]'));
  const total = Number(root.dataset.total || cards.length);
  const restSlugs = (root.dataset.restSlugs || '').split(' ').filter(Boolean);
  let allLoaded = restSlugs.length === 0;
  const showMore = root.querySelector<HTMLElement>('[data-show-more]');

  /** Build the cards that were left out of the HTML, once, from the JSON index. */
  async function ensureAll() {
    if (allLoaded) return;
    allLoaded = true;
    const index = await loadIndex();
    const ctx = root.dataset.context || '';
    const level = (root.dataset.headingLevel as 'h2' | 'h3') || 'h3';
    for (const slug of restSlugs) {
      const data = index.get(slug);
      if (!data) continue;
      const el = renderCard(data, ctx, level);
      el.hidden = true;
      list!.appendChild(el);
      cards.push(el);
    }
    refreshDeadlines(list!);
    refreshSaveButtons(list!);
    showMore?.closest('.show-more')?.remove();
  }
  const pageSize = Number(root.dataset.pageSize || 12);
  const sortDefault = root.dataset.sortDefault || 'newest';
  let page = 1;
  let matches: Map<string, number> | null = null; // search ranks by slug, when searching

  refreshDeadlines(root);

  // 1. Read the page address into the form.
  const params = new URLSearchParams(location.search);
  for (const g of GROUPS) {
    const wanted = params.getAll(g).flatMap((v) => v.split(','));
    form.querySelectorAll<HTMLInputElement>(`input[name="${g}"]`).forEach((i) => (i.checked = wanted.includes(i.value)));
  }
  const sortSel = form.querySelector<HTMLSelectElement>('select[name="sort"]');
  if (sortSel) sortSel.value = params.get('sort') || sortDefault;
  page = Math.max(1, Number(params.get('page') || 1));

  function selected(g: Group): string[] {
    return Array.from(form!.querySelectorAll<HTMLInputElement>(`input[name="${g}"]:checked`)).map((i) => i.value);
  }

  function apply(updateUrl = true) {
    const wanted = Object.fromEntries(GROUPS.map((g) => [g, selected(g)])) as Record<Group, string[]>;
    const sort = sortSel?.value || sortDefault;

    // Mark active filter buttons.
    form!.querySelectorAll<HTMLElement>('details.filter').forEach((d) => {
      const active = d.querySelector('input:checked');
      d.toggleAttribute('data-active', Boolean(active));
    });

    let visible = cards.filter((c) => GROUPS.every((g) => matches_(c, g, wanted[g])));
    if (matches) visible = visible.filter((c) => matches!.has(c.dataset.slug || ''));

    visible.sort((a, b) => {
      if (sort === 'relevance' && matches) {
        return (matches.get(b.dataset.slug || '') || 0) - (matches.get(a.dataset.slug || '') || 0);
      }
      if (sort === 'az') return (a.dataset.title || '').localeCompare(b.dataset.title || '');
      if (sort === 'deadline') {
        const da = a.dataset.deadlineDate,
          db = b.dataset.deadlineDate;
        const ca = a.dataset.status === 'closed',
          cb = b.dataset.status === 'closed';
        if (ca !== cb) return ca ? 1 : -1; // closed ones last
        if (da && db) return da.localeCompare(db);
        if (da) return -1;
        if (db) return 1;
      }
      return (b.dataset.date || '').localeCompare(a.dataset.date || '');
    });

    const pages = allLoaded ? Math.max(1, Math.ceil(visible.length / pageSize)) : 1;
    if (page > pages) page = pages;
    const start = (page - 1) * pageSize;
    const shown = new Set(visible.slice(start, start + pageSize));

    // Reorder and show/hide.
    visible.forEach((c) => list!.appendChild(c));
    cards.forEach((c) => (c.hidden = !shown.has(c)));
    if (empty) empty.hidden = visible.length > 0;
    if (count) {
      const anyFilter = GROUPS.some((g) => wanted[g].length);
      const all = allLoaded ? cards.length : total;
      count.textContent =
        visible.length === cards.length && !anyFilter
          ? `${all} post${all === 1 ? '' : 's'}`
          : `${visible.length} of ${all} post${all === 1 ? '' : 's'} match`;
    }
    renderPagination(pages);

    if (updateUrl) {
      const p = new URLSearchParams(location.search);
      for (const g of GROUPS) {
        p.delete(g);
        if (wanted[g].length) p.set(g, wanted[g].join(','));
      }
      p.delete('sort');
      if (sort !== sortDefault) p.set('sort', sort);
      p.delete('page');
      if (page > 1) p.set('page', String(page));
      const qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
  }

  function renderPagination(pages: number) {
    if (!pagination) return;
    pagination.innerHTML = '';
    if (pages <= 1) return;
    const mk = (label: string, target: number, opts: { current?: boolean; disabled?: boolean; aria?: string } = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (opts.aria) b.setAttribute('aria-label', opts.aria);
      if (opts.current) b.setAttribute('aria-current', 'page');
      b.disabled = Boolean(opts.disabled);
      b.addEventListener('click', async () => {
        await ensureAll();
        page = target;
        apply();
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.appendChild(b);
    };
    mk('‹ Previous', page - 1, { disabled: page === 1, aria: 'Previous page' });
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && Math.abs(i - page) > 2 && i !== 1 && i !== pages) {
        if (Math.abs(i - page) === 3) {
          const s = document.createElement('span');
          s.textContent = '…';
          pagination.appendChild(s);
        }
        continue;
      }
      mk(String(i), i, { current: i === page, aria: `Page ${i}` });
    }
    mk('Next ›', page + 1, { disabled: page === pages, aria: 'Next page' });
  }

  form.querySelectorAll<HTMLDetailsElement>('details.filter').forEach((d) => {
    const sum = d.querySelector('summary');
    sum?.setAttribute('role', 'button');
    sum?.setAttribute('aria-expanded', String(d.open));
    d.addEventListener('toggle', () => sum?.setAttribute('aria-expanded', String(d.open)));
  });

  form.addEventListener('change', async () => {
    await ensureAll();
    page = 1;
    apply();
  });
  showMore?.addEventListener('click', async () => {
    await ensureAll();
    apply();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.querySelector('[data-clear]')?.addEventListener('click', () => {
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((i) => (i.checked = false));
    if (sortSel) sortSel.value = sortDefault;
    page = 1;
    apply();
  });
  // Close an open filter dropdown when clicking elsewhere.
  document.addEventListener('click', (e) => {
    form.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((d) => {
      if (!d.contains(e.target as Node)) d.open = false;
    });
  });

  (root as any).__listing = {
    async setMatches(ranks: Map<string, number> | null) {
      await ensureAll();
      matches = ranks;
      page = 1;
      apply(false);
    },
  };

  // A shared link with filters, a sort or a later page needs every card before the first draw.
  const needsAll = GROUPS.some((g) => params.getAll(g).length) || page > 1 || (sortSel && sortSel.value !== sortDefault);
  if (needsAll && !allLoaded) {
    ensureAll().then(() => apply(false));
  } else {
    apply(false);
  }
}
