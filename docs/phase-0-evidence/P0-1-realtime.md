# P0-1 Realtime Conversational Mode

Date: 2026-05-27

Verdict: fail for MVP-default realtime voice; proceed with text/transcription-first fallback.

## Question

Can the current Codex CLI provide a short realtime voice loop that is natural enough for the intended daily 5-minute English session?

## Commands

```sh
codex features list | rg -n "realtime|voice|websocket|audio|image_generation|plugin_hooks|hooks"
codex --enable realtime_conversation --help | sed -n '1,120p'
```

## Observations

- `codex-cli 0.133.0` reports `realtime_conversation` as `under development` and disabled.
- Websocket response flags are not available for a stable realtime path: one websocket feature is `under development`; two are `removed`.
- `codex --enable realtime_conversation --help` accepts the feature flag syntactically, but the CLI help does not expose a realtime, voice, audio, or conversation command.
- Because no stable CLI realtime voice command is exposed, the intended 3-5 turn audio-loop test could not be executed.

Observed feature lines:

```text
hooks                                   stable             true
image_generation                        stable             true
plugin_hooks                            stable             true
realtime_conversation                   under development  false
responses_websocket_response_processed  under development  false
responses_websockets                    removed            false
responses_websockets_v2                 removed            false
```

## Decision

Realtime voice must not be the MVP default path.

The product can proceed only with an accepted fallback:

- Use text-first conversation as the default daily session path.
- Optionally support push-to-talk or transcription-first voice input later if a stable local capture/transcription path is available.
- Keep realtime conversational voice as a future enhancement, not a Phase 1 dependency.
- Treat any `PreToolUse` voice-limit guard as optional/future until a real voice tool exists. In Phase 1, track local duration only if audio capture is implemented.

## Impact

Phase 0 is complete with caveats. Implementation may proceed, but Phase 1 must be scoped around:

- verified local marketplace plugin install,
- setup-owned/native hook registration,
- verified local-first persistence,
- text/transcription-first daily conversation instead of realtime voice.
