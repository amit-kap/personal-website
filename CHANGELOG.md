# Changelog

Changes to amitkap.com, including settings made outside the repo (Cloudflare, Umami, Google) that the code alone does not show. Newest first.

## Pending

- [ ] **Google Search Console.** Add `amitkap.com` as a Domain property, verify it with the TXT record in Cloudflare DNS (keep the record afterwards), and submit `sitemap.xml`.
- [ ] **Weekly site-suggestion job.** Once there are a few weeks of Umami and Search Console data, add a scheduled GitHub Actions job that reads both and opens one data-backed suggestion as a GitHub issue.

## 2026-10-13 — Glaze component library

The site's UI now runs on [Glaze](https://www.npmjs.com/package/@amit-kap/glaze) (`@amit-kap/glaze`). The look is unchanged. Computed styles and layout were compared against the previous build on seven routes, in light and dark, at 1280px and 390px, and match.

### Changed

- **Theme.** A custom Glaze theme, `personal-website`, carries the site's palette, radii, type and elevation. Edit `src/theme/personal-website.config.json` and regenerate with `npx glaze theme src/theme/personal-website.config.json`; do not edit the generated `personal-website.css` by hand.
- **Orange is Glaze's `primary`.** Glaze's `accent` is a neutral hover fill, so `text-accent` / `border-accent` became `text-primary` / `border-primary`.
- **Dark mode is the `.dark` class**, managed by Glaze's `ThemeProvider`, replacing the hand-set `data-theme="dark"`. The pre-paint script in `index.html` is generated from `src/theme/options.ts` by `themeScript()`; keep the two in step.
- **Components.** The orange action pills use Glaze's button styles (`src/components/pillButton.ts`), the theme toggle is a Glaze `ToggleGroup`, and the lightbox is a Glaze `Dialog`. The lightbox now traps focus and fades out on close.
- **`portfolio-theme.css`** keeps only the extended type scale, site-only inks (`--copy`, `--winbar`, `--nav-pill-bg`), page structure and the shared motion and media utilities. The old palette, `.pill-cta` and `.lightbox` rules are gone.

### Kept as is

- All animation and motion: rolling text, reveals, parallax, the nav drop, the availability shimmer and smooth scroll.
- The floating nav pill, `text-link` and the Human/Agent switch, which are bespoke to the site.

### Notes

- **Dark-mode preference reset once.** The saved choice moved from the `theme` key to `portfolio-theme`, so a visitor who chose dark before this release sees light mode once.
- Arrow and toggle icons carry explicit `size-*` classes. Glaze sizes any icon inside a button to the text height unless the icon opts out.

## 2026-10-04 — Analytics and SEO cleanup

### Added

- **Umami Cloud analytics.** The script is in `index.html`, limited to `amitkap.com` with `data-domains`, so local dev and preview builds are not counted. It is cookieless, so no consent banner is needed. Umami tracks route changes automatically.
- **Click events on contact links**, via `data-umami-event` attributes:

  | Event | Where | Extra data |
  |---|---|---|
  | `contact-email` | Header, home hero, home availability CTA, About | `location`: `header`, `home-hero`, `home-availability`, `about` |
  | `contact-linkedin` | About | — |
  | `download-cv` | About | — |

  When you add a new contact link, give it the matching event attribute.

### Fixed

- **Removed trailing-slash redirects.** The prerender step now writes `about.html` instead of `about/index.html`. Cloudflare Pages redirected directory routes to a trailing slash (`/about` → 308 → `/about/`), which contradicted the canonical URLs and the sitemap. Routes now return 200 at their clean path, and `/about/` redirects to `/about`.
- **Kept `*.pages.dev` out of search.** `public/_headers` sends `X-Robots-Tag: noindex` on the Pages project hostname and preview hostnames. `amitkap.com` is unaffected.

### Configured outside the repo

- **Cloudflare Web Analytics.** Turned on with automatic injection and EU visitors included. It provides Core Web Vitals; Umami remains the source for visitors and events.
- **Cloudflare redirect rule "Redirect www to root".** `https://www.*` → `https://${1}`, 301, with the query string preserved. Cloudflare warned that www might not be proxied; it is (www is a Pages custom domain), so the warning was ignored.

### Notes

- Cloudflare **Account analytics** counts bots and scanners and overstates real visitors several times over. Use Umami for people.
- Requests for `/wp-admin/` and `/xmlrpc.php` come from WordPress vulnerability scanners and are harmless on a static site.
- **AI Crawl Control** (Cloudflare → AI) shows which AI crawlers fetch the site and `llms.txt`.
