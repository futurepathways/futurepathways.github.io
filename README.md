# Future Pathways

A free, read-only website where students and parents in India find clear guides on careers, courses, countries, universities and opportunities. Built and run by Madan Kumar PC, career counsellor.

Live address (once deployed): https://futurepathways.github.io

## Run it on your laptop

All commands work in Windows PowerShell, from this folder.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Start a local preview at http://localhost:4321 that updates as you edit |
| `npm run build` | Build the finished site into `dist/` |
| `npm run preview` | Serve the built `dist/` folder exactly as it will appear online |

## Where things live

| Path | Purpose |
|---|---|
| `src/content/` | Blog posts as Markdown, one folder per category |
| `src/data/` | Tag list, country list, "start here" lists |
| `src/config/site.ts` | Site name, team name, contact email, menu |
| `astro.config.mjs` | Live URL and base path only |
| `public/images/` | Logo, category default images, link preview images |
| `docs/` | Word templates for guest writers and the publishing guide |
| `.pages.yml` | Pages CMS editor configuration |
| `.github/workflows/deploy.yml` | Build and deploy on every change, plus daily at 05:00 IST |

## Adding a logo

Drop a file at `public/images/logo.svg` (or `logo.png`). The header switches from the text wordmark to the logo automatically.

## Who does what

- Posts are written in Pages CMS or in Markdown. Guest writers can draft in Word using the templates in `docs/templates/`.
- See `docs/PUBLISHING_GUIDE.md` for the steps.
- Nobody needs to touch this code to publish a post.
