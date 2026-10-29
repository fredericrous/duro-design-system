# Fonts and radii in Duro themes, hero size tokens: full reviews

## Full reviews (reference)

Round 1 (all accepted; overlapping patches merged by hand, the rest applied by `plan-apply`):

- **architect** approve-with-changes (58k, 65 s): fonts/radii inherit whatever the theme; the ADR names the theme file as an ADR-0027 exemption; `px6`/`full` excluded from RadiusOverrides; native first family unquoted.
- **game-ux** approve-with-changes (54k, 56 s): start copy and aria-label follow focus; pause on blur; dev warnings for dropped values; poster tap behaviour; measure heroMinH (today's floor is 440px); game-over install link.
- **backend** approve-with-changes (60k, 70 s): poster threshold 600 = heroMinH + heroReserve; balanced-quote font grammar; legacy vs grouped file detection; observable verification rows 1 and 7; native quote stripping.
- **tui** approve-with-changes (46k, 29 s): unknown-group error text; errors name key, rule and part; radii written with units; success line counts and a "Theme overrides" comment.
- **typescript** approve-with-changes (57k, 64 s): grammar, not blacklist; native per-group memo keys with `resolved` from colours only; a shared validator fixture; CSSOM quote normalisation; `radii: radiusOverrides` destructure.
- **po** approve-with-changes (50k, 56 s): heroReserve covers the header and padding, measured, and check 7 tests the install command; row 9 after release; the site's accessibility fixes may land first.
- **react** approve-with-changes (52k, 48 s): native keys (duplicate); inheritance (duplicate); the canvas's accessible name; a hydration test for the fonts/radii rule.
- **unix** approve-with-changes (48k, 38 s): usage errors on stderr; refuse `/*` `*/`; tmp + rename write.
- **ui-design** approve-with-changes (51k, 73 s): drive.html uses the `--duro-size-hero-*` vars; focus ring and hint; mono overflow story; font weights 400–700; artboards for the new states.
- **ux-research** approve-with-changes (30k, 107 s): rain stops within 5 s for everyone (WCAG 2.2.2); poster threshold (duplicate); Enter/Space on the focused canvas; Escape moves focus to the install command (WCAG 2.4.3).

Round 2, **backend** approve-with-changes (57k, 76 s): its six round-1 findings resolved. Carried into implementation:

1. The poster switch needs a JS `matchMedia` from the computed vars, and drive.html must link `dist/vars.css`.
2. Row 7 uses the token names, since the values may change after measuring.
3. Row 2 tests cross-theme inheritance and the dev warning.
4. Focus target after Escape in poster mode.
5. Duplicate "shared table" sentence; name the fixture file.

**codex** approve-with-changes (gpt, high effort):

- **High, applied:** validate per provider before merging, on both platforms.
- **Carried into implementation:**
  - colour validator parity stays distinct (UI `isSafeColor` vs CLI `isCssColor`);
  - export `FontOverrides`/`RadiusOverrides` through both barrels;
  - re-seed Mockup A by transplanting only the token block.

Round 3 (delta on the Codex edit), **backend** approve-with-changes (48k, 38 s): resolved, no new blocker. Carried into implementation:

1. The dev warnings come from the pre-merge validation step, not the web rule generator.
2. Row 2: an unsafe child keeps the parent's value; add a native unit test.
3. Native colours stay unchecked: a known limit, kept so row 9 holds, recorded in the ADR as a follow-up.
4. One pure validator module, imported by both platforms and the CLI test.

Delta (the person's change, "Generalize now in 5.37"), **backend** approve-with-changes (77k, 96 s): 3 high applied (rules must accept the shipped defaults; add the missing key lists with drift checks; built `./theme` export, optional `react-strict-dom` peer, aliases in one module). Carried: native spike per group, row 4 `--json` case, row 7 token names.
Delta re-run, **backend** approve-with-changes (54k, 45 s): the 3 highs resolved. Carried: post-build scripts import `dist/theme.js`; the unknown-group message lists the groups from the table; one `heroReserve` value (272); row 5 checks the `tokens` shape docs.
