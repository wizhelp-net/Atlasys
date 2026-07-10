# AGENT.md · Ops Atlas operating guide

You are using Ops Atlas, a read-only system cartography CLI and visual mapper.

## Mission

Create a complete, useful system map for the environment you are assisting. Focus on outcomes first, then systems, dependencies, networks and risks.

The CLI is your support tool. You, the agent, do the reasoning and discovery. Ops Atlas gives you a schema, validation, Mermaid export and a professional React Flow/ELK visual canvas.

## Hard rules

- Do not change infrastructure.
- Do not include secrets, tokens, private keys, auth headers or raw private logs.
- Treat scanner/manual output as suggestions until reviewed.
- Keep the inventory portable and platform-agnostic.
- Generated files can be regenerated; inventory and this guide are durable.
- Prefer redacted paths/roles over sensitive contents.

## Workflow

1. Read this guide.
2. Identify the main operational outcomes.
3. Inspect the local project/system structure using read-only commands.
4. Add or update inventory files.
5. Run `atlas validate`.
6. Run `atlas render`.
7. Open `generated/viewer/index.html` or run `atlas serve`.
8. Inspect the graph visually: missing lines usually mean missing relationships.
9. Add direct relationships until every important dependency is represented.
10. Re-render.

## What to map

Map anything that affects an operational outcome:

- hosts, VMs, containers and appliances
- services and jobs
- public/private entrypoints
- reverse proxies and routes
- networks, VLANs, bridges and private backbones
- APIs and integrations
- data stores and content corpora
- agents, skills and automation runtimes
- auth files/config files, only as sensitive nodes, never contents
- known risks and blast-radius constraints
- future/stopped capacity if it changes operational decisions

## Required fields for good nodes

Every important system should try to include:

- `id`: stable lowercase identifier
- `name`: human label
- `type`: host, service, web-service, vm, lxc, container, network, external-integration, agent, job, automation, data-store, content-corpus
- `host`: where it runs, if applicable
- `role`: why it exists, outcome-first
- `status`: active, stopped, configured, external, planned
- `url` or `bind`: if it exposes an entrypoint
- `path` or `service`: if it is locally operated
- `owner`: person/team/system if known
- `risk`: if dangerous/sensitive
- `tags`: short searchable labels

## Required relationship style

Relationships are the most important part of the map. Add direct edges for every meaningful dependency.

Good labels:

- `runs_on`
- `served_by`
- `reverse_proxies_to`
- `queries`
- `calls_gateway_rpc`
- `authenticates_with`
- `persists_state_to`
- `reads_from`
- `writes_to`
- `protects`
- `monitors`
- `clone_of`
- `standby_on`
- `future_supports`

Avoid vague labels like `related_to` unless there is no better option.

## Discovery checklist

Use read-only inspection where available:

- systemd: running services, unit files, ports
- Proxmox: VMs, CTs, storage, bridges, status
- Docker: compose projects, containers, exposed ports
- Kubernetes: namespaces, deployments, services, ingresses
- reverse proxies: Caddy/Nginx/Traefik routes
- app repos: README, env examples, package files, service files
- logs only for service names and flow clues, not raw private content
- agent skills/tools: helper scripts, API clients, operational guides
- scheduled jobs: cron/systemd timers/workflow tools

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
- no secrets are present

## Visual review loop

If the graph looks sparse:

1. select a node
2. inspect Direct relations
3. ask: what uses this, what does it use, where does it run, what protects it, what state does it read/write?
4. add missing relationships
5. rerender

The goal is not a pretty poster. The goal is a map an agent can use to make safer operational decisions.
