// Tags, categories and countries with their search words, for "as you type"
// suggestions in the search boxes (PRD 8). Only tags with at least one visible post.
import type { APIRoute } from 'astro';
import { getVisiblePosts } from '../lib/content';
import { tags, tagGroupNames, countries } from '../lib/data';
import { categories } from '../config/site';

export const GET: APIRoute = async () => {
  const posts = await getVisiblePosts();
  const tagCounts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) tagCounts.set(t.slug, (tagCounts.get(t.slug) ?? 0) + 1);
  const countryCounts = new Map<string, number>();
  for (const p of posts) for (const c of p.countries) countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);

  const items = [
    ...categories.map((c) => ({
      kind: 'category',
      slug: c.key,
      name: c.name,
      group: 'Category',
      path: c.path,
      search: [c.shortName],
      count: posts.filter((p) => p.category === c.key || p.extraCategories.includes(c.key)).length,
    })),
    ...tags
      .filter((t) => tagCounts.get(t.slug))
      .map((t) => ({
        kind: 'tag',
        slug: t.slug,
        name: t.name,
        group: tagGroupNames[t.group],
        path: `/tags/${t.slug}/`,
        search: t.search,
        count: tagCounts.get(t.slug) ?? 0,
      })),
    ...countries
      .filter((c) => countryCounts.get(c.slug))
      .map((c) => ({
        kind: 'country',
        slug: c.slug,
        name: c.name,
        group: 'Country',
        path: `/search/?country=${c.slug}`,
        search: c.search,
        count: countryCounts.get(c.slug) ?? 0,
      })),
  ];
  return new Response(JSON.stringify({ items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
