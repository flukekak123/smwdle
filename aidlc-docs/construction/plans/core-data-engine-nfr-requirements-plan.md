# NFR Requirements Plan — U1 core-data-engine (light)

## Plan Steps
- [x] Assess performance (pure in-memory functions)
- [x] Assess reliability / error handling (fail-safe codec)
- [x] Assess maintainability / testability (PBT framework selection, PBT-09)
- [x] Record tech-stack decisions
- [x] Generate `nfr-requirements.md` and `tech-stack-decisions.md`

## Open Questions
None — U1 is a pure, in-process TypeScript module with no server, network, auth, or persistence side effects (side effects live in U2). NFRs are fully determined by prior stages:
- No scalability/availability/DR concerns (no runtime service).
- No security/authnz surface (no user data, no network at runtime).
- PBT framework fixed to **fast-check** by the Property-Based Testing extension (Partial) opt-in.

If any assumption above is wrong, raise it at the review gate.
