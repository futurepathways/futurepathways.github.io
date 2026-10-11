// Loads the fixed lists (PRD 7.3) from src/data/*.yml at build time.
import { load as loadYaml } from 'js-yaml';
// The YAML files are inlined at build time, so this works in dev, build and prerender.
import tagsRaw from '../data/tags.yml?raw';
import countriesRaw from '../data/countries.yml?raw';

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

interface TagsFile {
  groups: Record<TagGroupKey, string>;
  tags: Array<Partial<Tag> & { slug: string; name: string; group: TagGroupKey }>;
}
interface CountriesFile {
  countries: Array<Partial<Country> & { slug: string; name: string }>;
}

const tagsFile = loadYaml(tagsRaw) as TagsFile;
const countriesFile = loadYaml(countriesRaw) as CountriesFile;

export const tagGroupOrder: TagGroupKey[] = ['subject', 'exam', 'skill', 'level', 'audience'];
export const tagGroupNames: Record<TagGroupKey, string> = tagsFile.groups;

export const tags: Tag[] = tagsFile.tags.map((t) => ({
  slug: t.slug,
  name: t.name,
  group: t.group,
  description: t.description ?? '',
  search: t.search ?? [],
}));

export const tagBySlug: Record<string, Tag> = Object.fromEntries(tags.map((t) => [t.slug, t]));

export const tagSlugsByGroup: Record<TagGroupKey, string[]> = {
  subject: [],
  exam: [],
  skill: [],
  level: [],
  audience: [],
};
for (const t of tags) tagSlugsByGroup[t.group].push(t.slug);

export const countries: Country[] = countriesFile.countries.map((c) => ({
  slug: c.slug,
  name: c.name,
  search: c.search ?? [],
}));

export const countryBySlug: Record<string, Country> = Object.fromEntries(countries.map((c) => [c.slug, c]));

// Sanity checks on the lists themselves, so a typo in tags.yml fails loudly.
{
  const seen = new Set<string>();
  for (const t of tags) {
    if (seen.has(t.slug)) throw new Error(`tags.yml: the tag slug "${t.slug}" appears twice.`);
    seen.add(t.slug);
    if (!tagGroupNames[t.group]) {
      throw new Error(`tags.yml: tag "${t.slug}" has group "${t.group}", which is not one of ${tagGroupOrder.join(', ')}.`);
    }
    if (!/^[a-z0-9-]+$/.test(t.slug)) throw new Error(`tags.yml: tag slug "${t.slug}" may only use lowercase letters, numbers and hyphens.`);
  }
  const seenC = new Set<string>();
  for (const c of countries) {
    if (seenC.has(c.slug)) throw new Error(`countries.yml: the country slug "${c.slug}" appears twice.`);
    seenC.add(c.slug);
  }
}
