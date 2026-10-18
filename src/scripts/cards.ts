// Builds a post card in the browser from the JSON index (decision 43, 18 Oct 2026).
// The markup mirrors src/components/PostCard.astro; its styles live in global.css so both match.
import { deadlineStatus, statusLabel, formatDateString } from '../lib/deadlines';

export interface CardJson {
  slug: string;
  path: string;
  title: string;
  summary: string;
  category: string;
  extraCategories: string[];
  gradeBands: string[];
  streams: string[];
  tags: string[];
  tagNames: string[];
  countries: string[];
  readingMinutes: number;
  publishedDate: string;
  deadline: string | null;
  rolling: boolean;
  nextDate: string | null;
  opportunityType: string | null;
  mode: string | null;
  cost: string | null;
  draft: boolean;
  searchWords: string;
}

const CATEGORY_NAME: Record<string, string> = {
  careers: 'Careers',
  opportunities: 'Opportunities',
  courses: 'Courses',
  countries: 'Countries',
  universities: 'Universities',
};
const CATEGORY_ICON: Record<string, string> = {
  careers: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  opportunities: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z"/>',
  courses: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V5.5"/><path d="M8 7h8"/><path d="M8 11h6"/>',
  countries: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
  universities: '<path d="M3 10 12 5l9 5-9 5z"/><path d="M7 12.5V17c0 1 2.5 2 5 2s5-1 5-2v-4.5"/><path d="M21 10v5"/>',
};
const GRADE: Record<string, string> = { '6-8': 'Grades 6–8', '9-10': 'Grades 9–10', '11-12': 'Grades 11–12' };

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function icon(paths: string, size = 16): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon" aria-hidden="true">${paths}</svg>`;
}

export function renderCard(c: CardJson, context = '', headingLevel: 'h2' | 'h3' = 'h3'): HTMLElement {
  const nextDate = c.rolling ? null : c.nextDate;
  const status = c.opportunityType ? deadlineStatus(c.deadline, c.rolling) : nextDate ? deadlineStatus(nextDate, false) : null;
  const alsoIn = context && context !== c.category && c.extraCategories.includes(context) ? CATEGORY_NAME[context] : '';
  const li = document.createElement('li');
  li.className = `card post-card cat-${c.category}`;
  const attrs: Record<string, string | null | undefined> = {
    'data-card': '',
    'data-slug': c.slug,
    'data-title': c.title.toLowerCase(),
    'data-date': c.publishedDate,
    'data-cat': [c.category, ...c.extraCategories].join(' '),
    'data-grade': c.gradeBands.join(' '),
    'data-stream': c.streams.join(' '),
    'data-country': c.countries.join(' '),
    'data-tags': c.tags.join(' '),
    'data-search-words': c.searchWords,
    'data-type': c.opportunityType,
    'data-mode': c.mode,
    'data-cost': c.cost,
    'data-deadline-date': nextDate,
    'data-status': status,
  };
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) li.setAttribute(k, v);

  const badge = status
    ? `<span class="post-card-deadline"><span class="deadline" data-deadline="${c.opportunityType ? c.deadline ?? '' : nextDate ?? ''}"${c.rolling ? ' data-rolling="true"' : ''}><span class="badge badge--${status}" data-deadline-badge>${statusLabel[status]}</span></span>${!c.opportunityType && nextDate ? `<span class="post-card-nextdate">${formatDateString(nextDate)}</span>` : ''}</span>`
    : '';
  const tags = c.tags
    .slice(0, 5)
    .map((slug, i) => `<li><a class="tag" href="/tags/${slug}/">${esc(c.tagNames[i] ?? slug)}</a></li>`)
    .join('');
  const more = c.tags.length > 5 ? `<li class="tag-more">+${c.tags.length - 5} more</li>` : '';

  li.innerHTML = `
    <div class="post-card-top">
      <a class="cat-chip" href="/${c.category}/">${icon(CATEGORY_ICON[c.category] ?? '')} ${CATEGORY_NAME[c.category] ?? c.category}</a>
      ${alsoIn ? `<span class="also-in">Also in ${alsoIn}</span>` : ''}
      ${c.draft ? '<span class="badge badge--closed">Draft</span>' : ''}
      ${badge}
    </div>
    <${headingLevel} class="post-card-title"><a href="${c.path}">${esc(c.title)}</a></${headingLevel}>
    <p class="post-card-summary">${esc(c.summary)}</p>
    <div class="post-card-meta">
      <span>${c.gradeBands.map((g) => GRADE[g] ?? g).join(' · ')}</span>
      <span aria-hidden="true">·</span>
      <span>${c.readingMinutes} min read</span>
      <span aria-hidden="true">·</span>
      <time datetime="${c.publishedDate}">${formatDateString(c.publishedDate)}</time>
      <button type="button" class="save-btn js-only" data-save="${c.slug}" data-save-title="${esc(c.title)}" aria-pressed="false" aria-label="Save &quot;${esc(c.title)}&quot;">
        ${icon('<path d="M6 3h12v18l-6-4-6 4z"/>', 18).replace('class="icon"', 'class="icon save-icon-empty"')}
        ${icon('<path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/>', 18).replace('class="icon"', 'class="icon save-icon-filled"')}
        <span data-save-label>Save</span>
      </button>
    </div>
    <ul class="tag-list tag-list--small">${tags}${more}</ul>`;
  return li;
}

let indexPromise: Promise<Map<string, CardJson>> | null = null;
export function loadIndex(): Promise<Map<string, CardJson>> {
  if (!indexPromise) {
    indexPromise = fetch('/index.json')
      .then((r) => r.json())
      .then((d) => new Map<string, CardJson>((d.posts as CardJson[]).map((p) => [p.slug, p])))
      .catch(() => new Map());
  }
  return indexPromise;
}
