# Atlasys

**Atlasys** is an open-source system cartography toolkit for operators and AI agents.

It helps teams describe systems, relationships and operational outcomes as portable JSON, then validate and explore that map locally.

Built by [wizhelp](https://wizhelp.me).

![Atlasys concept](docs/assets/atlasys-concept.png)

## Preview

![Atlasys demo screenshot](docs/assets/atlasys-demo-screenshot.png)

The screenshot uses the sanitized demo project included in this repository.

## What you get

- CLI commands to initialize, validate, render and serve maps
- JSON inventory files for systems, relationships, outcomes and views
- Mermaid export for versioned documentation
- React Flow + ELK viewer for local visual exploration
- Search, outcome filters and direct relationship inspection
- Browser-local layout persistence for adjusted node positions
- `AGENT.md` guidance for safe read-only mapping workflows

## Quick start

```bash
git clone https://github.com/wizhelp-net/Atlasys.git
cd Atlasys
npm install
npm run build
node bin/atlas.mjs serve --project examples/demo
```

Open:

```text
http://127.0.0.1:8787
```

## Create a map

```bash
npm install -g .
atlasys init my-map
cd my-map
atlasys validate --project .
atlasys render --project .
atlasys serve --project .
```

`atlas` is also available as a short alias for `atlasys`.

## Project structure

```text
atlas.json
AGENT.md
inventory/
  systems.json
  relationships.json
  outcomes.json
  views.json
layouts/
  main.json
generated/
```

Inventory files are the source of truth. Generated files can be deleted and recreated.

## Inventory model

Atlasys maps three things:

- **Systems**: services, hosts, applications, APIs, jobs, networks, data stores or external integrations.
- **Relationships**: direct edges such as `runs_on`, `queries`, `calls_api`, `reads_from` or `writes_to`.
- **Outcomes**: operational capabilities supported by one or more systems.

Minimal relationship example:

```json
{
  "from": "operator-portal",
  "to": "backend-api",
  "label": "queries"
}
```

## CLI reference

```bash
atlasys init <dir>
atlasys validate --project <dir>
atlasys render --project <dir>
atlasys serve --project <dir> [--port 8787]
```

## Privacy model

Atlasys is local-first. This public repository contains the toolkit, templates and a sanitized demo, not a real infrastructure atlas.

Do not publish generated inventories if they contain private topology, URLs, hostnames, paths, risks or operational relationships.

## Agent usage

Read [`AGENT.md`](AGENT.md) before mapping an environment. It defines the safe read-only workflow and the rules for avoiding secrets or private data.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Development

```bash
npm install
npm run build
npm run check
node bin/atlas.mjs serve --project examples/demo
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Security

See [`SECURITY.md`](SECURITY.md). Please do not include private infrastructure data, secrets or raw logs in issues.

## License

MIT
