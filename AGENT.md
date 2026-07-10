# AGENT.md · Atlasys operating guide

You are using **Atlasys**, a read-only system cartography toolkit for operators and AI agents.

Your goal is to create a useful map of an environment without changing that environment and without leaking private information.

## Mission

Create a complete, practical system atlas for the environment you are assisting.

Focus on:

- operational outcomes
- systems that support those outcomes
- direct relationships between systems
- entrypoints and ownership
- risks, sensitive boundaries and blast radius

The CLI is your support tool. You, the agent, do the discovery and judgment. Atlasys gives you a schema-light project structure, validation, Mermaid export and a React Flow + ELK visual canvas.

## Hard rules

- Do not change infrastructure.
- Do not run destructive commands.
- Do not include secrets, tokens, private keys, auth headers or raw private logs.
- Treat scanner/manual output as suggestions until reviewed.
- Keep the inventory portable and platform-agnostic.
- Generated files can be regenerated; inventory files and this guide are durable.
- Prefer redacted paths, roles and service names over sensitive contents.
- If publishing an atlas, sanitize it first.

## Standard workflow

1. Read this guide.
2. Identify the main operational outcomes.
3. Inspect available local/project context using read-only commands.
4. Add or update inventory files.
5. Run `atlasys validate`.
6. Run `atlasys render`.
7. Open `generated/viewer/index.html` or run `atlasys serve`.
8. Inspect the graph visually.
9. Add missing direct relationships.
10. Re-render until the map explains the environment clearly.

`atlas` is available as a short alias for `atlasys`.

## What to map

Map anything that affects an operational outcome:

- hosts, VMs, containers and appliances
- services, daemons and jobs
- public/private entrypoints
- reverse proxies and routes
- networks, VLANs, bridges and private backbones
- APIs and integrations
- data stores and content corpora
- agents, skills and automation runtimes
- auth/config files as sensitive nodes, never with contents
- scheduled tasks and workflow runners
- known risks and blast-radius constraints
- future/stopped capacity if it changes operational decisions

## Good node fields

Every important system should try to include:

- `id`: stable lowercase identifier
- `name`: human label
- `type`: host, service, web-service, vm, lxc, container, network, external-integration, agent, job, automation, data-store, content-corpus
- `host`: where it runs, if applicable
- `role`: why it exists, outcome-first
- `status`: active, stopped, configured, external, planned
- `url` or `bind`: if it exposes an entrypoint
- `path` or `service`: if it is locally operated
- `owner`: person, team or system if known
- `risk`: if dangerous, sensitive or high blast-radius
- `tags`: short searchable labels

## Relationship style

Relationships are the most important part of the map. Add a direct edge for every meaningful dependency.

Good labels:

- `runs_on`
- `served_by`
- `reverse_proxies_to`
- `queries`
- `calls_api`
- `authenticates_with`
- `persists_state_to`
- `reads_from`
- `writes_to`
- `protects`
- `monitors`
- `triggers`
- `publishes_to`
- `subscribes_to`
- `clone_of`
- `standby_on`
- `future_supports`

Avoid vague labels like `related_to` unless there is no better option.

## Read-only discovery checklist

Use read-only inspection where available:

- systemd: running services, unit files, timers, ports
- Docker: compose projects, containers, exposed ports
- Kubernetes: namespaces, deployments, services, ingresses
- virtualization: VMs, CTs, storage, bridges, status
- reverse proxies: Caddy, Nginx, Traefik routes
- app repos: README, package files, env examples, service files
- CI/CD: workflow files and deployment scripts
- scheduled jobs: cron, systemd timers, workflow tools
- agent runtimes: skills, helper scripts, API clients, operational guides
- logs only for service names and flow clues, not raw private content

## Completeness checklist

Before calling a map complete, check:

- every outcome points to systems
- every service has a host or external owner
- every public entrypoint has a route/backend
- every backend has consumers
- every data store has readers/writers
- every network has CIDR/role when known
- every risky/sensitive system has a risk note
- every visible node has at least one meaningful direct relation unless intentionally isolated
- Mermaid and React Flow viewer render without errors
- no secrets or private raw logs are present

## Visual review loop

If the graph looks sparse:

1. select a node
2. inspect Direct relations
3. ask: what uses this, what does it use, where does it run, what protects it, what state does it read/write?
4. add missing relationships
5. re-render

The goal is not a pretty poster. The goal is a map an agent or operator can use to make safer operational decisions.
