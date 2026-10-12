// Site-wide values. The live URL and base path live in astro.config.mjs (PRD 5.1).

export const site = {
  name: 'Future Pathways',
  tagline: 'Careers, courses, countries and opportunities, explained simply for TIPS students and parents.',
  teamName: 'TIPS FP (Future Pathway) team',
  contactEmail: 'fperdintl@tipseindia.com',
  schoolName: 'The Indian Public School',
  // GoatCounter is off until Madan decides (PRD Section 16, item 3).
  // When on, set this to the GoatCounter site code, e.g. 'futurepathways'.
  goatCounterCode: '',
} as const;

export type CategoryKey = 'careers' | 'opportunities' | 'courses' | 'countries' | 'universities';

export interface CategoryInfo {
  key: CategoryKey;
  name: string;
  shortName: string;
  path: string;
  blurb: string;
}

// Order here is the order used in the menu, the home page and the footer.
export const categories: CategoryInfo[] = [
  {
    key: 'careers',
    name: 'Careers',
    shortName: 'Careers',
    path: '/careers/',
    blurb: 'What a career is, how to get into it and what to study.',
  },
  {
    key: 'opportunities',
    name: 'Internships & Opportunities',
    shortName: 'Opportunities',
    path: '/opportunities/',
    blurb: 'Internships, summer programmes, competitions and webinars, with deadlines.',
  },
  {
    key: 'courses',
    name: 'Courses',
    shortName: 'Courses',
    path: '/courses/',
    blurb: 'Degree courses and where they lead.',
  },
  {
    key: 'countries',
    name: 'Countries',
    shortName: 'Countries',
    path: '/countries/',
    blurb: 'Studying in another country: costs, tests, visas and scholarships.',
  },
  {
    key: 'universities',
    name: 'Universities',
    shortName: 'Universities',
    path: '/universities/',
    blurb: 'One university at a time: entry rules, fees, dates and what parents should know.',
  },
];

export const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c])) as Record<
  CategoryKey,
  CategoryInfo
>;

export const gradeBands = [
  { key: '6-8', label: 'Grades 6 to 8', short: '6–8', path: '/start/grades-6-8/' },
  { key: '9-10', label: 'Grades 9 and 10', short: '9–10', path: '/start/grades-9-10/' },
  { key: '11-12', label: 'Grades 11 and 12', short: '11–12', path: '/start/grades-11-12/' },
] as const;

export interface NavItem {
  label: string;
  path: string;
}

// Main menu. Items whose pages are built in later phases are still listed so the
// menu does not change shape between phases.
export const mainNav: NavItem[] = [
  ...categories.map((c) => ({ label: c.shortName, path: c.path })),
  { label: 'Deadlines', path: '/deadlines/' },
  { label: 'For Parents', path: '/parents/' },
  { label: 'Start here', path: '/start/' },
  { label: 'Tags', path: '/tags/' },
  { label: 'About', path: '/about/' },
];
