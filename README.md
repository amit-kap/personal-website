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

Pushing to `main` triggers the GitHub Pages workflow in `.github/workflows/deploy.yml`. The Vite base path is configured for the repository Pages site at `/personal-website/`, and the workflow copies the production `index.html` to `404.html` so deep links resolve correctly.
