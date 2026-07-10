# Ops Atlas

Ops Atlas is a standalone, open-source system cartography toolkit for operators and AI agents.

It helps you map systems, services, networks, integrations, operational outcomes and direct dependencies into a portable inventory. The inventory can then be validated, rendered to Mermaid, and explored in a professional React Flow + ELK visual viewer.

Ops Atlas is intentionally generic: it ships the tool, schema guidance and templates, not anyone's private infrastructure map.

## Why

Infrastructure knowledge is often scattered across tickets, READMEs, dashboards, memories, scripts and people's heads. Agents can help maintain that map, but they need a safe structure:

- source-of-truth inventory files
- clear node and relationship semantics
- repeatable validation/rendering
- human-friendly visual exploration
- strong privacy boundaries

Ops Atlas provides that structure.

## Features

- `atlas init` project scaffold
- `atlas validate` inventory checks
- `atlas render` Mermaid diagrams and viewer data
- `atlas serve` local static viewer
- React Flow + ELK auto-layout
- draggable cards with browser-local layout persistence
- direct relationship arrows and labels
- node detail panel with inbound/outbound relations
- outcome filters and search
- Mermaid export from the current view
- portable `AGENT.md` guide for agents
- read-only-first mapping philosophy

## Quick start

From npm, once published:

```bash
npm install -g ops-atlas
atlas init my-map
cd my-map
atlas validate --project .
atlas render --project .
atlas serve --project .
```

From GitHub:

```bash
git clone https://github.com/wizhelp-net/ops-atlas.git
cd ops-atlas
npm install
npm run build
node bin/atlas.mjs serve --project examples/demo
```

You can also install globally from a clone:

```bash
npm install -g .
atlas init my-map
```

## Project structure

A map project contains:

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

A useful atlas has three main concepts:

- **systems**: hosts, services, applications, networks, APIs, jobs, agents, data stores, content corpora
- **relationships**: direct edges such as `runs_on`, `served_by`, `queries`, `reverse_proxies_to`, `reads_from`, `writes_to`
- **outcomes**: operational capabilities that depend on groups of systems

Example relationship:

```json
{
  "from": "operator-portal",
  "to": "backend-api",
  "label": "queries"
}
```

## Privacy model

Ops Atlas does not include your infrastructure atlas.

The public repository contains:

- generic CLI code
- generic viewer code
- templates
- documentation
- a sanitized demo project

Your generated atlas is created locally in your own project directory. Do not publish generated inventories if they contain private topology, URLs, hostnames, paths, risks or operational relationships.

## Agent usage

Read `AGENT.md` before mapping an environment. It explains how an agent should discover systems safely, avoid secrets, and improve sparse maps by adding direct relationships.

## Development

```bash
npm install
npm run build
npm run check
node bin/atlas.mjs serve --project examples/demo
```

## License

MIT
