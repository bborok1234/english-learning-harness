# Security Policy

## Supported Versions

This repository is pre-1.0. Security fixes target the `main` branch.

## Reporting a Vulnerability

Please do not open a public issue for vulnerabilities that expose credentials, private learner data, local file paths, transcripts, images, audio, or other sensitive material.

Use GitHub private vulnerability reporting if it is enabled for the repository. If it is not enabled yet, contact the repository owner through GitHub and include:

- affected command or script.
- minimal reproduction steps.
- whether local learner data, media, credentials, or repository tokens are exposed.
- suggested fix if known.

## Security Boundaries

- Learner data is local-first and should stay under the configured learner root.
- Exported validation packs should redact local learner roots and source media paths.
- The project should not require API keys for the first-use path.
- Do not commit `.env`, tokens, private transcripts, local audio, local images, `.omx/`, or `tmp/`.
