// Search page (PRD 8, decision 29). Pagefind finds matching posts by words; the
// shared listing engine (listing.ts) then applies filters, sorting and pagination
// to the cards already on the page. If Pagefind is not available (for example in
// `npm run dev`), a simple word match over titles, summaries and tags is used.

interface ListingApi {
  setMatches: (ranks: Map<string, number> | null) => void;
}

async function loadPagefind(): Promise<any | null> {
  try {
    // Built by `pagefind --site dist` after `astro build`. Not present in dev.
    const url = '/pagefind/' + 'pagefind.js'; // built as a string so Vite does not try to bundle it
    const mod = await import(/* @vite-ignore */ url);
    await mod.init?.();
    return mod;
  } catch {
    return null;
  }
}

function simpleMatch(q: string, cards: HTMLElement[]): Map<string, number> {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const ranks = new Map<string, number>();
  cards.forEach((c) => {
    const hay = `${c.dataset.title} ${c.dataset.searchWords || ''} ${c.querySelector('.post-card-summary')?.textContent || ''}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if ((c.dataset.title || '').includes(w)) score += 3;
      else if (hay.includes(w)) score += 1;
    }
    if (score > 0 && words.every((w) => hay.includes(w))) ranks.set(c.dataset.slug!, score);
  });
  return ranks;
}

async function run() {
  const form = document.querySelector<HTMLFormElement>('[data-search-form]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const status = document.querySelector<HTMLElement>('[data-search-status]');
  const root = document.querySelector<HTMLElement>('[data-listing]');
  if (!form || !input || !root) return;
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'));
  const api = () => (root as any).__listing as ListingApi | undefined;

  const pagefind = await loadPagefind();

  async function search(q: string, push = true) {
    q = q.trim();
    const p = new URLSearchParams(location.search);
    if (q) p.set('q', q);
    else p.delete('q');
    if (push) history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
    document.title = (q ? `Search: ${q} | ` : 'Search | ') + 'Future Pathways';

    if (!q) {
      api()?.setMatches(null);
      if (status) status.textContent = 'Type a word above, or use the filters to browse every post.';
      return;
    }
    let ranks: Map<string, number>;
    if (pagefind) {
      const res = await pagefind.search(q);
      ranks = new Map();
      const results = await Promise.all(res.results.slice(0, 200).map((r: any) => r.data()));
      results.forEach((d: any, i: number) => {
        const slug = d.meta?.slug;
        if (slug) ranks.set(slug, results.length - i);
      });
    } else {
      ranks = simpleMatch(q, cards);
    }
    api()?.setMatches(ranks);
    if (status) {
      status.textContent = ranks.size
        ? `Showing posts that match “${q}”. Use the filters to narrow down.`
        : `No posts match “${q}” yet. Try another word, or browse by tag.`;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    search(input.value);
  });
  const initial = new URLSearchParams(location.search).get('q') || '';
  input.value = initial;
  await search(initial, false);
}

run();
