# Support

Use GitHub issues for reproducible bugs, setup failures, documentation gaps, and learning-flow suggestions.

Before opening an issue, run:

```bash
node scripts/english-learning-harness.mjs health --json
node scripts/english-learning-harness.mjs status --json
```

Include:

- operating system and Node.js version.
- command that failed.
- redacted JSON output.
- whether you used `ENGLISH_LEARNING_HOME` or `--learner-root`.

Do not include private transcripts, local media, credentials, or learner data you do not want public.
