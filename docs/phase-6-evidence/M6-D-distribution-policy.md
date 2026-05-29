# M6-D Distribution Policy

Issue: #78
Decision: private-beta

## Why

The repository is currently private. Changing repository visibility to public is an external release action and should not be done implicitly by an implementation agent. To keep progress moving without overstating claims, M6 is scoped to private beta / invited-user clone-to-learn.

## Decision

M6 first-complete distribution claim:

```text
private beta / invited-user clone-to-learn
```

This means an invited GitHub collaborator with repository access can clone the repository, run setup, complete a daily session, generate weekly/home/export outputs, and use local marketplace packaging/install docs.

## Deferred Public Release

Unauthenticated public distribution is deferred to M7 issue #83.

M7 must prove one chosen public surface:

- public repository clone, or
- separate public distribution artifact.

For a public source repository path, M7 must run the default public clone smoke without `ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE`.

For the current artifact-first recommendation, M7 must publish the artifact and `SHA256SUMS` only after #90 owner approval, then run `scripts/phase7-public-release-url-smoke.mjs` with real `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL` and `ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL`. Git-backed plugin install remains unclaimed unless a separate public Git-backed install smoke passes.

## Verification

`node scripts/phase6-distribution-policy-smoke.mjs` verifies:

- `docs/distribution-policy.json` uses `currentPolicy: private-beta`.
- release claim is `invited-user clone-to-learn`.
- public release status is `deferred`.
- blocked claims include unauthenticated public HTTPS clone.
- public release requirements are grouped by chosen surface.
- public source repository requirements include the default public clone smoke.
- public artifact repository requirements include the checksum-aware public release URL smoke and preserve the local marketplace install boundary.

## Claim Boundary

This policy enables private beta closeout only. It does not claim unauthenticated public clone-to-learn readiness.
