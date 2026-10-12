# Payam visitor website

An isolated Next.js App Router project, using BIMM's public website as a temporary visual reference. No Payam backend or mobile files are modified.

## Run locally

```powershell
cd C:\laragon\www\payam\website
npm install
npm run dev
```

Open http://127.0.0.1:3005. Production checks: `npm run build` and `npm run typecheck`.

## Editing

- `app/[[...slug]]/page.tsx`: local public page routing.
- `app/reference.tsx`: local interactive behavior.
- `app/globals.css`: overrides and reduced motion support.
- `content/home.json`: homepage reference markup and stylesheet list.
- `content/*.json`: captured linked public pages.
- `public/reference/`: downloaded original imagery, fonts and CSS.
- `content/assets.json`: source URL to local asset mapping.

The captured markup is deliberately retained for initial visual fidelity. During Payam customization, split it into React components section by section and replace BIMM names, Norwegian copy, images, testimonials, pricing, legal content and app-store destinations with approved Payam material.

## Scope and verification limits

This is a public-page visual snapshot, not BIMM's source repository or backend. Original analytics and runtime scripts are excluded. Menu and FAQ behavior are locally implemented. Deal search/filter/map state, original animation/carousel behavior, cookie dialogs and forms are not reproduced. Uncaptured links continue to BIMM; app-store links are still BIMM's. `/download` links use the homepage download section because the source route redirects rather than providing a capturable page. The website uses English content from BIMM’s `/en` pages. The header language switcher is removed. Blog and Help have local English translations because BIMM does not publish `/en/blog` or `/en/help`.

No deployment was performed. Search indexing is disabled. Build and HTTP checks do not establish pixel-perfect desktop/mobile fidelity; browser comparison remains required.

`import-reference.py` refreshes public markup/assets; `finalize-reference.py` restores FAQ answers and resolves links afterward. `reference.html` preserves the original homepage snapshot. Asset provenance is recorded in `content/assets.json`. Existing reference material is temporary and should be replaced before a Payam public release.

## English pages

Local routes: `/`, `/deals`, `/blog`, `/business`, `/norway-on-a-budget`, `/students`, and `/help`. English city-deal and Oslo guide pages are also captured. Legacy `/en` URL prefixes and Norwegian business/student paths resolve to the matching English content. Refresh using `python website/import-english.py` followed by `python website/finalize-english.py` from the repository root.
