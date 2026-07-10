# Contributing to Atlasys

Thanks for considering a contribution.

Atlasys is early, so the most valuable contributions are small, clear and grounded in real operational mapping needs.

## Development setup

```bash
git clone https://github.com/wizhelp-net/ops-atlas.git
cd ops-atlas
npm install
npm run build
npm run check
node bin/atlas.mjs serve --project examples/demo
```

## Project layout

```text
bin/atlas.mjs          CLI
viewer/                React Flow + ELK viewer
templates/project/     Project scaffold used by atlasys init
examples/demo/         Sanitized demo project
docs/                  Roadmap and design notes
AGENT.md               Agent operating guide
```

## Contribution guidelines

- Keep the tool local-first and portable.
- Do not add hosted-service assumptions.
- Do not add code that mutates infrastructure by default.
- Prefer read-only scanners that produce suggestions.
- Keep generated files out of commits unless they are intentional release assets.
- Do not include real private infrastructure data in issues, tests, examples or screenshots.
- Add or update docs when changing CLI behavior or inventory semantics.

## Before opening a pull request

Run:

```bash
npm run build
npm run check
```

If your change affects package contents, also run:

```bash
npm pack --dry-run
```

## Good first contribution areas

- better validation warnings
- layout import/export
- SVG/PNG export
- sanitized example maps
- read-only scanner suggestions
- documentation improvements
- accessibility and keyboard navigation in the viewer

## Security and privacy

Never include secrets, tokens, private keys, host inventories, internal URLs, private IPs or raw operational logs in a public contribution.

See `SECURITY.md` for reporting security issues.
