# Duro 5.4 local stacking — full reviews

## Full reviews (reference)

**po, round 1: approve-with-changes (30k, 26 s).**

- High: #76/#77 delay website-builder. Fixed: split out.
- High: the nav gap reaches live sites. Fixed: release note and check.
- Medium: missing website-builder browser rows. Fixed.
- Medium: no rollback trigger. Fixed.
- Low: list the values that stop being reported. Fixed.

**architect, round 1: approve-with-changes (65k, 55 s).**

- High: floatingRaised is below modal. Moot after the split; recorded for 5.5.
- Medium: LAYERS_BY_VALUE is hand-maintained. Fixed.
- Medium: ADR-0027 positioning. Fixed.
- Medium: no bound on localMax. Fixed: max 49.
- Medium: lexical peer floor. Moot.
- Low: a shared ControlSize type. Moot.

**backend, round 1: approve-with-changes (64k, 74 s).**

- High: triggerSmall shorthand, Menu ghost order, floatingRaised. Moot.
- Medium: the tear ghost must be portalled. Fixed.
- Medium: tables and docs.mjs are hand-maintained. Fixed.
- Medium: the height check. Moot.
- Low: message clause and schema. Fixed.

**architect, round 2: approve-with-changes (30k, 17 s).** All 6 resolved or moot. Medium: §2 says to hand-edit CLAUDE.md while the binding note says generated. Resolved: the binding note overrides. Low: the verdicts line. Fixed.

**po, round 2: approve (29k, 17 s).** All 5 resolved. Lows: post-release watching, and where the list goes. Folded into the binding notes.

**backend, round 2: approve-with-changes (53k, 41 s).** Round 1 all resolved. New lows and mediums (CLAUDE.md generated, repos line, null mount, a citation for snapshots, Options type) are recorded as binding notes.
