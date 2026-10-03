# edrichbarnard.co.za

Personal site for Edrich Barnard. Astro + Tailwind, fully static: `npm run prod` produces a `dist/` folder you can serve from any web server.

## Setup

```sh
npm install
cp .env.example .env.development   # and .env.production, then fill in SITE_URL and (optionally) Umami
npm run watch                       # http://localhost:4321
```

| Script            | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `npm run watch`   | Live dev server; changes show up in the browser immediately          |
| `npm run dev`     | Development build into `dist/`, using `.env.development`             |
| `npm run prod`    | Production build into `dist/`, using `.env.production` - this is what you host |
| `npm run preview` | Serve whatever is currently in `dist/` at http://localhost:4321      |
| `npm run check`   | Type-check `.astro` and `.ts` files                                  |

Non-production builds add a `noindex` tag so a test deploy never ends up in search results.

## Environment

Each mode reads its own file: `.env.development` or `.env.production`. Both are gitignored.

| Variable                  | Purpose                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `SITE_URL`                | Public URL of the site. Used for canonical links, social previews and the CV header. |
| `PUBLIC_UMAMI_WEBSITE_ID` | Umami website id. Leave empty to ship without any analytics.             |
| `PUBLIC_UMAMI_SRC`        | Umami script URL. Point it at your own instance if you self-host Umami.  |

Command-line usage is tracked as a `command` event (with the command name) and email copies as `copy-email`.

## Hosting `dist/`

Everything is pre-rendered: `/index.html`, `/cv/index.html` and `/404.html`. Configure the server to use `404.html` for missing pages, e.g. for nginx:

```nginx
root /var/www/edrichbarnard/dist;
error_page 404 /404.html;
location /_astro/ { expires 1y; add_header Cache-Control "public, immutable"; }
```

The GitHub contribution graph is rendered at build time, then refreshed in the visitor's browser from [github-contributions-api.jogruber.de](https://github.com/grubersjoe/github-contributions-api). GitHub's own endpoint can't be fetched from a browser because it sends no CORS headers. If the live request fails, the build-time graph stays. If GitHub can't be reached at build time either, the build still succeeds and the graph appears once the live data loads. Turn on **Settings → Public profile → Include private contributions** on GitHub for the graph to reflect private work.

## Editing content

All copy lives in [`src/data/site.ts`](src/data/site.ts) - bio, stack, projects, experience, education and the "Currently" log. The homepage and the `/cv` page both render from it.

- **Stack icons** come from [simple-icons](https://simpleicons.org); set `icon` to the export name (e.g. `siVuedotjs`). For brands simple-icons doesn't ship, set `mono` to a short monogram instead.
- **Project media**: drop screenshots in `public/media/projects/<slug>/` and list them on the project:

  ```ts
  media: [{ src: "/media/projects/lewende-woord/app/home.png", alt: "Lewende Woord app home screen" }],
  ```

  The first image replaces the generated dot-matrix visual on the card. Landscape images around 16:9 crop best.

## Command line

Press `/` or `Cmd/Ctrl + K` on the homepage. `help` lists everything; highlights are `ls` / `open <project>`, `say <text>`, `shape <name>`, `theme`, `accent` and `cv`. Commands can be shared as links: `/?cmd=say%20hello`. `?theme=light` and `?accent=orange` also work as URL parameters.

## Structure

```
src/
  data/site.ts        content
  layouts/Base.astro  <head>, SEO, theme bootstrap, analytics
  components/         page sections
  pages/              index, cv, 404
  scripts/            client-side: particle stage, dither portrait, project canvases, command line
  lib/github.ts       build-time contribution graph
public/
  images/             portrait sources for the dither and particles
  og.png, favicon.svg
```
