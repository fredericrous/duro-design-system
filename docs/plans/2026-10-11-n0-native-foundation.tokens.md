# N0 slice C — Happier colour tokens mapped to Duro (phase C0)

Source: `happier/apps/ui/sources/theme/tokens/themeColorTokenDefinitions.ts`, the 120 editable tokens (internal and derived ones excluded, as Happier classifies them). Target: Duro's 43 colour keys (`@duro-app/tokens/keys`, `ColorToken`).

**Counts:** 49 map to an existing Duro key · 25 are generic gaps (proposed new Duro keys) · 46 are Happier-specific.

**Decided 2026-10-13:** the app-domain rows stay in Happier's theme layer; C3 adds the 25 gap keys to Duro with values derived from Duro's palette.

A row maps only when Duro's own components already use that key for the same role (checked in the component styles); no row is approximate.

| Happier token                                  | Class      | Duro key           | Why / role                                                                   |
| ---------------------------------------------- | ---------- | ------------------ | ---------------------------------------------------------------------------- |
| `background.canvas`                            | maps       | `bg`               |                                                                              |
| `surface.base`                                 | maps       | `bgCard`           |                                                                              |
| `surface.inset`                                | gap        | `bgInset`          | recessed wells, code/editor backgrounds, input-like inner surfaces           |
| `surface.elevated`                             | gap        | `bgElevated`       | selected, lifted, floating surfaces over their parent                        |
| `surface.pressed`                              | maps       | `bgCardHover`      | Duro uses one interactive-state fill for hover and press                     |
| `surface.selected`                             | gap        | `bgSelected`       | selected rows and selectable containers                                      |
| `surface.pressedOverlay`                       | gap        | `pressOverlay`     | overlay drawn over a pressed surface (not inverseFill, which sits on accent) |
| `surface.ripple`                               | gap        | `ripple`           | Android/web touch ripple                                                     |
| `surface.sectionTint`                          | gap        | `bgSectionTint`    | hair of separation for grouped sections                                      |
| `border.default`                               | maps       | `border`           |                                                                              |
| `border.subtle`                                | gap        | `borderSubtle`     | low-emphasis hairlines                                                       |
| `border.surface`                               | maps       | `border`           | Duro cards, popovers and menus stroke with border                            |
| `border.strong`                                | gap        | `borderStrong`     | higher-emphasis outline                                                      |
| `border.modal`                                 | maps       | `border`           | Dialog and Drawer stroke with border                                         |
| `effect.surfaceHighlight`                      | gap        | `surfaceHighlight` | top-edge chrome highlight on bounded surfaces                                |
| `chrome.header.background`                     | maps       | `bgCard`           | AppShell bar uses bgCard                                                     |
| `chrome.header.foreground`                     | maps       | `text`             |                                                                              |
| `text.primary`                                 | maps       | `text`             |                                                                              |
| `text.secondary`                               | maps       | `textMuted`        |                                                                              |
| `text.tertiary`                                | gap        | `textSubtle`       | lowest-emphasis readable text                                                |
| `text.link`                                    | maps       | `accent`           | TextLink uses accent                                                         |
| `text.destructive`                             | maps       | `error`            |                                                                              |
| `text.placeholder`                             | maps       | `textMuted`        | Duro inputs draw placeholders in textMuted                                   |
| `text.disabled`                                | gap        | `textDisabled`     | Duro dims disabled controls with opacity today                               |
| `state.success.foreground`                     | maps       | `success`          |                                                                              |
| `state.success.onTint`                         | maps       | `successText`      |                                                                              |
| `state.success.background`                     | maps       | `successBg`        |                                                                              |
| `state.success.border`                         | maps       | `successBorder`    |                                                                              |
| `state.warning.foreground`                     | maps       | `warning`          |                                                                              |
| `state.warning.onTint`                         | maps       | `warningText`      |                                                                              |
| `state.warning.background`                     | maps       | `warningBg`        |                                                                              |
| `state.warning.border`                         | maps       | `warningBorder`    |                                                                              |
| `state.danger.foreground`                      | maps       | `error`            |                                                                              |
| `state.danger.onTint`                          | maps       | `errorText`        |                                                                              |
| `state.danger.background`                      | maps       | `errorBg`          |                                                                              |
| `state.danger.border`                          | maps       | `errorBorder`      |                                                                              |
| `state.info.foreground`                        | maps       | `info`             |                                                                              |
| `state.info.onTint`                            | maps       | `infoText`         |                                                                              |
| `state.info.background`                        | maps       | `infoBg`           |                                                                              |
| `state.info.border`                            | maps       | `infoBorder`       |                                                                              |
| `state.neutral.foreground`                     | gap        | `neutral`          | neutral status (inactive, unknown), no status meaning                        |
| `state.neutral.onTint`                         | gap        | `neutralText`      |                                                                              |
| `state.neutral.background`                     | gap        | `neutralBg`        |                                                                              |
| `state.neutral.border`                         | gap        | `neutralBorder`    |                                                                              |
| `state.active.foreground`                      | gap        | `active`           | active chips, toolbar pills, segmented choices                               |
| `state.active.onTint`                          | gap        | `activeText`       |                                                                              |
| `state.active.background`                      | gap        | `activeBg`         |                                                                              |
| `state.active.border`                          | gap        | `activeBorder`     |                                                                              |
| `control.button.primary.background`            | maps       | `accent`           |                                                                              |
| `control.button.primary.foreground`            | maps       | `accentContrast`   |                                                                              |
| `control.button.primary.disabled`              | gap        | `accentDisabled`   | Duro dims disabled buttons with opacity today                                |
| `control.button.secondary.background`          | maps       | (transparent)      | transparent in Happier canonical themes; no token                            |
| `control.button.secondary.foreground`          | maps       | `text`             |                                                                              |
| `control.input.background`                     | maps       | `bg`               | Input uses bg                                                                |
| `control.input.foreground`                     | maps       | `text`             |                                                                              |
| `control.input.placeholder`                    | maps       | `textMuted`        |                                                                              |
| `control.switch.track.active`                  | maps       | `accent`           | Switch uses accent                                                           |
| `control.switch.track.inactive`                | maps       | `border`           |                                                                              |
| `control.switch.thumb.active`                  | maps       | `fixedLight`       |                                                                              |
| `control.switch.thumb.inactive`                | maps       | `fixedLight`       |                                                                              |
| `control.radio.active`                         | maps       | `accent`           | RadioGroup uses accent                                                       |
| `control.radio.inactive`                       | maps       | `border`           |                                                                              |
| `control.radio.dot`                            | maps       | `accent`           |                                                                              |
| `control.segmentedControl.trackBackground`     | gap        | `segmentTrack`     | ToggleGroup has no track fill today                                          |
| `control.segmentedControl.activeBackground`    | gap        | `segmentActive`    | raised active segment                                                        |
| `control.fab.background`                       | maps       | `accent`           |                                                                              |
| `control.fab.backgroundPressed`                | maps       | `accentHover`      |                                                                              |
| `control.fab.foreground`                       | maps       | `accentContrast`   |                                                                              |
| `control.permissionButton.allow.background`    | app-domain |                    |                                                                              |
| `control.permissionButton.allow.foreground`    | app-domain |                    |                                                                              |
| `control.permissionButton.deny.background`     | app-domain |                    |                                                                              |
| `control.permissionButton.deny.foreground`     | app-domain |                    |                                                                              |
| `control.permissionButton.allowAll.background` | app-domain |                    |                                                                              |
| `control.permissionButton.allowAll.foreground` | app-domain |                    |                                                                              |
| `control.permissionButton.inactive.background` | app-domain |                    |                                                                              |
| `control.permissionButton.inactive.border`     | app-domain |                    |                                                                              |
| `control.permissionButton.inactive.foreground` | app-domain |                    |                                                                              |
| `control.permissionButton.selected.background` | app-domain |                    |                                                                              |
| `control.permissionButton.selected.border`     | app-domain |                    |                                                                              |
| `control.permissionButton.selected.foreground` | app-domain |                    |                                                                              |
| `focus.ring`                                   | maps       | `accent`           | Duro focus outlines use accent                                               |
| `composer.chipTint`                            | app-domain |                    |                                                                              |
| `message.user.background`                      | app-domain |                    |                                                                              |
| `message.user.foreground`                      | app-domain |                    |                                                                              |
| `message.agent.foreground`                     | app-domain |                    |                                                                              |
| `message.event.foreground`                     | app-domain |                    |                                                                              |
| `syntax.keyword`                               | app-domain |                    |                                                                              |
| `syntax.string`                                | app-domain |                    |                                                                              |
| `syntax.comment`                               | app-domain |                    |                                                                              |
| `syntax.number`                                | app-domain |                    |                                                                              |
| `syntax.function`                              | app-domain |                    |                                                                              |
| `syntax.default`                               | app-domain |                    |                                                                              |
| `versionControl.added.foreground`              | app-domain |                    |                                                                              |
| `versionControl.removed.foreground`            | app-domain |                    |                                                                              |
| `versionControl.added.background`              | app-domain |                    |                                                                              |
| `versionControl.removed.background`            | app-domain |                    |                                                                              |
| `diff.added.background`                        | app-domain |                    |                                                                              |
| `diff.added.foreground`                        | app-domain |                    |                                                                              |
| `diff.removed.background`                      | app-domain |                    |                                                                              |
| `diff.removed.foreground`                      | app-domain |                    |                                                                              |
| `diff.hunk.background`                         | app-domain |                    |                                                                              |
| `diff.hunk.foreground`                         | app-domain |                    |                                                                              |
| `diff.context.foreground`                      | app-domain |                    |                                                                              |
| `diff.inlineAdded.background`                  | app-domain |                    |                                                                              |
| `diff.inlineAdded.foreground`                  | app-domain |                    |                                                                              |
| `diff.inlineRemoved.background`                | app-domain |                    |                                                                              |
| `diff.inlineRemoved.foreground`                | app-domain |                    |                                                                              |
| `permission.default`                           | app-domain |                    |                                                                              |
| `permission.acceptEdits`                       | app-domain |                    |                                                                              |
| `permission.bypass`                            | app-domain |                    |                                                                              |
| `permission.plan`                              | app-domain |                    |                                                                              |
| `permission.readOnly`                          | app-domain |                    |                                                                              |
| `permission.safeYolo`                          | app-domain |                    |                                                                              |
| `permission.yolo`                              | app-domain |                    |                                                                              |
| `overlay.scrimSoft`                            | gap        | `scrimSoft`        | lightweight overlays                                                         |
| `overlay.scrim`                                | maps       | `scrim`            |                                                                              |
| `overlay.scrimStrong`                          | gap        | `scrimStrong`      | high-emphasis overlays                                                       |
| `overlay.scrimWizard`                          | app-domain |                    | guided-flow scrim                                                            |
| `overlay.foreground`                           | maps       | `fixedLight`       | text on a scrim                                                              |
| `overlay.secondaryForeground`                  | gap        | `onScrimMuted`     | secondary text on a scrim                                                    |
