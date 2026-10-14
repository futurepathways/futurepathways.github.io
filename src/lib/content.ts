// Post helpers shared by every page. Loads all four collections and gives one
// tidy shape (`Post`) plus the small "card" shape used in JSON indexes.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { CategoryKey } from '../content.config';
import { categoryByKey } from '../config/site';
import { tagBySlug, tagGroupOrder, countryBySlug, type Tag, type TagGroupKey } from './data';
import { istTodayString } from './deadlines';

export type AnyEntry =
  | CollectionEntry<'careers'>
  | CollectionEntry<'opportunities'>
  | CollectionEntry<'courses'>
  | CollectionEntry<'countries'>
  | CollectionEntry<'universities'>;

export interface OpportunityInfo {
  type: string;
  deadline: string | null; // YYYY-MM-DD (IST calendar date)
  deadlineNote?: string;
  rolling: boolean;
  eventDates?: string;
  mode?: string;
  cost?: string;
  applyLink?: string;
}

export interface KeyDate {
  date: string; // YYYY-MM-DD (IST calendar date)
  label: string;
  note?: string;
  url?: string;
}

export interface Post {
  entry: AnyEntry;
  slug: string;
  category: CategoryKey;
  path: string;
  title: string;
  summary: string;
  extraCategories: CategoryKey[];
  gradeBands: string[];
  streams: string[];
  tags: Tag[]; // ordered by group then as written
  tagsByGroup: Record<TagGroupKey, Tag[]>;
  countries: string[];
  parentSummary: string;
  officialLinks: { label: string; url: string }[];
  keyDates: KeyDate[];
  coverImage: ImageMetadata | null;
  coverAlt: string;
  imageCredit?: string;
  author?: string;
  reviewedBy?: string;
  lastChecked: Date;
  publishedDate: Date;
  status: 'draft' | 'published';
  readingMinutes: number;
  opportunity: OpportunityInfo | null;
  body: string;
}

/** Card data: everything a listing card or search result needs, small enough for JSON. */
export interface CardData {
  slug: string;
  path: string;
  title: string;
  summary: string;
  category: CategoryKey;
  extraCategories: CategoryKey[];
  gradeBands: string[];
  streams: string[];
  tags: string[];
  countries: string[];
  readingMinutes: number;
  publishedDate: string; // YYYY-MM-DD
  lastChecked: string;
  deadline: string | null;
  rolling: boolean;
  nextDate: string | null; // the opportunity deadline, or the nearest key date today or later
  opportunityType: string | null;
  mode: string | null;
  cost: string | null;
  draft: boolean;
}

// Drafts are visible in `npm run dev`, and in `npm run build:drafts` (for phase reviews).
// A normal `npm run build` (what GitHub Actions runs) never shows drafts.
export const SHOW_DRAFTS = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === '1';

export function toDateString(d: Date): string {
  // Dates in frontmatter are calendar dates; take the UTC parts so the day never shifts.
  return d.toISOString().slice(0, 10);
}

export function readingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()!-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function normalise(entry: AnyEntry): Post {
  const d = entry.data as any;
  const category = d.main_category as CategoryKey;
  const slug = entry.id;
  const tagSlugs: string[] = [
    ...d.tags_subject,
    ...d.tags_exam,
    ...d.tags_skill,
    ...d.tags_level,
    ...d.tags_audience,
  ];
  const tags = tagSlugs.map((s) => tagBySlug[s]).filter(Boolean);
  const tagsByGroup = Object.fromEntries(tagGroupOrder.map((g) => [g, tags.filter((t) => t.group === g)])) as Record<
    TagGroupKey,
    Tag[]
  >;
  const opportunity: OpportunityInfo | null =
    category === 'opportunities'
      ? {
          type: d.opportunity_type ?? 'other',
          deadline: d.deadline ? toDateString(d.deadline) : null,
          deadlineNote: d.deadline_note,
          rolling: Boolean(d.rolling),
          eventDates: d.event_dates,
          mode: d.mode,
          cost: d.cost,
          applyLink: d.apply_link,
        }
      : null;
  return {
    entry,
    slug,
    category,
    path: `${categoryByKey[category].path}${slug}/`,
    title: d.title,
    summary: d.summary,
    extraCategories: d.extra_categories ?? [],
    gradeBands: d.grade_band,
    streams: d.streams ?? [],
    tags,
    tagsByGroup,
    countries: (d.countries ?? []).filter((c: string) => countryBySlug[c]),
    parentSummary: d.parent_summary,
    officialLinks: d.official_links ?? [],
    keyDates: ((d.key_dates ?? []) as { date: Date; label: string; note?: string; url?: string }[])
      .map((k) => ({ date: toDateString(k.date), label: k.label, note: k.note, url: k.url }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    coverImage: d.cover_image ?? null,
    coverAlt: d.cover_alt ?? '',
    imageCredit: d.image_credit,
    author: d.author,
    reviewedBy: d.reviewed_by,
    lastChecked: d.last_checked,
    publishedDate: d.published_date,
    status: d.status,
    readingMinutes: readingMinutes(entry.body ?? ''),
    opportunity,
    body: entry.body ?? '',
  };
}

let cache: Post[] | null = null;
let warned = false;

/** Every post in every collection, drafts included. */
export async function getAllPosts(): Promise<Post[]> {
  if (cache) return cache;
  const [a, b, c, d, e] = await Promise.all([
    getCollection('careers'),
    getCollection('opportunities'),
    getCollection('courses'),
    getCollection('countries'),
    getCollection('universities'),
  ]);
  cache = [...a, ...b, ...c, ...d, ...e].map(normalise);

  // Build warning (PRD 13): published posts with nobody in reviewed_by.
  if (!warned) {
    warned = true;
    const unreviewed = cache.filter((p) => p.status === 'published' && !p.reviewedBy);
    if (unreviewed.length) {
      console.warn(
        `\n[Future Pathways] ${unreviewed.length} published post(s) have no reviewer (reviewed_by is empty):\n` +
          unreviewed.map((p) => `  - ${p.title} (${p.path})`).join('\n') +
          '\n',
      );
    }
  }
  return cache;
}

/** Posts shown on the site: published ones, plus drafts while running `npm run dev`. */
export async function getVisiblePosts(): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.status === 'published' || SHOW_DRAFTS);
}

export function byNewest(a: Post, b: Post): number {
  return b.publishedDate.getTime() - a.publishedDate.getTime() || a.title.localeCompare(b.title);
}

/** Posts listed under a category: main category OR extra categories (PRD 6.2). */
export function postsInCategory(posts: Post[], category: CategoryKey): Post[] {
  return posts.filter((p) => p.category === category || p.extraCategories.includes(category)).sort(byNewest);
}

export function postsWithTag(posts: Post[], tagSlug: string): Post[] {
  return posts.filter((p) => p.tags.some((t) => t.slug === tagSlug)).sort(byNewest);
}

export function toCard(p: Post): CardData {
  return {
    slug: p.slug,
    path: p.path,
    title: p.title,
    summary: p.summary,
    category: p.category,
    extraCategories: p.extraCategories,
    gradeBands: p.gradeBands,
    streams: p.streams,
    tags: p.tags.map((t) => t.slug),
    countries: p.countries,
    readingMinutes: p.readingMinutes,
    publishedDate: toDateString(p.publishedDate),
    lastChecked: toDateString(p.lastChecked),
    deadline: p.opportunity?.deadline ?? null,
    rolling: p.opportunity?.rolling ?? false,
    nextDate: nextDateOf(p),
    opportunityType: p.opportunity?.type ?? null,
    mode: p.opportunity?.mode ?? null,
    cost: p.opportunity?.cost ?? null,
    draft: p.status === 'draft',
  };
}

/** The date a card should badge: the opportunity deadline, else the nearest key date today or later, else null. */
export function nextDateOf(p: Post, today = istTodayString()): string | null {
  if (p.opportunity?.deadline) return p.opportunity.deadline;
  const upcoming = p.keyDates.filter((k) => k.date >= today);
  return upcoming.length ? upcoming[0].date : null;
}

/** Every dated item on the site: opportunity deadlines plus key dates, for the Deadlines page and the home strip. */
export interface DatedItem {
  date: string;
  label: string;
  note?: string;
  url?: string;
  post: Post;
  kind: 'deadline' | 'key-date';
}

export function allDatedItems(posts: Post[]): DatedItem[] {
  const items: DatedItem[] = [];
  for (const p of posts) {
    if (p.opportunity?.deadline && !p.opportunity.rolling) {
      items.push({ date: p.opportunity.deadline, label: 'Application deadline', note: p.opportunity.deadlineNote, url: p.opportunity.applyLink, post: p, kind: 'deadline' });
    }
    for (const k of p.keyDates) items.push({ ...k, post: p, kind: 'key-date' });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || a.post.title.localeCompare(b.post.title));
}

/** Related posts (PRD 6.3, 7.5): shared category first, then most shared tags. */
export function relatedPosts(post: Post, all: Post[], limit = 3): Post[] {
  const cats = new Set([post.category, ...post.extraCategories]);
  const tagSet = new Set(post.tags.map((t) => t.slug));
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const sharedCat = [p.category, ...p.extraCategories].some((c) => cats.has(c)) ? 1 : 0;
      const sharedTags = p.tags.filter((t) => tagSet.has(t.slug)).length;
      return { p, score: sharedCat * 10 + sharedTags };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.p, b.p))
    .slice(0, limit)
    .map((x) => x.p);
}

/** Months since last_checked, using IST "today". */
export function monthsSince(date: Date, today = istToday()): number {
  const y = today.getUTCFullYear() - date.getUTCFullYear();
  const m = today.getUTCMonth() - date.getUTCMonth();
  const dd = today.getUTCDate() - date.getUTCDate();
  return y * 12 + m - (dd < 0 ? 1 : 0);
}

/** Today's calendar date in IST, as a UTC-midnight Date (so it compares with frontmatter dates). */
export function istToday(): Date {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00Z') : d;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const gradeBandLabel: Record<string, string> = {
  '6-8': 'Grades 6–8',
  '9-10': 'Grades 9–10',
  '11-12': 'Grades 11–12',
};

export const streamLabel: Record<string, string> = {
  science: 'Science',
  commerce: 'Commerce',
  humanities: 'Humanities',
  any: 'Any stream',
};

export const opportunityTypeLabel: Record<string, string> = {
  internship: 'Internship',
  'summer-programme': 'Summer programme',
  competition: 'Competition',
  webinar: 'Webinar',
  scholarship: 'Scholarship',
  other: 'Opportunity',
};
