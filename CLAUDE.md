# CLAUDE.md — Future Pathways

Copy of Section 0 and Section 18 of the PRD (Future_Pathways_PRD_v1.5.md, kept outside this repo).
The full PRD is the source of truth; this file exists so the rules travel with the code.

## Project notes

- Astro 7 static site, no framework islands. Plain `.astro` components, vanilla TypeScript in `<script>` tags.
- Run and preview locally with `npm run dev` and `npm run preview` (Windows PowerShell).
- Live URL and base path live only in `astro.config.mjs`. Site name, team name and contact email live in `src/config/site.ts`.
- Build phases and "done when" rules are in PRD Section 14. Stop at the end of each phase for Madan to check.
- Scripts: `npm run dev` (drafts visible, Draft banner), `npm run build` (what GitHub Actions runs; drafts hidden), `npm run build:drafts` then `npm run preview` (review drafts as a built site), `npm run check` (types), `npm run images` (regenerate preview images).
- Drafts are only ever shown in dev and in the drafts build. The live site never shows them.
- Search: Pagefind indexes post pages (`data-pagefind-body`); tag names, tag search words and category names are inside each post page so they are searchable. Filters and sorting run over cards already in the page (`src/scripts/listing.ts`), including on the Search page (decision 29).
- Build checks live in `src/content.config.ts`: unknown tag or country, wrong tag group, tag count (3 to 8, at least one Subject area) for published posts, main category must match the folder, `cover_alt` required with a cover image. Drafts only get a console warning for tag counts.

## 0. Instructions for Claude Code

Read this whole file before writing any code. Build in the phase order in Section 14 and stop at the end of each phase for Madan to check. Do not invent features that are not in this document. Section 18 lists decisions already made; do not reopen them. If something is still unclear, ask before building it.

**Time rule:** Any date or time logic (deadlines, "closing soon", scheduled rebuilds) must use IST (Asia/Kolkata, UTC+5:30). Never guess the current time. In a shell, run `TZ="Asia/Kolkata" date`. In the browser, compute dates in Asia/Kolkata explicitly.

**Writing rule:** All interface text and sample content must be plain, friendly English that a Grade 6 student and their parent can follow. No jargon. The site itself is called "Future Pathways". When referring to the team, write "FP (Future Pathway) team", never "CGPS".

**Machine [v1.2]:** The build runs on Madan's Windows work laptop, in the VS Code terminal. Before Phase 1, check that Node.js (current LTS) and Git are installed and say plainly what is missing and how to install it. All commands you give must work in Windows PowerShell. **[v1.4]** Checked 11 Oct 2026: Node v24.14.0, npm 11.9.0, Git 2.53. Nothing to install.

## 18. Decisions log [v1.2]

Settled. Claude Code should not ask about these again.

| # | Question | Decision |
|---|---|---|
| 1 | Deploy before the account exists? | Build and preview locally; deploy once the account is ready |
| 2 | Build machine | Madan's Windows work laptop, VS Code terminal |
| 3 | Public or private repo | Public; drafts visible in the repo; no private information in any post |
| 4 | Tags and countries | Fixed lists that can be added to; tags grouped (Subject area, Entrance exam, Skill, Study level, Audience) with search words [v1.3] |
| 5 | Deadline timing | 11:59 PM IST on the date, with an optional note for other time zones |
| 6 | Yearly opportunities | Update the same post; no year in the address |
| 7 | Posts in two categories | One main category plus up to 2 extra categories [v1.3, replaces "one category only"] |
| 8 | Who writes the posts | **[v1.5, replaces "Claude drafts"]** Counsellors write every post; Claude drafts none. A second counsellor checks facts; Niranjan publishes |
| 9 | Import existing FP material | Not in v1 |
| 10 | Images | Free stock (Unsplash, Pexels) or TIPS photos; default image per category |
| 11 | Logo | Text wordmark until a logo file is supplied |
| 12 | Word templates | TIPS house style |
| 13 | Link previews | One branded preview image per category |
| 14 | Google visibility | Visible; `/review` hidden |
| 15 | Filters and pagination | Filter all posts, then paginate |
| 16 | Language | English only |
| 17 | Analytics account | Same official account email, if turned on |
| 18 | Phase reviews | Madan reviews every phase; Niranjan joins Phase 6 |
| — | Hosting | **[v1.5]** Organisation `futurepathways` owned by Madan's personal account; main github.io site at `https://futurepathways.github.io` |
| 19 | Tags per post [v1.3] | Required: 3 to 8 in total, at least one Subject area tag |
| 20 | Finding by tag and category [v1.3] | Search box matches tags and categories, tag pages, Browse All Tags page, filterable search results |
| 21 | Project folder [v1.4] | Subfolder `tips-futurepathways.github.io/` beside the PRD; the PRD stays outside the public repo |
| 22 | Start here by grade [v1.4] | One page per grade band with a short intro and a curated list (Section 6.10) |
| 23 | Reviewer shown [v1.4] | "Checked by [counsellor] on [date]" on every post |
| 24 | Header search [v1.4] | Suggestions as you type; Enter opens the Search page |
| 25 | Commit identity [v1.4] | Madan's personal GitHub account; no repo-local identity |
| 26 | Main category [v1.4] | Decided by the content folder; build fails if the field disagrees |
| 27 | Stream "any" [v1.4] | Shows under every stream filter |
| 28 | Cover alt text [v1.4] | New `cover_alt` field, required when a cover image is set |
| 29 | Filter engine [v1.4] | One shared engine: Pagefind for words, JSON index for filters and sort |
| 30 | Phase 2 sample posts [v1.4] | Four temporary posts for testing; **[v1.5]** deleted once Phase 2 was checked |
| 35 | Universities category [12 Oct 2026] | Fifth top-level category. University guides use it as main category with Countries and Courses as extras |
| 34 | FP-UV import [12 Oct 2026] | The 17 University Virtual Tour editions are imported as published posts, reviewed by Madan (PRD Section 20) |
| 33 | Hosting account [v1.5] | Madan's personal GitHub account owns the `futurepathways` organisation; no fptrichy account |
| 32 | Starter posts [v1.5] | The 28-post plan is withdrawn. Claude drafts no content; counsellors write every post |
| 31 | Pages CMS pick lists [v1.4] | If Pages CMS cannot read `tags.yml` directly, a small script regenerates the pick lists in `.pages.yml`; the publishing guide covers it |
