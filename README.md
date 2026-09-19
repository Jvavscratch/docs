# jvavscratch documentation

The source of the documentation site at **https://jvavscratch.github.io/docs/**.

Built with [VitePress](https://vitepress.dev/). The site is bilingual: English is the default
locale and lives at the repository root, Chinese lives under `zh/`. Both trees mirror each other
file for file, so a page at `guide/installation.md` has its Chinese counterpart at
`zh/guide/installation.md` and is served at `/zh/guide/installation`.

## Requirements

- Node.js 18 or newer
- npm

## Local development

```bash
npm install
npm run dev       # dev server with hot reload at http://localhost:5173/docs/
```

`npm run dev` serves the site under `/docs/` because `base` is set to `/docs/` in
`.vitepress/config.mjs` to match the GitHub Pages project-page URL.

## Build

```bash
npm run build     # static output in dist/
npm run preview   # serve the built output locally
```

Dead links are checked during the build. If a link genuinely points at a page that does not exist
yet, add its resolved absolute path to `ignoreDeadLinks` in `.vitepress/config.mjs` — do not turn
the check off wholesale. Remove the entry once the page is written; the list is currently empty.

## Deployment

Deployment is automatic. Pushing to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes
it to GitHub Pages. Nothing needs to be committed to a `gh-pages` branch by hand.

For this to work, the repository's **Settings → Pages → Build and deployment → Source** must be set
to **GitHub Actions**. The workflow can also be run manually from the Actions tab
(`workflow_dispatch`).

## Writing conventions

- **Every page exists in both languages.** When you add or rename a page, update the other locale
  and the corresponding sidebar entry in `.vitepress/config.mjs` in the same change.
- **Internal links are absolute and site-rooted.** In an English page write `/guide/installation`;
  in a Chinese page write `/zh/guide/installation`. Relative links break under nested routes.
- **Keep frontmatter.** Every page carries at least a `title:`; the home pages under `index.md` and
  `zh/index.md` use the `layout: home` hero/features blocks.
- **Document what the code does.** If a feature is planned but not implemented, say so explicitly
  rather than describing it as if it exists — `modules/registry.md` and `modules/runtime.md` are
  marked as design drafts for exactly this reason.
- The language reference at `reference/language-reference.md` is the authoritative description of
  the JavaScript dialect users write. Keep the two locales structurally in step when editing it.

## License

Mozilla Public License 2.0. See [LICENSE](license.md).
