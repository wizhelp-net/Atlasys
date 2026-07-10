# Ops Atlas

Ops Atlas is a standalone, agent-operable system cartography toolkit.

It helps agents and operators create portable maps of systems, services, networks, integrations, outcomes and risks. The CLI provides structure and repeatable rendering; the agent provides discovery and judgment.

## Features

- `atlas init` project scaffold
- `atlas validate` inventory checks
- `atlas render` Mermaid + React Flow viewer data
- `atlas serve` local static viewer
- React Flow + ELK auto-layout
- draggable cards
- direct relationship arrows and labels
- outcome filters and search
- Mermaid export from the current view
- portable `AGENT.md` guide for agents

## Quick start

```bash
npm install -g ops-atlas
atlas init my-map
cd my-map
atlas validate --project .
atlas render --project .
atlas serve --project .
```

During local development from this repository:

```bash
npm install
npm run build
node bin/atlas.mjs serve --project examples/demo
```

## Source of truth

A project contains:

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

Inventory files are the source of truth. Generated files can be regenerated.

## Privacy model

Ops Atlas does not ship with your infrastructure map. It ships with generic code, templates and a sanitized demo. Each user creates their own project inventory locally.

Do not publish generated inventories if they contain private topology, URLs, hostnames, paths or operational relationships.
