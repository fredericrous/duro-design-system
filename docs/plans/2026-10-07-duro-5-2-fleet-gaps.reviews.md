# Duro 5.2 fleet gaps — full reviews

## Full reviews (reference)

**backend, round 1: approve-with-changes (51k, 46 s).** High: new sizes collide with existing px values, so lint can't fix them. High: the stricter lint and doctor are only gated on 5 repos. Medium: Combobox, Dialog and Menu behaviour changes. Medium: the `inverse*` name clash. Medium: Verification not written as input → expected. Low: no rollback. Low: no growth numbers. All resolved.

**backend, round 2: approve-with-changes (52k, 41 s).** All of round 1 resolved. New:

- Medium: website-builder can't pass the gate before lexical-multi 0.4.0 ships. Fixed: pack it locally.
- Low: exit codes were in the wrong README section. Fixed.
- Low: no tie-break in the nearest-role message. Fixed.

**backend, final bind: approve-with-changes (33k, 22 s).** All three round-2 findings resolved. Low: two token values the same distance away (220 vs 200 and 240) need a rule. Left for implementation: list both, smaller first, and add a test for `width: 220`.

**typescript: approve-with-changes (57k, 60 s).** High: keep the Menu keydown handler off `document`. High: the stricter checks need gating on all 9 consumers. Medium: `noExternal` shorthand and declaration blanking. Medium: stale build output. Medium: Combobox tests stay unchanged. Low: Button ref on native. All merged.

**react: approve-with-changes (54k, 55 s).** High: Escape inside a Menu nested in a Popover or Dialog. High: `aria-activedescendant` must sit on the focused element. High: the Listbox anchor needs ARIA props. Medium: ambiguous lint matches. Medium: a box-shadow focus ring vanishes in forced colours. Low: the `inverse` prefix. Low: tests select by role. All merged.

**ui-design: approve-with-changes (35k, 47 s).** High: `contrastSurface` name, per-theme values and contrast. High: DragDrop's shadow marks a drop target, not focus. Medium: duplicate px values. Medium: Menu, Listbox and ghost Input states. Medium: mockup step for TextLink and ghost Input (ADR-0016). Low: lexical before/after screenshots. All merged.

**ux-research: approve-with-changes (53k, 42 s).** High: APG menu-button focus. High: forced colours (C40). Medium: limit where ghost Input is used. Medium: subtle TextLink must not rely on colour alone (F73). Medium: dev warning when `closeOnEscape` is false. Low: role values are unbacked, but they are the person's call. All merged.

**game-ux: approve-with-changes (48k, 42 s).** High: shared values lose the one-key fix (axis filter, one suggestion per candidate). High: the lint message pushed developers to add tokens instead of naming the nearest role. Medium: each preview needs a delta table. Low: the doctor warning needs fix text. All merged.

**unix: approve-with-changes (50k, 32 s).** Medium: exit codes for `warn` and `error`. Medium: stale or missing build output, and a scan cap. Low: report the media-query text, since built CSS is one line. Low: what goes in `checked` in `--json`. All merged.

**tui: approve-with-changes (48k, 27 s).** Medium: the session hook's opening line is worded for one finding type. Medium: what the `media-var` and "cannot verify" warnings say. Low: rule-name width (renamed `media-var`). Low: scan cap. All merged.
