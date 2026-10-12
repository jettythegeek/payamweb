# Payam Website

Payam brings everyday payments, shopping, food, transport, services, health and business needs together in one app. Its public website introduces the product and helps visitors explore how Payam connects people with local businesses and services.

This repository contains the Payam visitor website, including page content, visual assets, responsive layouts and interactive features.

## Website content

- Product introduction and everyday-use categories.
- Business and student pages.
- Deals, articles and local guides.
- Help and frequently asked questions.
- Privacy, terms and other policy pages.

The homepage includes animated category displays and carousels, with navigation and expandable FAQ answers. The website is under active development; page content and destinations should be reviewed before public release.

## Technology

- Next.js App Router
- React and TypeScript
- CSS and GSAP for styling and animation
- Lucide icons

## Local development

Run these commands from the repository directory:

```bash
npm install
npm run dev
```

Open [localhost:3005](http://127.0.0.1:3005) in your browser.

## Validation and production build

```bash
npm run typecheck
npm run build
npm run start
```

`npm run start` serves the production build on port 3005. Run `npm run build` first.

## Project structure

```text
app/       Page routing, shared layout, styles and interactive components
content/   Page content and asset metadata
public/    Images, fonts and other static assets
scripts/   Project maintenance utilities
```

Page routes are handled by `app/[[...slug]]/page.tsx`, with content loaded from JSON files in `content/`. Shared styling lives in `app/globals.css`.
