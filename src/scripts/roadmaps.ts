// Career Roadmaps page: filter the quick map and the role sections, keep choices in the
// address (?subject=maths&exam=jee&family=data-ai&q=…), open a role when its anchor is visited.

function init() {
  const form = document.querySelector<HTMLFormElement>('[data-rm-filters]');
  if (!form) return;
  const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>('[data-rm-row]'));
  const roleSections = Array.from(document.querySelectorAll<HTMLElement>('[data-rm-family-section]'));
  const roleItems = Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-rm-role]'));
  const count = document.querySelector<HTMLElement>('[data-rm-count]');
  const empty = document.querySelector<HTMLElement>('[data-rm-empty]');
  const subjectSel = form.querySelector<HTMLSelectElement>('select[name="subject"]')!;
  const examSel = form.querySelector<HTMLSelectElement>('select[name="exam"]')!;
  const q = form.querySelector<HTMLInputElement>('input[name="q"]')!;
  const chips = Array.from(form.querySelectorAll<HTMLButtonElement>('[data-family]'));
  let family = '';

  const params = new URLSearchParams(location.search);
  subjectSel.value = params.get('subject') || '';
  examSel.value = params.get('exam') || '';
  q.value = params.get('q') || '';
  family = params.get('family') || '';
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.family === family)));

  function matches(el: HTMLElement): boolean {
    const subj = subjectSel.value;
    const exam = examSel.value;
    const text = q.value.trim().toLowerCase();
    if (family && el.dataset.family !== family) return false;
    if (subj && !(el.dataset.subjects || '').split(' ').includes(subj)) return false;
    if (exam && !(el.dataset.exams || '').split(' ').includes(exam)) return false;
    if (text && !(el.dataset.text || '').includes(text)) return false;
    return true;
  }

  function apply() {
    let shown = 0;
    rows.forEach((r) => {
      const ok = matches(r);
      r.hidden = !ok;
      if (ok) shown++;
    });
    // Hide whole family sections that do not match the family chip; role details follow the table filter.
    const shownSlugs = new Set(rows.filter((r) => !r.hidden).map((r) => r.querySelector('a')!.getAttribute('href')!.slice(1)));
    roleItems.forEach((d) => (d.hidden = !shownSlugs.has(d.id)));
    roleSections.forEach((s) => (s.hidden = !s.querySelector('[data-rm-role]:not([hidden])')));
    if (count) {
      const any = family || subjectSel.value || examSel.value || q.value.trim();
      count.textContent = any ? `${shown} of ${rows.length} roles match` : `${rows.length} roles`;
    }
    if (empty) empty.hidden = shown > 0;
    const p = new URLSearchParams();
    if (subjectSel.value) p.set('subject', subjectSel.value);
    if (examSel.value) p.set('exam', examSel.value);
    if (family) p.set('family', family);
    if (q.value.trim()) p.set('q', q.value.trim());
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      family = c.dataset.family || '';
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
      apply();
    }),
  );
  form.querySelector('[data-rm-clear]')?.addEventListener('click', () => {
    subjectSel.value = '';
    examSel.value = '';
    q.value = '';
    family = '';
    chips.forEach((c) => c.setAttribute('aria-pressed', String(!c.dataset.family)));
    apply();
  });

  // Open the role whose anchor is in the address, and when a table link is tapped.
  function openHash() {
    const id = location.hash.slice(1);
    if (!id) return;
    const d = document.getElementById(id) as HTMLDetailsElement | null;
    if (d && d.tagName === 'DETAILS') {
      d.hidden = false;
      d.open = true;
      d.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  window.addEventListener('hashchange', openHash);
  document.querySelectorAll<HTMLAnchorElement>('.rm-role-link').forEach((a) =>
    a.addEventListener('click', () => setTimeout(openHash, 0)),
  );
  document.querySelectorAll<HTMLAnchorElement>('[data-rm-copy]').forEach((a) =>
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = location.origin + location.pathname + a.dataset.rmCopy;
      try {
        await navigator.clipboard.writeText(url);
        a.textContent = 'Link copied';
        setTimeout(() => (a.textContent = 'Copy link to this role'), 2000);
      } catch {
        prompt('Copy this link:', url);
      }
    }),
  );

  apply();
  openHash();
}

init();
