// Writes .pages.yml, the Pages CMS configuration (PRD Section 4, Phase 6).
// Run `npm run cms` after changing the fields below. Niranjan never needs to run this:
// tags and countries are edited inside Pages CMS as collections, so no regeneration is needed.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dump } from 'js-yaml';

const categories = [
  { key: 'careers', label: 'Careers', template: 'Careers' },
  { key: 'opportunities', label: 'Internships & Opportunities', template: 'Opportunities' },
  { key: 'courses', label: 'Courses', template: 'Courses' },
  { key: 'countries', label: 'Countries', template: 'Countries' },
  { key: 'universities', label: 'Universities', template: 'Universities' },
];

const categoryValues = categories.map((c) => ({ name: c.key, label: c.label }));

const tagRef = (group, label, description, extra = {}) => ({
  name: `tags_${group}`,
  label,
  type: 'reference',
  description,
  options: {
    collection: `tags-${group}`,
    multiple: true,
    search: 'name,fields.title,fields.search',
    value: '{name}',
    label: '{fields.title}',
    ...extra,
  },
});

// Fields every post has (PRD 7.1), in the order Niranjan should fill them.
const commonFields = (cat) => [
  { name: 'title', label: 'Title', type: 'string', required: true, description: 'The heading of the post. Plain and clear.' },
  {
    name: 'summary',
    label: 'Summary',
    type: 'text',
    required: true,
    description: 'One or two sentences for the card and search results. At most 160 characters.',
    options: { maxlength: 160, rows: 2 },
  },
  {
    name: 'main_category',
    label: 'Main category',
    type: 'select',
    required: true,
    default: cat.key,
    readonly: true,
    description: 'Set by the folder this post is in. Do not change.',
    options: { values: categoryValues },
  },
  {
    name: 'extra_categories',
    label: 'Also show in (optional)',
    type: 'select',
    description: 'Up to 2 other categories this post also belongs to. Not the main category.',
    options: { multiple: true, max: 2, values: categoryValues },
  },
  {
    name: 'grade_band',
    label: 'Grade band',
    type: 'select',
    required: true,
    description: 'Pick every grade band this post is for. At least one.',
    options: {
      multiple: true,
      min: 1,
      values: [
        { name: '6-8', label: 'Grades 6 to 8' },
        { name: '9-10', label: 'Grades 9 and 10' },
        { name: '11-12', label: 'Grades 11 and 12' },
      ],
    },
  },
  {
    name: 'streams',
    label: 'Stream (optional)',
    type: 'select',
    description: 'Which streams this post suits. "Any stream" shows it under every stream filter.',
    options: {
      multiple: true,
      values: [
        { name: 'science', label: 'Science' },
        { name: 'commerce', label: 'Commerce' },
        { name: 'humanities', label: 'Humanities' },
        { name: 'any', label: 'Any stream' },
      ],
    },
  },
  tagRef('subject', 'Tags: Subject area', 'Pick at least one. What field is this post about?', { min: 1 }),
  tagRef('exam', 'Tags: Entrance exam (optional)', 'Tests mentioned in the post.'),
  tagRef('skill', 'Tags: Skill (optional)', 'Skills the post helps build.'),
  tagRef('level', 'Tags: Study level (optional)', 'Where the student is headed: school, undergraduate, postgraduate, diploma.'),
  tagRef('audience', 'Tags: Audience (optional)', 'Who the post speaks to. Add "Parents" if it is written for parents. All tag fields together: 3 to 8 tags.'),
  {
    name: 'countries',
    label: 'Countries (optional)',
    type: 'reference',
    description: 'Countries the post is about.',
    options: { collection: 'country-list', multiple: true, search: 'name,fields.title,fields.search', value: '{name}', label: '{fields.title}' },
  },
  {
    name: 'parent_summary',
    label: 'For Parents box',
    type: 'text',
    required: true,
    description:
      '2 to 4 plain sentences for parents: what this is, rough cost, the key date, and one question to ask the FP counsellor.',
    options: { rows: 4 },
  },
  {
    name: 'official_links',
    label: 'Official links (optional)',
    type: 'object',
    list: true,
    description: 'The official pages a reader should check before applying or paying.',
    fields: [
      { name: 'label', label: 'Link text', type: 'string', required: true },
      { name: 'url', label: 'Web address', type: 'string', required: true, pattern: '^https?://' },
    ],
  },
  {
    name: 'key_dates',
    label: 'Key dates (optional)',
    type: 'object',
    list: true,
    description: 'Important dates in this post: application windows, test dates, decisions. They appear on the post, on its card and on the Upcoming Deadlines page.',
    fields: [
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'label', label: 'What happens', type: 'string', required: true, description: 'For example: UCAS deadline for Medicine' },
      { name: 'note', label: 'Note (optional)', type: 'string', description: 'For example: 6 pm UK time, 10:30 pm in India' },
      { name: 'url', label: 'Official page (optional)', type: 'string', pattern: '^https?://' },
    ],
  },
  {
    name: 'cover_image',
    label: 'Cover image (optional)',
    type: 'image',
    description: 'Only free stock photos (Unsplash, Pexels) or TIPS photos with permission. Leave empty to use the category picture.',
    options: { media: 'images', path: 'posts', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  },
  {
    name: 'cover_alt',
    label: 'Cover image description',
    type: 'string',
    description: 'Required if there is a cover image. Describe the picture in plain words for people who cannot see it.',
  },
  { name: 'image_credit', label: 'Image credit (optional)', type: 'string', description: 'For example: Photo by Jane Doe on Unsplash.' },
  { name: 'author', label: 'Written by', type: 'string', description: 'The counsellor who wrote the post.' },
  {
    name: 'reviewed_by',
    label: 'Checked by',
    type: 'string',
    description: 'The counsellor who checked every fact, figure and link. A post should not be published without this.',
  },
  { name: 'last_checked', label: 'Last checked', type: 'date', required: true, description: 'The date the facts were last checked.' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    default: 'draft',
    description: 'Drafts are saved but not shown on the site. Switch to Published when it is checked and ready.',
    options: {
      values: [
        { name: 'draft', label: 'Draft (not on the site)' },
        { name: 'published', label: 'Published (live)' },
      ],
    },
  },
  { name: 'published_date', label: 'Published on', type: 'date', required: true, description: 'Used to order posts, newest first.' },
  {
    name: 'body',
    label: 'Post text',
    type: 'rich-text',
    description: `Follow the ${cat.template} template headings. Mark every fee, salary, cut-off and deadline "approximate" and link the official page.`,
    options: { media: 'images', path: 'posts' },
  },
];

const opportunityFields = [
  {
    name: 'opportunity_type',
    label: 'Type',
    type: 'select',
    required: true,
    default: 'other',
    options: {
      values: [
        { name: 'internship', label: 'Internship' },
        { name: 'summer-programme', label: 'Summer programme' },
        { name: 'competition', label: 'Competition' },
        { name: 'webinar', label: 'Webinar' },
        { name: 'scholarship', label: 'Scholarship' },
        { name: 'other', label: 'Other' },
      ],
    },
  },
  {
    name: 'deadline',
    label: 'Deadline (optional)',
    type: 'date',
    description: 'The last date to apply. Treated as 11:59 PM India time on that day. Leave empty if rolling.',
  },
  {
    name: 'deadline_note',
    label: 'Deadline note (optional)',
    type: 'string',
    description: 'For example: Closes 11:59 PM US Eastern time, which is the next morning in India.',
  },
  { name: 'rolling', label: 'No fixed deadline (rolling)', type: 'boolean', default: false },
  { name: 'event_dates', label: 'Event dates (optional)', type: 'string', description: 'Free text, for example: 15 to 30 June 2027.' },
  {
    name: 'mode',
    label: 'Mode',
    type: 'select',
    options: { values: [{ name: 'online', label: 'Online' }, { name: 'in-person', label: 'In person' }, { name: 'hybrid', label: 'Hybrid' }] },
  },
  { name: 'cost', label: 'Cost', type: 'select', options: { values: [{ name: 'free', label: 'Free' }, { name: 'paid', label: 'Paid' }] } },
  { name: 'apply_link', label: 'Apply link (optional)', type: 'string', pattern: '^https?://', description: 'The official page where a student applies.' },
];

function collection(cat) {
  let fields = commonFields(cat);
  if (cat.key === 'opportunities') {
    // put the opportunity fields right after the streams field
    const i = fields.findIndex((f) => f.name === 'streams') + 1;
    fields = [...fields.slice(0, i), ...opportunityFields, ...fields.slice(i)];
  }
  return {
    name: cat.key,
    label: cat.label,
    type: 'collection',
    path: `src/content/${cat.key}`,
    exclude: ['_*'],
    filename: { template: '{title}.md', field: 'create' },
    view: {
      fields: ['title', 'status', 'published_date', 'reviewed_by'],
      primary: 'title',
      sort: ['published_date', 'title'],
      default: { sort: 'published_date', order: 'desc' },
    },
    fields,
  };
}

const tagCollection = (group, label, hint) => ({
  name: `tags-${group}`,
  label: `Tags: ${label}`,
  type: 'collection',
  path: `src/data/tags/${group}`,
  format: 'yaml',
  exclude: ['_*'],
  filename: { template: '{slug}.yml', field: 'create' },
  view: { fields: ['title', 'description'], primary: 'title', sort: ['title'] },
  fields: [
    {
      name: 'slug',
      label: 'Slug (file name)',
      type: 'string',
      required: true,
      pattern: '^[a-z0-9-]+$',
      description: 'Lowercase letters, numbers and hyphens only, for example data-ai. Becomes the file name and the web address. Never change it later.',
    },
    { name: 'title', label: 'Tag name', type: 'string', required: true, description: 'What students see, for example Data and AI.' },
    { name: 'description', label: 'One line description', type: 'string', description: `Shown on the tag page. ${hint}` },
    {
      name: 'search',
      label: 'Search words',
      type: 'string',
      list: true,
      description: 'Other words students might type for this tag, for example "artificial intelligence". Used only by search.',
    },
  ],
});

const config = {
  media: [
    {
      name: 'images',
      label: 'Images',
      input: 'src/images/uploads',
      output: '../../images/uploads',
      extensions: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      rename: 'safe',
    },
  ],
  content: [
    ...categories.map(collection),
    tagCollection('subject', 'Subject area', 'The field the post is about.'),
    tagCollection('exam', 'Entrance exam', 'A test students sit.'),
    tagCollection('skill', 'Skill', 'A skill the post helps build.'),
    tagCollection('level', 'Study level', 'Where the student is headed.'),
    tagCollection('audience', 'Audience', 'Who the post speaks to.'),
    {
      name: 'country-list',
      label: 'Countries (list)',
      type: 'collection',
      path: 'src/data/countries',
      format: 'yaml',
      exclude: ['_*'],
      filename: { template: '{slug}.yml', field: 'create' },
      view: { fields: ['title'], primary: 'title', sort: ['title'] },
      fields: [
        { name: 'slug', label: 'Slug (file name)', type: 'string', required: true, pattern: '^[a-z0-9-]+$', description: 'For example united-kingdom. Never change it later.' },
        { name: 'title', label: 'Country name', type: 'string', required: true },
        { name: 'search', label: 'Search words', type: 'string', list: true, description: 'Other names, for example uk, britain, england.' },
      ],
    },
    {
      name: 'start',
      label: 'Start here by grade',
      type: 'file',
      path: 'src/data/start.yml',
      format: 'yaml',
      fields: [
        {
          name: 'bands',
          label: 'Grade bands',
          type: 'object',
          list: true,
          fields: [
            { name: 'key', label: 'Band', type: 'string', readonly: true },
            { name: 'title', label: 'Title', type: 'string', required: true },
            { name: 'intro', label: 'Intro (3 to 5 sentences)', type: 'text', required: true, options: { rows: 5 } },
            {
              name: 'read_first',
              label: 'Read these first (post file names, up to 6)',
              type: 'string',
              list: true,
              description: 'The file name of a post without .md, for example becoming-a-doctor.',
            },
          ],
        },
      ],
    },
  ],
};

const out = fileURLToPath(new URL('../.pages.yml', import.meta.url));
const header = `# Pages CMS configuration for Future Pathways (https://pagescms.org).
# Generated by scripts/make-pages-config.mjs. Edit that file and run \`npm run cms\`; do not edit this file by hand.
`;
writeFileSync(out, header + dump(config, { lineWidth: 120, noRefs: true }), 'utf8');
console.log('wrote .pages.yml');
