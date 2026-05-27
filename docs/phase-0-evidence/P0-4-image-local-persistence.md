# P0-4 Evidence — Image + Local Persistence

Date: 2026-05-27
Environment:
- macOS local workspace
- Node.js local script
- Disposable learner directory: `tmp/phase-0-learner`

Verdict: pass

## Command or Manual Action

Created a reusable local persistence smoke script:

```bash
node scripts/phase0-local-persistence-smoke.mjs
```

The script creates a disposable learner fixture:

```text
tmp/phase-0-learner/
├── profile.md
├── progress.json
├── journal/2026-05-27.md
└── artifacts/images/2026-05-27-picture-coffee-placeholder.txt
```

The image artifact is a placeholder file in this spike. This validates local persistence and artifact reference shape, not automated CLI image generation.

## Observed Result

Script output:

```json
{
  "learnerRoot": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-0-learner",
  "progressVersion": 2,
  "mvpKeys": [
    "attendance",
    "english_word_ratio",
    "new_vocabulary_count",
    "utterance_word_count",
    "voluntary_speaking_seconds"
  ],
  "artifactPath": "artifacts/images/2026-05-27-picture-coffee-placeholder.txt",
  "status": "pass"
}
```

Verified files:

```text
tmp/phase-0-learner/profile.md
tmp/phase-0-learner/progress.json
tmp/phase-0-learner/journal/2026-05-27.md
tmp/phase-0-learner/artifacts/images/2026-05-27-picture-coffee-placeholder.txt
```

`progress.json` stayed on version 2 and updated only the MVP five session metrics:

- `utterance_word_count`
- `english_word_ratio`
- `attendance`
- `voluntary_speaking_seconds`
- `new_vocabulary_count`

`monthly_optional_metrics` remained separate and did not get promoted into the per-session MVP update path.

The journal references the artifact path using a learner-directory-relative path:

```text
Artifact: artifacts/images/2026-05-27-picture-coffee-placeholder.txt
```

## Decision Impact

Proceed with local-first persistence design.

The MVP can safely use this directory pattern:

```text
~/english-learning/
├── profile.md
├── progress.json
├── journal/
└── artifacts/images/
```

Implementation requirement:

- All learner-owned files must stay under the learner directory.
- `progress.json` must remain version 2.
- The Stop/update path must update only D83's five MVP session metrics per session.
- Image artifacts must be referenced by relative path from journal/progress records.

## Image Generation Note

This spike did **not** prove automated CLI-side `gpt-image-2` generation and direct file save.

Accepted MVP fallback:

- If automated image generation is unavailable in the CLI/plugin path, Picture description can use:
  - learner-provided image input, or
  - text-only scene prompts,
  - while preserving the same local artifact reference shape for future generated images.

## Follow-up

- During implementation, add a schema validator for `progress.json`.
- If direct image generation is added, rerun this smoke with a real generated image file replacing the placeholder.
- Do not block the MVP daily loop on image generation; local persistence is the gating requirement.
