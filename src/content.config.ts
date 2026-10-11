// Content collections (PRD Section 7). One collection per category folder.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { tagBySlug, tagSlugsByGroup, countryBySlug, tagGroupNames } from './lib/data';

export const categoryKeys = ['careers', 'opportunities', 'courses', 'countries'] as const;
export type CategoryKey = (typeof categoryKeys)[number];

const categoryEnum = z.enum(categoryKeys);
const gradeBandEnum = z.enum(['6-8', '9-10', '11-12']);
const streamEnum = z.enum(['science', 'commerce', 'humanities', 'any']);

const tagList = (group: keyof typeof tagSlugsByGroup) =>
  z
    .array(z.string())
    .default([])
    .superRefine((list, ctx) => {
      for (const slug of list) {
        const tag = tagBySlug[slug];
        if (!tag) {
          ctx.addIssue({
            code: 'custom',
            message: `uses the tag "${slug}", which is not in src/data/tags.yml. Add it to the list or pick an existing tag.`,
          });
        } else if (tag.group !== group) {
          ctx.addIssue({
            code: 'custom',
            message: `has the tag "${slug}" under ${tagGroupNames[group]}, but it belongs to ${tagGroupNames[tag.group]}. Move it to tags_${tag.group}.`,
          });
        }
      }
    });

const commonFields = {
  title: z.string().min(3),
  summary: z.string().max(160, 'summary must be 160 characters or fewer'),
  main_category: categoryEnum,
  extra_categories: z.array(categoryEnum).max(2, 'a post can have at most 2 extra categories').default([]),
  grade_band: z.array(gradeBandEnum).min(1, 'pick at least one grade band'),
  streams: z.array(streamEnum).default([]),
  tags_subject: tagList('subject'),
  tags_exam: tagList('exam'),
  tags_skill: tagList('skill'),
  tags_level: tagList('level'),
  tags_audience: tagList('audience'),
  countries: z
    .array(z.string())
    .default([])
    .superRefine((list, ctx) => {
      for (const slug of list) {
        if (!countryBySlug[slug]) {
          ctx.addIssue({
            code: 'custom',
            message: `uses the country "${slug}", which is not in src/data/countries.yml.`,
          });
        }
      }
    }),
  parent_summary: z.string().min(20, 'parent_summary needs 2 to 4 plain sentences'),
  official_links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  cover_alt: z.string().optional(),
  image_credit: z.string().optional(),
  author: z.string().optional(),
  reviewed_by: z.string().optional(),
  last_checked: z.coerce.date(),
  status: z.enum(['draft', 'published']).default('draft'),
  published_date: z.coerce.date(),
};

const opportunityFields = {
  opportunity_type: z
    .enum(['internship', 'summer-programme', 'competition', 'webinar', 'scholarship', 'other'])
    .default('other'),
  deadline: z.coerce.date().optional(),
  deadline_note: z.string().optional(),
  rolling: z.boolean().default(false),
  event_dates: z.string().optional(),
  mode: z.enum(['online', 'in-person', 'hybrid']).optional(),
  cost: z.enum(['free', 'paid']).optional(),
  apply_link: z.string().url().optional(),
};

type Common = z.infer<z.ZodObject<typeof commonFields>>;

// Rules checked at build time (PRD 7.3, 7.5). Messages name the post and the problem.
function checkPost(category: CategoryKey) {
  return (post: Common, ctx: z.RefinementCtx) => {
    const name = `"${post.title}"`;
    if (post.main_category !== category) {
      ctx.addIssue({
        code: 'custom',
        path: ['main_category'],
        message: `${name} is in the ${category} folder but has main_category "${post.main_category}". These must match.`,
      });
    }
    if (post.extra_categories.includes(post.main_category)) {
      ctx.addIssue({
        code: 'custom',
        path: ['extra_categories'],
        message: `${name} lists its main category "${post.main_category}" as an extra category too. Remove it from extra_categories.`,
      });
    }
    if (new Set(post.extra_categories).size !== post.extra_categories.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['extra_categories'],
        message: `${name} repeats an extra category.`,
      });
    }
    const all = [
      ...post.tags_subject,
      ...post.tags_exam,
      ...post.tags_skill,
      ...post.tags_level,
      ...post.tags_audience,
    ];
    const problems: string[] = [];
    if (post.tags_subject.length === 0) problems.push('needs at least one Subject area tag');
    if (all.length < 3) problems.push(`has only ${all.length} tag${all.length === 1 ? '' : 's'}; it needs at least 3`);
    if (all.length > 8) problems.push(`has ${all.length} tags; the most allowed is 8`);
    if (new Set(all).size !== all.length) problems.push('repeats a tag');
    if (post.cover_alt === undefined && (post as any).cover_image) {
      problems.push('has a cover image but no cover_alt text');
    }
    if (problems.length) {
      const message = `${name} ${problems.join(', and ')}.`;
      if (post.status === 'published') {
        ctx.addIssue({ code: 'custom', path: ['tags_subject'], message });
      } else {
        console.warn(`[draft warning] ${message}`);
      }
    }
  };
}

function makeCollection(category: CategoryKey, extra: Record<string, z.ZodTypeAny> = {}) {
  return defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: `./src/content/${category}` }),
    schema: ({ image }) =>
      z
        .object({ ...commonFields, ...extra, cover_image: image().optional() })
        .superRefine(checkPost(category) as any),
  });
}

export const collections = {
  careers: makeCollection('careers'),
  opportunities: makeCollection('opportunities', opportunityFields),
  courses: makeCollection('courses'),
  countries: makeCollection('countries'),
};
