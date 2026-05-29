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

M7 must prove one of:

- public repository clone, or
- separate public distribution artifact.

It must also add a public install smoke before documenting Git-backed plugin install.

## Verification

`node scripts/phase6-distribution-policy-smoke.mjs` verifies:

- `docs/distribution-policy.json` uses `currentPolicy: private-beta`.
- release claim is `invited-user clone-to-learn`.
- public release status is `deferred`.
- blocked claims include unauthenticated public HTTPS clone.
- public release requirements include the default public clone smoke.

## Claim Boundary

This policy enables private beta closeout only. It does not claim unauthenticated public clone-to-learn readiness.
