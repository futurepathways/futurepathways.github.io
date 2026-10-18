// Loads the fixed lists (PRD 7.3): one YAML file per tag (grouped by folder) and per country.
// Pages CMS edits these folders as collections, so a tag or country can be added without code.
import { load as loadYaml } from 'js-yaml';

export type TagGroupKey = 'subject' | 'exam' | 'skill' | 'level' | 'audience';

export interface Tag {
  slug: string;
  name: string;
  group: TagGroupKey;
  description: string;
  search: string[];
}

export interface Country {
  slug: string;
  name: string;
  search: string[];
}

interface Entry {
  title?: string;
  name?: string;
  description?: string;
  search?: string[];
}

export const tagGroupOrder: TagGroupKey[] = ['subject', 'exam', 'skill', 'level', 'audience'];
export const tagGroupNames: Record<TagGroupKey, string> = {
  subject: 'Subject area',
  exam: 'Entrance exam',
  skill: 'Skill',
  level: 'Study level',
  audience: 'Audience',
};

// The YAML files are inlined at build time, so this works in dev, build and prerender.
const tagFiles = import.meta.glob('../data/tags/*/*.yml', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;
const countryFiles = import.meta.glob('../data/countries/*.yml', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

function parse(path: string, raw: string): Entry {
  try {
    return (loadYaml(raw) as Entry) ?? {};
  } catch (e) {
    throw new Error(`${path} is not valid YAML: ${(e as Error).message}`);
  }
}

export const tags: Tag[] = Object.entries(tagFiles)
  .map(([path, raw]) => {
    const m = path.match(/\/tags\/([a-z]+)\/([^/]+)\.yml$/);
    if (!m) throw new Error(`Unexpected tag file path: ${path}`);
    const group = m[1] as TagGroupKey;
    const slug = m[2];
    const e = parse(path, raw);
    if (!tagGroupNames[group]) {
      throw new Error(`Tag file ${path} is in folder "${group}", which is not one of ${tagGroupOrder.join(', ')}.`);
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`Tag file name "${slug}" may only use lowercase letters, numbers and hyphens.`);
    }
    const name = (e.title ?? e.name ?? '').trim();
    if (!name) throw new Error(`Tag file ${path} has no title.`);
    return { slug, name, group, description: e.description ?? '', search: e.search ?? [] };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const tagBySlug: Record<string, Tag> = Object.fromEntries(tags.map((t) => [t.slug, t]));

export const tagSlugsByGroup: Record<TagGroupKey, string[]> = {
  subject: [],
  exam: [],
  skill: [],
  level: [],
  audience: [],
};
for (const t of tags) tagSlugsByGroup[t.group].push(t.slug);

export const countries: Country[] = Object.entries(countryFiles)
  .map(([path, raw]) => {
    const slug = path.match(/\/countries\/([^/]+)\.yml$/)![1];
    const e = parse(path, raw);
    const name = (e.title ?? e.name ?? '').trim();
    if (!name) throw new Error(`Country file ${path} has no title.`);
    return { slug, name, search: e.search ?? [] };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const countryBySlug: Record<string, Country> = Object.fromEntries(countries.map((c) => [c.slug, c]));
