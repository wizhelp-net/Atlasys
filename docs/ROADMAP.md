# Atlasys roadmap

This roadmap keeps product direction in one place. The README explains what Atlasys does today; this file tracks what is shipped, what is being considered and what is intentionally out of scope.

## Product purpose

Atlasys exists to make operational systems understandable to both humans and AI agents.

The core product should remain:

- **local-first**: inventories are created and kept by the user
- **portable**: plain JSON, generated docs and static viewer output
- **agent-friendly**: direct relationships and outcomes are explicit
- **safe by default**: discovery and mapping workflows avoid mutation and secrets
- **operator-oriented**: the map should help explain ownership, dependencies and blast radius

## Current release

Atlasys currently includes:

- CLI project scaffold
- schema-light JSON inventory format
- inventory validation
- Mermaid export
- static viewer data generation
- local web server for the viewer
- React Flow + ELK visual viewer
- search and outcome filtering
- direct relation inspection
- draggable nodes with browser-local layout persistence
- generic `AGENT.md` operating guide
- sanitized demo project

## Near-term candidates

These are the most likely next improvements:

- package publishing to npm
- layout export/import
- SVG/PNG export from the viewer
- stronger validation warnings for shallow nodes and weak relationship graphs
- relationship styling by edge type
- keyboard accessibility improvements
- clearer generated documentation templates

## Later candidates

Possible future areas:

- read-only scanner suggestions for common platforms such as systemd, Docker, Proxmox, Kubernetes and reverse proxies
- inventory diff and drift reports
- richer risk and blast-radius views
- optional schema export for editor autocomplete
- reusable example maps for common architectures

## Out of scope for now

Atlasys is not currently intended to be:

- a hosted SaaS
- a live monitoring system
- a mutating infrastructure scanner
- a secrets store
- a CMDB replacement
- an automatic source of truth without human/operator review

## Privacy principle

The tool is public. User inventories are private by default and stay wherever the user creates them.
