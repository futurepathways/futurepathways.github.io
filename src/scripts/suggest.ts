// Tag and category suggestions as you type (PRD 8, decision 24).
// Attaches to every search box with [data-suggest]. Data comes from /search-data.json.

interface Item {
  kind: 'category' | 'tag' | 'country';
  slug: string;
  name: string;
  group: string;
  path: string;
  search: string[];
  count: number;
}

let itemsPromise: Promise<Item[]> | null = null;
function loadItems(): Promise<Item[]> {
  if (!itemsPromise) {
    itemsPromise = fetch('/search-data.json')
      .then((r) => r.json())
      .then((d) => d.items as Item[])
      .catch(() => []);
  }
  return itemsPromise;
}

export function matchItems(items: Item[], query: string, limit = 6): Item[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored = items
    .map((it) => {
      const name = it.name.toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score = 3;
      else if (name.split(/\s+/).some((w) => w.startsWith(q))) score = 2.5;
      else if (name.includes(q)) score = 2;
      else if (it.search.some((s) => s.toLowerCase().startsWith(q))) score = 1.5;
      else if (it.search.some((s) => s.toLowerCase().includes(q))) score = 1;
      return { it, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.it.count - a.it.count);
  return scored.slice(0, limit).map((x) => x.it);
}

export function initSuggest() {
  document.querySelectorAll<HTMLInputElement>('input[data-suggest]').forEach(attach);
}

function attach(input: HTMLInputElement) {
  if (input.dataset.suggestReady) return;
  input.dataset.suggestReady = '1';
  const wrap = input.closest<HTMLElement>('[data-suggest-wrap]') || input.parentElement!;
  wrap.style.position = wrap.style.position || 'relative';
  const box = document.createElement('ul');
  box.className = 'suggest-box';
  box.setAttribute('role', 'listbox');
  box.id = `${input.id || 'search'}-suggestions`;
  box.hidden = true;
  wrap.appendChild(box);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', box.id);
  input.setAttribute('aria-expanded', 'false');
  let active = -1;
  let current: Item[] = [];

  function close() {
    box.hidden = true;
    box.innerHTML = '';
    active = -1;
    input.setAttribute('aria-expanded', 'false');
  }

  function render(items: Item[]) {
    current = items;
    if (!items.length) return close();
    box.innerHTML = '';
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.id = `${box.id}-${i}`;
      const a = document.createElement('a');
      a.href = it.path;
      a.innerHTML = `<span class="suggest-name"></span><span class="suggest-group"></span>`;
      a.querySelector('.suggest-name')!.textContent = it.name;
      a.querySelector('.suggest-group')!.textContent = `${it.group} · ${it.count} post${it.count === 1 ? '' : 's'}`;
      a.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus so click works before blur
      li.appendChild(a);
      box.appendChild(li);
    });
    const all = document.createElement('li');
    all.className = 'suggest-all';
    all.innerHTML = `<span>Press Enter to search all posts</span>`;
    box.appendChild(all);
    box.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function highlight(i: number) {
    const opts = Array.from(box.querySelectorAll<HTMLElement>('[role="option"]'));
    opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === i)));
    active = i;
    input.setAttribute('aria-activedescendant', i >= 0 ? opts[i].id : '');
  }

  let timer: number | undefined;
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(async () => {
      const items = await loadItems();
      render(matchItems(items, input.value));
    }, 80);
  });
  input.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight(Math.min(current.length - 1, active + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight(Math.max(-1, active - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      location.href = current[active].path;
    } else if (e.key === 'Escape') {
      close();
    }
  });
  input.addEventListener('blur', () => setTimeout(close, 150));
  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) input.dispatchEvent(new Event('input'));
  });
}

initSuggest();
