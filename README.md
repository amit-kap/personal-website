# Amit Kaplinsky — Product Design Portfolio

A React and Vite portfolio for Amit Kaplinsky’s security-product work, case studies, and CV.

## Development

```bash
npm ci
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Content

- `src/content/cv.md` is the single source for the CV and workplace metadata.
- `src/content/experience/<slug>/work.md` provides each product story’s card copy and ordering.
- `src/content/writing/<slug>/index.md` provides each article and its cover reference.
- The production asset manifests live in `src/lib/content.ts`; only assets referenced there are included in the build.

## Deployment

The site is on Cloudflare Pages at [amitkap.com](https://amitkap.com), built with `npm run build` and served from `dist`. Pushing to `main` deploys automatically; the build is configured in the Cloudflare dashboard rather than in a workflow file.

The site serves from the domain root, so the Vite base path is `/`. Deep links resolve through `public/_redirects`, which serves `index.html` for any path the build did not emit a file for.
