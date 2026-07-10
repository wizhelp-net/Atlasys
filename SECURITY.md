# Security Policy

Atlasys is a local-first cartography tool. The main security risk is accidentally publishing private infrastructure information.

## Supported versions

Atlasys is pre-1.0. Security fixes target the latest public release.

## Reporting a vulnerability

Please report security issues privately to the maintainers before opening a public issue.

If a public contact is not yet listed for the project, open a GitHub issue with a minimal non-sensitive description and ask for a private disclosure channel. Do not include exploit details, secrets, private topology or logs in the issue.

## Do not publish sensitive atlas data

Do not include the following in GitHub issues, pull requests, examples or screenshots:

- secrets, tokens, API keys or private keys
- private hostnames, internal IPs or network ranges
- internal URLs and bind addresses
- raw logs containing personal or operational data
- customer data
- detailed private topology
- authentication headers or session files
- generated `atlas-data.json` files from real environments

## Scanner philosophy

Atlasys scanners, when added, should be read-only by default and should produce suggestions rather than modifying inventory or infrastructure automatically.

## Local generated files

Generated files live under `generated/` inside an atlas project. Treat generated output as potentially sensitive if the source inventory describes a private environment.
