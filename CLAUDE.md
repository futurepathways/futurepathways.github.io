# CLAUDE.md — Future Pathways

Future Pathways (https://futurepathways.github.io) is Madan Kumar PC's own guidance site for school students and parents in India. The source of truth is `Future_Pathways_PRD_v2.0.md`, kept one folder above this repository and not committed. This file carries the rules that travel with the code.

## Project notes

- Astro 7 static site, no framework islands. Plain `.astro` components, vanilla TypeScript in `<script>` tags. Markdown uses Astro's default processor (no rehype plugins).
- Scripts: `npm run dev` (drafts visible with a banner), `npm run build` (what GitHub Actions runs; drafts hidden), `npm run build:drafts` then `npm run preview` (review drafts as a built site), `npm run check` (types), `npm run images` (preview images), `npm run cms` (regenerate `.pages.yml`), `python scripts/make-templates.py` (Word templates).
- Live URL and base path live only in `astro.config.mjs`. Site name, owner, contact email and contact page live in `src/config/site.ts`.
- Content: five collections under `src/content/` (careers, opportunities, courses, countries, universities). Tags are one YAML file each under `src/data/tags/<group>/`; countries under `src/data/countries/`; curated grade lists in `src/data/start.yml`; the Roadmaps tool data in `src/data/roadmaps.yml`. All are edited in Pages CMS.
- Build checks live in `src/content.config.ts`: unknown tag or country, wrong tag group, 3 to 8 tags with at least one Subject area tag for published posts, main category must match the folder, `cover_alt` required with a cover image. Drafts only get a console warning for tag counts. `src/lib/roadmaps.ts` checks the roadmap data the same way.
- Listings: the first 12 cards are in the HTML; `src/scripts/listing.ts` builds the rest from `/index.json` with `src/scripts/cards.ts` when a reader filters, pages, searches or taps "Show all". Card styles live in `src/styles/global.css` so both match.
- Search: Pagefind indexes post pages (`data-pagefind-body`); tag names, search words and category names are inside each post page.
- Dates: everything in IST. `src/lib/deadlines.ts` holds the badge rules; `key_dates` on any post feed the Deadlines page.

## Rules

- Plain, friendly English a Grade 6 student and parent can follow. First person is fine; the site is written by one person. Gloss jargon on first use.
- Nothing specific to one school. Tamil Nadu examples are welcome. No private information in any post, even a draft (the repository is public).
- Every fee, salary, cut-off and deadline is approximate, with a year and an official link.
- Claude drafts content for Madan's review and fact-checks every figure and date against the official source first, noting anything it could not verify (decision 47).
- Verify changes with `npm run build`, then a preview at 360 px wide and at desktop width, before committing. Use `npx astro preview stop` if a stale preview blocks a port.
- Commit from Madan's personal account; push to `main` deploys.

## Decisions log (summary)

Decisions 1 to 42 are in PRD v1.5 and still apply unless superseded. New in v2.0:

| # | Decision |
|---|---|
| 43 | Listings render the first 12 cards; the rest load from `/index.json` on demand |
| 44 | The site is Madan's own; all school, campus and programme-team references removed; contact is pcmadankumar@gmail.com and the portfolio contact page; the Tamil Nadu angle stays |
| 45 | Reviewer quick fixes of 18 Oct 2026 applied (overflow, spaces, dates, one search box, labels, aria, new-tab links, jump links, curated Start lists) |
| 46 | Tags with no published post are removed; add a tag when a post needs it |
| 47 | Claude drafts and fact-checks content for Madan's review (supersedes 8 and 32) |

Road map: Round 1 AI layer and roadmap data fields; Round 2 Batch 1 roles; Round 3 Batch 2 roles, quiz, print; Round 4 glossary, Careers split, NEET and stream-choice posts. See PRD v2.0 Section 22.
