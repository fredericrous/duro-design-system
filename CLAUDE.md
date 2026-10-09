# Duro Design System

> AI-facing guide for code generation. Read this before generating any UI code using Duro components.
>
> **Machine-queryable docs:** run `npx @duro-app/cli manifest --json` once — every component's props,
> every recipe's source, tokens and rules follow from it (`npx @duro-app/cli Button`,
> `npx @duro-app/cli login-form --source-only`, `npx @duro-app/cli "tags that wrap"`).
> As an MCP server: `duro mcp` (tools `duro_ds_lookup` / `duro_ds_list` / `duro_ds_manifest` /
> `duro_ds_mockup_check`).
>
> **Consuming apps:** run `npx -y @duro-app/cli hook install` once in the repo root. It wires a
> Claude Code `SessionStart` hook that puts this catalog in every agent session automatically, and
> a `UserPromptSubmit` hook that, in plan mode only, nudges a plan with a new screen or a material
> UI choice to start from mockup directions — `--check` in CI keeps both from drifting.
> `npx -y @duro-app/cli skill install` adds the `/duro-mockup` skill: token-seeded artboards (`duro mockup seed`), a checker that refuses raw
> values and unnamed controls (`duro mockup check`), and the implement-and-prove steps that follow
> the picked direction. `npx -y @duro-app/cli doctor` checks the app's build wiring
> (`runtimeInjection`, layered extraction, stylesheet import and layer order) — the ways an app
> flattens component spacing while this package's CSS is fine — and whether the build compiles
> `@duro-app/tokens` at all, without which `css.create` cannot import the tokens (StyleX: "ensure
> the theme file has a .stylex.js or .stylex.ts extension"); the session hook runs it too. See
> `packages/cli/README.md`.

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Packages:** `@duro-app/ui` (components), `@duro-app/tokens` (design tokens), `@duro-app/eslint-plugin` (lint rules enforcing the Critical Rules below — `duro.configs.recommended`), `@duro-app/eslint-config` (shareable flat config for consumer repos: `base`/`react`/`effect`/`tests` presets bundling the plugin plus stack policy — UI imports only from `@duro-app/ui`, `@effect/sql` not Kysely, a11y test selectors)
- **Rendering:** [react-strict-dom](https://github.com/nicklockwood/react-strict-dom) — all elements use `html.*` (e.g. `html.div`, `html.button`), **never** raw `<div>` or `<span>`
- **Styling:** `css.create()` from `react-strict-dom` with token references
- **Form validation:** Effect Schema + react-hook-form via `@hookform/resolvers` — `Form` imports from `@duro-app/ui/form` (4.0.0); `react-hook-form` is a required peer, `@hookform/resolvers` and `effect` are needed only by apps that import that subpath
- **React 19**, TypeScript strict mode

<!-- duro:rules:start -->

## Critical Rules

### 1. Always use `html.*` elements (react-strict-dom)

```tsx
// ✅ Correct
import {css, html} from 'react-strict-dom'
<html.div style={styles.container}>...</html.div>

// ❌ Wrong — never use raw HTML tags
<div className="container">...</div>
```

### 2. Deep imports for tokens

```tsx
// ✅ Correct — deep imports
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

// ❌ Wrong — barrel imports break StyleX babel plugin
import {colors, spacing} from '@duro-app/tokens'
```

### 3. Styling with css.create()

```tsx
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

const styles = css.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: borders.hairline,
    maxWidth: sizes.dialogMd,
  },
})

// Apply styles via the style prop (array for composition)
<html.div style={[styles.container, isActive && styles.active]}>
```

<!-- duro:rules:end -->

### 4. Every measure is a token

A width, height, border width, spacing, radius, colour or duration comes from a
token (`sizes.*`, `borders.*`, `spacing.*`, `microSpacing.*`, `radii.*`,
`colors.*`, `duration.*`): ADR-0027, `design-system.every-measure-is-a-token`.
Allowed raw: `0`, relative units (`%`, `vh`, `fr`, `rem`…), keywords (`auto`,
`max-content`…) and a `calc()` of tokens. When no token fits, add one to
`@duro-app/tokens` with the value the design needs — never the nearest one.
Measure props take token keys: `<Grid minColumnWidth="gridColMd">`,
`<ScrollArea.Viewport maxHeight="listMaxH">`. `duro/no-raw-design-values`
reports the rest.

A z-index comes from `layers.*` and a blur from `effects.*` (5.3):
`duro/no-raw-layer-values` warns on the raw ones for the 5.x line, and
becomes an error in the next major. A z-index from `2` to `9` that orders
children inside one component is not a layer and is not reported (5.4,
the rule's `localMax`). On React Native, read the numbers from `LAYERS` in
`@duro-app/tokens/keys`.

## Layout Decision Tree

Pick the right layout component:

| Need                                   | Component   | Key difference                        |
| -------------------------------------- | ----------- | ------------------------------------- |
| Vertical stack of elements             | `Stack`     | flex-direction: column                |
| Horizontal row, **no wrapping**        | `Inline`    | flex-direction: row, nowrap           |
| Horizontal row, **wraps** to next line | `Cluster`   | flex-direction: row, wrap             |
| Multi-column grid                      | `Grid`      | CSS grid, fixed or auto-fit columns   |
| Full page layout with header           | `PageShell` | max-width + padding + optional header |
| App frame: nav rail, header, main      | `AppShell`  | rail becomes a Drawer below `collapseBelow` (`sm`) |
| Reading column + table of contents     | `Grid layout="content-aside"` + `Aside` | sticky aside, one column below `md` |

```tsx
// Vertical list of form fields
<Stack gap="md">
  <Field.Root name="email">...</Field.Root>
  <Field.Root name="password">...</Field.Root>
</Stack>

// Horizontal toolbar, items stay in one line
<Inline gap="sm" align="center">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Inline>

// Tags that wrap to next line when they overflow
<Cluster gap="xs">
  <Badge>React</Badge>
  <Badge>TypeScript</Badge>
  <Badge>Design Systems</Badge>
</Cluster>

// Responsive card grid
<Grid minColumnWidth="gridColMd" gap="md">
  <Card>...</Card>
  <Card>...</Card>
</Grid>
```

## Compound Components

### Hard-required Root (throws without it)

These components **must** be wrapped in their `.Root`:

| Component         | Sub-components                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `Select`          | `Root`, `Trigger`, `Value`, `Icon`, `Popup`, `Item`, `ItemText`                          |
| `Menu`            | `Root`, `Trigger`, `Popup`, `Item`, `LinkItem`                                           |
| `Tabs`            | `Root`, `List`, `Tab`, `Panel`                                                           |
| `Dialog`          | `Root`, `Trigger`, `Portal`, `Header`, `Title`, `Description`, `Body`, `Footer`, `Close` |
| `Drawer`          | `Root`, `Trigger`, `Portal`, `Header`, `Title`, `Description`, `Body`, `Footer`, `Close` |
| `Table`           | `Root`, `Header`, `Body`, `Row`, `HeaderCell`, `Cell`                                    |
| `Tooltip`         | `Root`, `Trigger`                                                                        |
| `Popover`         | `Root`, `Trigger`, `Popup`, `Close`                                                      |
| `SideNav`         | `Root`, `Section`, `Group`, `Item`                                                       |
| `ScrollArea`      | `Root`, `Viewport`, `Content`, `Scrollbar`, `Thumb`                                      |
| `DetailPanel`     | `Root`, `Content`, `Header`, `Title`, `Body`, `Footer`, `Close`                          |
| `Breadcrumb`      | `Root`, `Item`                                                                           |
| `TableOfContents` | `Root`, `Item`                                                                           |
| `PageNav`         | `Root`, `Prev`, `Next`                                                                   |
| `Timeline`        | `Root`, `Row`, `Bar`                                                                     |
| `AppShell`        | `Root` (`brand`, `collapseBelow`, `menuLabel`/`closeLabel`/`skipLabel`), `Rail` (`aria-label`, `footer`), `Header` (optional), `Main` (`id`, `ref`) |

### Optional Root context (works standalone, gains features in context)

| Component     | Sub-components                          | Standalone behavior                                                             |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| `Field`       | `Root`, `Label`, `Description`, `Error` | Static labels/errors; inside `Form` auto-binds to react-hook-form               |
| `Fieldset`    | `Root`, `Legend`                        | Groups form controls with gap                                                   |
| `ToggleGroup` | (wraps `Toggle` children)               | Toggle works alone; group adds multi/single select                              |
| `InputGroup`  | `Root`, `Addon`                         | Input works alone; group adds prefix/suffix addons                              |
| `Panel`       | `Root`, `Header`, `Body`, `Footer`      | Sub-components render correct styles alone; Root provides flex column container |

## Component Quick Reference

<!-- duro:generated:components START -->

| Component | Description | Key props |
| --- | --- | --- |
| **ActionBar** | Floating toolbar that appears at the bottom of the viewport when items are selected | `selectedItemCount`, `selectedLabel`, `isEmphasized` |
| **Alert** | Inline status message with icon | `variant`, `icon` |
| **AppShell** | An application's frame: a navigation rail (a labelled nav, the brand at its top, an optional footer at its foot) beside the main content (main), with an optional Header | compound: Header, Main, Rail, Root |
| **Arrow** | Connector line between two points, with an arrowhead at the end | `from`, `to`, `bend` |
| **Aside** | Content beside the main reading column — a table of contents, related pages: a labelled aside landmark that sticks within the viewport while the page scrolls and scrolls on its own when taller (offset from a spacing token, the raised layer) | `aria-label`, `offset`, `ref` |
| **Badge** | Small label or tag for status indicators, counts, or categories | `variant`, `size` |
| **Breadcrumb** | Where the current page sits in the hierarchy: a labelled nav landmark with an ordered list of links, outermost first | compound: Item, Root |
| **Button** | Standard interactive button | `variant`, `size`, `fullWidth` |
| **ButtonGroup** | Groups related buttons together with consistent spacing and layout | `orientation`, `align`, `disabled` |
| **Callout** | Block-level informational message with icon and colored background | `variant`, `icon`, `align` |
| **Card** | Container with visual styling (elevation, border, or fill) | `variant`, `size`, `header` |
| **Checkbox** | Checkbox input with optional visible label | `name`, `value`, `checked` |
| **CheckboxGroup** | Checkbox group for multi-select from a list of options | compound: Item, Root |
| **Cluster** | Horizontal flex layout that WRAPS to the next line when items overflow | `gap`, `align`, `justify` |
| **CodeBlock** | A block of code with a copy button: a pre that scrolls sideways when a line is long, and a Button that copies its text, shows the copied label for copiedDuration ms and announces it through a polite LiveRegion | `copyLabel`, `copiedLabel`, `copiedDuration` |
| **ColorInput** | A styled native color swatch (<input type="color">) for picking a hex color | `value`, `defaultValue`, `name` |
| **ColorModeToggle** | Color-mode controller + toggle | `size`, `aria-label` |
| **Combobox** | Searchable dropdown for selecting a value from a filterable list | compound: Empty, Input, Item, ItemText, Popup, … |
| **ConfirmDialog** | Destructive-confirmation dialog with an optional type-a-phrase gate | `open`, `onOpenChange`, `title` |
| **DetailPanel** | Non-modal side panel for right-side inspection | compound: Body, Close, Content, Footer, Header, … |
| **Diagram** | Root SVG canvas for a static diagram | `width`, `height`, `title` |
| **Dialog** | Modal dialog with backdrop overlay | compound: Body, Close, Description, Footer, Header, … |
| **DragDrop** | Move items between zones by pointer (mouse, pen and touch through one pointer-event path; touch holds briefly, then drags) or by keyboard (a Handle per item: Space picks up, arrows move, Space drops, Escape cancels) | compound: Handle, Item, Root, Zone |
| **Drawer** | Modal sliding panel from a screen edge (right, left, or bottom) | compound: Body, Close, Description, Footer, Header, … |
| **EmptyState** | Placeholder for empty content areas | `message`, `icon`, `action` |
| **Field** | Compound form field with label, description, and error display | compound: Description, Error, Label, Root |
| **Fieldset** | Groups related form controls with consistent gap spacing and an optional legend | compound: Legend, Root |
| **Form** | Form wrapper with Effect Schema validation and react-hook-form integration | `schema`, `defaultValues`, `onSubmit` |
| **Grid** | Grid layout | `gap`, `columns`, `minColumnWidth` |
| **Heading** | Semantic heading element (h1-h6) with typography presets | `level`, `variant`, `color` |
| **Icon** | SVG icon component | `name`, `size` |
| **Inline** | Horizontal flex layout with NO wrapping | `gap`, `align`, `justify` |
| **Input** | Text input with automatic Field/Form integration | `variant`, `font`, `type` |
| **InputGroup** | Wraps an Input with prefix and/or suffix addons (icons, text, buttons) | compound: Addon, Root |
| **Leader** | A dashed, thin line for callout/annotation leaders | `from`, `to` |
| **LinkButton** | Button-styled hyperlink | `href`, `variant`, `size` |
| **List** | Vertical list of interactive items | compound: Actions, Content, Description, Empty, Item, … |
| **Listbox** | Popup list of options for an input that keeps focus — an editor typeahead (mentions, slash commands) or a custom combobox | compound: Empty, Option, Root, getAnchorProps |
| **LiveRegion** | Tells assistive tech about a change that has no focus move: a polite (role="status") or assertive (role="alert") region | `politeness`, `visuallyHidden`, `id` |
| **Menu** | Dropdown action menu | compound: Item, LinkItem, Popup, Root, Separator, … |
| **Meter** | A scalar inside a known range — WIP 2 of 3, a milestone 40% done — as role="meter" with a value text, drawn as a thin bar (the meterH token) | `value`, `min`, `max` |
| **Node** | A rounded rectangle node with a title and optional subtitle | `x`, `y`, `w` |
| **PageNav** | The previous and next pages in reading order, at the foot of a page: a labelled nav with up to two link cards (a direction label over the page title, both from props) | compound: Next, Prev, Root |
| **PageShell** | Page-level layout wrapper | `maxWidth`, `padding`, `header` |
| **Panel** | Structural primitive for grouping content with header, body, and footer slots | compound: Body, Footer, Header, Root |
| **Popover** | Non-modal anchored overlay for small interactive content | compound: Close, Popup, Root, Trigger |
| **Prose** | The container for HTML Duro does not author — rendered Markdown, CMS output: headings, paragraphs, lists, tables, blockquotes, inline code, links and images are styled from tokens by descendant rules scoped to it (plain CSS in dist/index.css, :where() and its own cascade layer) | `ref` |
| **RadioGroup** | Radio button group for single-select from a list of options | compound: Item, Root |
| **ScrollArea** | Custom scrollbar region with draggable thumb | compound: Content, Root, Scrollbar, Thumb, Viewport |
| **Select** | Dropdown select for choosing one value from a list | compound: Icon, Item, ItemText, Popup, Root, … |
| **SideNav** | Vertical side navigation | compound: Group, Item, Root, Section |
| **Spinner** | Animated loading indicator | `size`, `label` |
| **Stack** | Vertical flex layout | `gap`, `align` |
| **StatusIcon** | Icon with a colored background circle | `name`, `size`, `variant` |
| **Switch** | Toggle switch for on/off settings | `checked`, `defaultChecked`, `onCheckedChange` |
| **Table** | Data table with CSS grid layout | compound: Body, Cell, Container, Header, HeaderCell, … |
| **Table (ui/table)** | Data table with CSS grid layout | compound: Body, Cell, ColumnFilter, Container, FromTanstack, … |
| **TableOfContents** | The "On this page" list of a long page's sections: a labelled nav of in-page links (href="#id", level 2 or 3) | compound: Item, Root |
| **Tabs** | Tabbed interface with keyboard navigation | compound: List, Panel, Root, Tab |
| **Tag** | Interactive tag/chip with optional remove button | `value`, `variant`, `size` |
| **TagGroup** | Compound component for managing a collection of tags | compound: Input, List, Root |
| **Text** | Body and label typography component | `variant`, `color`, `weight` |
| **Text (diagrams)** | Free-floating text inside a Diagram | `x`, `y`, `variant` |
| **TextLink** | Inline hyperlink for running text and standalone text links ("View all", "Edit profile") | `href`, `target`, `rel` |
| **Textarea** | Multi-line text input with automatic Field/Form integration | `variant`, `name`, `placeholder` |
| **Time** | A date or time in running text as a <time> element: the visible text comes from you, the exact instant goes in dateTime (an ISO string) and title | `dateTime`, `title` |
| **Timeline** | Rows of date bars against a date axis (milestones, releases, sprints), with a progress fill per bar and a today marker | compound: Bar, Root, Row |
| **Toggle** | Toggle button with pressed/unpressed state | `pressed`, `defaultPressed`, `onPressedChange` |
| **ToggleGroup** | Container for Toggle buttons enabling single or multi selection | `value`, `defaultValue`, `onValueChange` |
| **Toolbar** | A row of controls with one tab stop (the WAI-ARIA toolbar pattern): Tab enters at the last focused control, Left/Right move across every control inside — through attached ButtonGroups too — and Home/End jump to the ends | `aria-label`, `orientation` |
| **Tooltip** | Hover/focus tooltip that shows supplementary content | compound: Root, Trigger |
| **Tree** | Hierarchy of items with single selection and expandable branches (the WAI-ARIA tree pattern): one tab stop, arrow keys, Home/End, typeahead | compound: Item, Root |
| **VirtualTable** | Sortable data table that windows its rows above a threshold (default 150) with @tanstack/react-virtual, shows a floating position indicator, and reports the visible page so the caller can mirror it in the URL | `data`, `columns`, `sorting` |
| **VisuallyHidden** | Text for assistive tech only: kept in the accessibility tree, clipped off screen | `id` |

Full props, usage guidance and examples: `npx @duro-app/cli <Name>` (or the `duro_ds_lookup` MCP tool).

<!-- duro:generated:components END -->

## Form Composition Pattern

The canonical nesting for forms with validation:

```tsx
import {Schema} from 'effect'
import {Field, Input, Textarea, Fieldset, Button, Select, Checkbox} from '@duro-app/ui'
import {Form} from '@duro-app/ui/form'

// 1. Define your schema
const MySchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: () => 'Enter a valid email'}),
  ),
  name: Schema.String.pipe(
    Schema.minLength(2, {message: () => 'Name must be at least 2 characters'}),
  ),
})

// 2. Compose the form
<Form
  schema={MySchema}
  defaultValues={{email: '', name: ''}}
  onSubmit={(data) => console.log(data)}
>
  {({formState}) => (
    <Fieldset.Root gap="md">
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" placeholder="you@example.com" />
        <Field.Error />
      </Field.Root>

      <Field.Root name="name">
        <Field.Label>Full name</Field.Label>
        <Input placeholder="Jane Doe" />
        <Field.Description>As it appears on your ID</Field.Description>
        <Field.Error />
      </Field.Root>

      <Button type="submit" disabled={!formState.isValid}>
        Submit
      </Button>
    </Fieldset.Root>
  )}
</Form>
```

**Key points:**

- `Form` wraps everything and provides react-hook-form context
- `Field.Root name="..."` auto-binds to the form field matching that schema key
- `Field.Error` auto-displays validation errors (no manual wiring)
- `Field.Root` also works **standalone** (without `Form`) for static labels/errors — pass `invalid` prop manually
- Form children can be a render function `(methods) => ...` to access `formState`, or plain JSX
- Validation mode: `onTouched` (validates on first blur) + `onChange` (revalidates on change)

## Standalone Field (no Form)

```tsx
<Field.Root invalid>
  <Field.Label>Email</Field.Label>
  <Input variant="error" placeholder="Enter email" />
  <Field.Error>This email is already taken.</Field.Error>
</Field.Root>
```

## Token Reference

<!-- duro:generated:tokens START -->

### Spacing Scale

| Token | Value |
| --- | --- |
| `xs` | 4px |
| `sm` | 8px |
| `ms` | 12px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `xxl` | 48px |
| `xxxl` | 64px |

### Micro Spacing

Optical nudges below and between the scale (`microSpacing` from `@duro-app/tokens/tokens/spacing.css`). Not a layout choice: prefer the scale.

| Token | Value |
| --- | --- |
| `px1` | 1px |
| `px2` | 2px |
| `px3` | 3px |
| `px5` | 5px |
| `px6` | 6px |

### Border Radius

| Token | Value |
| --- | --- |
| `xs` | 4px |
| `px6` | 6px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `full` | 9999px |

### Sizes

| Token | Value |
| --- | --- |
| `touchTarget` | 44px |
| `controlSm` | 28px |
| `controlMd` | 39px |
| `controlLg` | 40px |
| `indicator` | 18px |
| `indicatorDot` | 8px |
| `checkMarkW` | 5px |
| `checkMarkH` | 9px |
| `switchTrackW` | 36px |
| `switchTrackH` | 20px |
| `switchThumb` | 16px |
| `iconButton` | 32px |
| `iconButtonSm` | 28px |
| `spinnerSm` | 16px |
| `spinnerMd` | 24px |
| `spinnerLg` | 40px |
| `glyphXs` | 10px |
| `glyphSm` | 12px |
| `glyphMd` | 16px |
| `iconSm` | 16px |
| `iconMd` | 18px |
| `iconLg` | 24px |
| `iconXl` | 36px |
| `iconXxl` | 48px |
| `navMarkerW` | 3px |
| `navMarkerH` | 18px |
| `divider` | 1px |
| `tabIndicator` | 2px |
| `edgeFade` | 32px |
| `scrollbar` | 8px |
| `swatchW` | 44px |
| `swatchH` | 34px |
| `labelMinW` | 120px |
| `popupMinW` | 160px |
| `listMaxH` | 280px |
| `listMaxHSm` | 200px |
| `dialogSm` | 400px |
| `dialogMd` | 520px |
| `dialogLg` | 680px |
| `panelSm` | 360px |
| `panelMd` | 480px |
| `panelLg` | 640px |
| `toastMaxW` | 440px |
| `gridColSm` | 240px |
| `gridColMd` | 280px |
| `pageSm` | 600px |
| `pageMd` | 800px |
| `pageLg` | 1200px |
| `sidebarW` | 240px |
| `pageXs` | 480px |
| `pageXl` | 1440px |
| `asideW` | 320px |
| `gridColXs` | 200px |
| `fieldMinWSm` | 80px |
| `fieldMinW` | 160px |
| `popoverWSm` | 240px |
| `popoverW` | 320px |
| `popupMaxW` | 280px |
| `meterH` | 6px |
| `skeletonChipW` | 96px |
| `dropZoneMinH` | 128px |
| `canvasMinH` | 480px |
| `editorMinH` | 160px |
| `toolbarH` | 36px |
| `embedW` | 550px |
| `colorPickerW` | 196px |
| `colorAreaH` | 150px |
| `colorTrackH` | 12px |
| `colorSwatch` | 20px |
| `colorPreviewH` | 22px |
| `handle` | 16px |
| `chip` | 24px |
| `placeholderMinH` | 80px |
| `previewMaxH` | 320px |
| `barH` | 4px |
| `readoutW` | 40px |
| `sliderW` | 96px |
| `paletteMinW` | 96px |
| `deviceBarW` | 96px |
| `timeGutterW` | 64px |
| `dayHeaderH` | 46px |
| `timelineLabelW` | 180px |
| `appBarH` | 61px |
| `dragThumbW` | 132px |
| `dragThumbH` | 99px |

### Borders

| Token | Value |
| --- | --- |
| `hairline` | 1px |
| `strong` | 2px |
| `accent` | 3px |
| `focusRing` | 2px |
| `focusOffset` | 2px |
| `focusOffsetSm` | 1px |

### Layers

The z-index scale (`layers` from `@duro-app/tokens/tokens/layers.css`). Values order one stacking context: the ThemeProvider portal mount, where Dialog, Drawer, the popups and toasts render. React Native takes the numbers from `LAYERS` in `@duro-app/tokens/keys`.

A floating surface picks its layer by `useInModal()` from `@duro-app/ui`, as a Popover does: `floating` outside a modal, `popover` inside a Dialog or Drawer. `floatingRaised` / `popoverRaised` are the same pair for one floating surface that must cover a sibling floating one (a link editor over a selection format bar); a Popover takes it with `<Popover.Popup raised>`, and a Popover nested in a raised one is raised too. A raised surface never covers a modal: a Dialog opened later still covers it.

| Token | Value |
| --- | --- |
| `raised` | 1 |
| `floating` | 50 |
| `floatingRaised` | 60 |
| `overlay` | 1000 |
| `modal` | 1001 |
| `modalRaised` | 1002 |
| `popover` | 1040 |
| `popoverRaised` | 1041 |
| `popupBackdrop` | 1049 |
| `popup` | 1050 |
| `toast` | 1060 |
| `portal` | 1100 |

### Effects

`effects` from `@duro-app/tokens/tokens/effects.css`. Put `overlayBlur` on a backdrop element only: a `backdropFilter` on an ancestor becomes the containing block for fixed overlays (a Dialog inside it is placed against the ancestor, not the viewport). `surfaceBlur` frosts a surface over imagery (a pill or a chip on a photo) and follows the same rule: put it on that surface element only.

| Token | Value |
| --- | --- |
| `overlayBlur` | blur(2px) |
| `surfaceBlur` | blur(6px) |

<!-- duro:generated:tokens END -->

### Typography Presets

| Preset      | Size    | Weight   | Use for                                 |
| ----------- | ------- | -------- | --------------------------------------- |
| `bodySm`    | 14px    | normal   | Secondary text, metadata                |
| `bodyMd`    | 16px    | normal   | Default body text                       |
| `bodyLg`    | 18px    | normal   | Lead paragraphs                         |
| `caption`   | 12px    | normal   | Fine print, timestamps                  |
| `label`     | 14px    | medium   | Form labels, UI labels                  |
| `code`      | 14px    | normal   | Code snippets (monospace)               |
| `overline`  | 12px    | semibold | Section headers, categories (uppercase) |
| `headingSm` | 20px    | semibold | h4-h6, section headers                  |
| `headingMd` | 24px    | semibold | h3, card titles                         |
| `headingLg` | 30px    | bold     | h2, page sections                       |
| `headingXl` | 36px    | bold     | h1, page titles                         |
| `displaySm` | 36-48px | bold     | Hero text (fluid)                       |
| `displayMd` | 44-60px | bold     | Hero text (fluid)                       |
| `displayLg` | 56-72px | bold     | Hero text (fluid)                       |

### Using tokens from plain CSS

Inside components, always go through `css.create()` with the token imports
above. When an app genuinely needs a token in its own stylesheet (a CSS
module, a global rule), use the published `--duro-*` custom properties:

```css
.card {
  background: var(--duro-color-bg-card);
  border: var(--duro-border-hairline) solid var(--duro-color-border);
  padding: var(--duro-spacing-md);
  border-radius: var(--duro-radius-md);
}
```

Naming is `--duro-<group>-<token>` in kebab-case: `sizes.touchTarget` →
`--duro-size-touch-target`, `borders.hairline` → `--duro-border-hairline`, `colors.bgCard` →
`--duro-color-bg-card`, `spacing.md` → `--duro-spacing-md`, `radii.md` →
`--duro-radius-md`. They come with `@duro-app/ui`'s stylesheet, and they
follow the active theme — including inside a `ThemeProvider` subtree.

**Don't** reference the StyleX variables directly (`var(--bg-xqkwqtp)`). The
hash is a build artefact and changes when StyleX or the defining file does.
**Don't** invent a name and rely on a fallback (`var(--color-bg, #fff)`) —
nothing defines it, so the fallback wins forever and silently ignores the
theme.

`dist/vars.css` is generated from the built tokens by
`packages/tokens/scripts/generate-vars-css.mjs`; it cannot drift from what
StyleX actually emitted, and there is nothing to hand-maintain when a token
is added.

### Color Semantics

| Token                                   | Purpose                              |
| --------------------------------------- | ------------------------------------ |
| `bg`                                    | Page background                      |
| `bgCard`                                | Card/surface background              |
| `bgCardHover`                           | Card hover state                     |
| `text`                                  | Primary text                         |
| `textMuted`                             | Secondary/muted text                 |
| `accent`                                | Primary brand color (links, buttons) |
| `accentHover`                           | Accent hover state                   |
| `accentContrast`                        | Text on accent backgrounds           |
| `border`                                | Default border color                 |
| `error` / `errorBg` / `errorText`       | Error states                         |
| `success` / `successBg` / `successText` | Success states                       |
| `warning` / `warningBg` / `warningText` | Warning states                       |
| `info` / `infoBg` / `infoText`          | Informational states                 |
| `highlight` / `highlightBg` / `highlightText` | A non-status accent: a category or intent (purple), never a state |
| `contrastSurface` / `onContrastSurface` | Opposite-tone surface (toasts, coach marks) and its text |
| `contrastBorder`                        | Border on `contrastSurface` (≥ 3:1 against it)            |
| `overlayLight`                          | Fixed translucent white over content (light counterpart of `scrim`) |

### Shadows

| Token | Value                                |
| ----- | ------------------------------------ |
| `sm`  | Subtle — cards, dropdowns            |
| `md`  | Medium — popovers, floating elements |
| `lg`  | Strong — modals, dialogs             |
| `dropReady` | Drop-target ring: a zone that can receive (DragDrop) |
| `dropOver`  | Drop-target ring: the zone under the pointer (not a focus ring) |

### Layout Spacing (semantic)

| Token                       | Value   | Use for                         |
| --------------------------- | ------- | ------------------------------- |
| `stackXs`-`stackXl`         | 4-48px  | Vertical rhythm (Stack gaps)    |
| `inlineXs`-`inlineLg`       | 4-24px  | Horizontal rhythm (Inline gaps) |
| `containerSm`-`containerLg` | 16-32px | Page/section padding            |

## Icon Names

<!-- duro:generated:icons START -->

**Stroke icons:** `x-circle`, `check-circle`, `check-done`, `clock`, `forbidden`, `info-circle`, `alert-triangle`, `shield`, `lock`, `key`

**Navigation / wayfinding glyphs:** `map`, `layers`, `repeat`, `database`, `shield-check`, `route`, `git-branch`, `menu`, `pin`

**Infrastructure / inventory glyphs:** `server`, `hard-drive`, `box`, `image`, `tag`, `pie-chart`

**People / access / admin glyphs:** `users`, `user-plus`, `mail`, `file-text`, `plug`

**Input / action glyphs:** `search`, `mic`

**Color-mode glyphs:** `sun`, `moon`, `monitor`, `contrast`

**Device status glyphs:** `signal`, `battery`

**Filled variants (solid shape with cutout symbol):** `info-circle-filled`, `alert-triangle-filled`, `check-circle-filled`, `x-circle-filled`, `shield-filled`, `lock-filled`



Sizes: `lg` 24px · `md` 18px · `sm` 16px · `xl` 36px · `xxl` 48px — `<Icon name="server" size="md" />`

<!-- duro:generated:icons END -->

## Component guidance

Hand-written judgment that props alone can't carry. (Per-component reference: `npx @duro-app/cli <Name>`.)

### Form

**Import `Form` from `@duro-app/ui/form`, not the package root** (since
4.0.0). `Form` is the only component that needs `@hookform/resolvers` and
`effect`; keeping it behind a subpath keeps those two optional peers genuinely
optional for apps that never validate a schema. `Field`, `Input`, `Textarea`
and the rest stay on the root and auto-bind when rendered inside a `Form`
(they need only `react-hook-form`, a required peer):

```tsx
import {Form} from '@duro-app/ui/form'
```

Migrating from 3.x is that one line. `FormProps` moves with it;
`LabelPosition` and `NecessityIndicator` stay root type exports.

### Data Table

**Import from `@duro-app/ui/table`, not the package root.** Everything that
touches TanStack — `FromTanstack`, `Pagination`, `SortChip`, `SortIndicator`,
`ColumnFilter`, `useDataTable`, `VirtualTable` — lives behind that subpath, so
`@tanstack/react-table` stays an optional peer for apps that never render a
data table:

```tsx
import {Table, useDataTable} from '@duro-app/ui/table'
```

The object it exports is the root's `Table` with those pieces attached, so
`Table.Root`, `Table.Header` and friends behave identically — only the import
specifier differs. Plain presentational tables can keep importing `Table` from
the root and need no TanStack install at all.

**Prefer `Table.FromTanstack` when your data has a TanStack table instance** — it collapses the
`flexRender`/header/body ceremony into one component and wires SortChip, Pagination, and
clickable-row keyboard activation. See `npx @duro-app/cli data-table --source-only`.

#### Don't

- ❌ **Don't wrap in `Table.Container`** for new code — Root handles the
  container query itself. `Container` is kept as a deprecated passthrough
  for backwards compatibility.
- ❌ **Don't pass `label` on `Table.HeaderCell` when `children` is a plain
  string** — the text is auto-used as the stack-mode label. Only set
  `label` when the header is JSX with no plain-text fallback (icon, etc).
- ❌ **Don't pass `isActions` on `Table.HeaderCell`** — it does nothing.
  The cell-level `isActions` is what drives stack-mode footer layout.

### Side Navigation

**Default to `SideNav.Section` — always-open, labelled blocks.** A rail's job
is to advertise where you can go. An always-open list keeps the whole
information architecture scannable and puts every destination one click away;
the uppercase label already does the chunking work, so you get the grouping
benefit without hiding anything. `SideNav.Group` renders the same block behind
a chevron, which costs every destination inside it an extra click and removes
it from scanning.

```tsx
import {SideNav, Icon} from '@duro-app/ui'
;<SideNav.Root value={pathname} onValueChange={(v) => navigate(v)}>
  <SideNav.Section label="Infrastructure">
    <SideNav.Item value="/nodes" icon={<Icon name="server" size="md" />}>
      Nodes
    </SideNav.Item>
    <SideNav.Item value="/storage" icon={<Icon name="hard-drive" size="md" />}>
      Storage
    </SideNav.Item>
  </SideNav.Section>
  {/* Disclosure, earned: rarely visited, so it starts collapsed. */}
  <SideNav.Group label="Advanced">
    <SideNav.Item value="/plugins" icon={<Icon name="plug" size="md" />}>
      Plugins
    </SideNav.Item>
  </SideNav.Group>
</SideNav.Root>
```

**`Group` has to buy back the click it costs.** It does when the region is:

- **rare or advanced** — "Advanced", "Danger zone", "Legacy". Disclose the
  seldom-used, never the everyday.
- **unbounded / data-driven** — one entry per namespace, project or team. You
  cannot author-flatten a list whose length you don't control.
- **one of many in a long rail** (beyond ~30 leaves) where a flat list stops
  reading as an overview and becomes a wall.

The healthy shape is a **mix**: flat `Section`s for the journey, one collapsed
`Group` at the bottom. A rail where _every_ block is a `Group` is the smell —
it hides the entire IA behind chevrons and makes the user hunt.

**Neither is a tree.** Arbitrary-depth _data_ browsing (a file tree, a
namespace → resource drill-down) is `Tree`: `role="tree"`, roving tabindex,
typeahead and `aria-level`. Don't nest `SideNav` to fake it.

### Toolbar and attached groups

**`ButtonGroup attached` joins mixed controls; `Toolbar` gives them one tab
stop.** An editor toolbar is a `Toolbar` holding attached groups and menus:

```tsx
<Toolbar aria-label="Formatting">
  <ButtonGroup attached aria-label="Text style">
    <Select.Root defaultValue="normal">…</Select.Root>
    <Select.Root defaultValue="arial">…</Select.Root>
  </ButtonGroup>
  <ButtonGroup attached aria-label="Format">
    <Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>B</Toggle>
    <Popover.Root>
      <Popover.Trigger aria-label="Link">…</Popover.Trigger>
      <Popover.Popup label="Link">…</Popover.Popup>
    </Popover.Root>
  </ButtonGroup>
  <Menu.Root>…</Menu.Root>
</Toolbar>
```

- An attached group joins `Button`, `Toggle` and the `Select`, `Menu` and
  `Popover` triggers, in any mix: shared borders, square inner corners, the
  outer corners round. Use `ToggleGroup` instead when the toggles share one
  selection.
- In a `Toolbar`, Left/Right move across every control (Up/Down when
  vertical), Home/End jump to the ends. A `Select` or `Menu` trigger keeps its
  own keys: a closed Select opens on ArrowDown/ArrowUp, so a vertical toolbar
  cannot hold one. A closed Menu trigger handles no arrow key (Enter or Space
  opens it), so a Menu can sit in a vertical toolbar.
- What a popup holds (a Popover's form, a Menu's items) is outside the group
  and the toolbar: its buttons are round and in the normal tab order.
- A compact toolbar uses `size="small"` on every control: `Toggle`, `Button`
  and the `Select`, `Menu` and `Popover` triggers share Toggle's small
  padding and font, and every small control is at least `controlSm` (28px)
  tall whatever it holds, so text and 18px icons line up (5.6). A small
  `Menu.Trigger variant="ghost"` is `iconButtonSm`.

### Drag and drop on a board

**A board is list zones, cards with a Handle, and an app-supplied
`announce`.** A column is `<DragDrop.Zone list orientation="vertical">`
(a labelled `role="list"`, its Items list items); each card puts its face in
a `DragDrop.Handle`, the keyboard path: one tab stop per column, Space picks
up, arrows move (Left/Right follow the zones' `order`), Space or Enter
drops, Escape cancels. Pass `announce` so the live-region strings come from
the app's catalog, and `renderPlaceholder` for the insertion slot.

- A zone inside an Item (an attach target on a card) wins over its column
  for what it accepts; `accepts` returning `false` lets the item fall
  through to the column.
- Refuse out loud with `{ok: false, reason}`: the reason rides on the ghost
  and is announced. There is no async veto: decide from the item.
- The keyboard path is not a click path: WCAG 2.5.7 still wants a button or
  menu that moves the item for a single pointer.
- `Timeline.Bar dropZone` makes a milestone bar a zone of the same Root.

### Links and client-side routing

**Every link part renders a real `<a href>` and takes `onNavigate`** —
`TextLink`, `LinkButton`, `Breadcrumb.Item`, `TableOfContents.Item`,
`PageNav.Prev` / `Next`, and `Tree.Item` with `href` (ADR-0002 in
`docs/adr/`). The part calls `onNavigate(href, event)` for a plain primary
click only (no modifier key, no `target`); cmd-click, middle-click and "Copy
link" keep the browser default. The part never prevents the default itself:

```tsx
const go: OnNavigate = (href, event) => {
  event.preventDefault()
  navigate(href) // your router's navigate
}

<Breadcrumb.Root aria-label="Breadcrumb">
  <Breadcrumb.Item href="/docs" onNavigate={go}>Docs</Breadcrumb.Item>
  <Breadcrumb.Item current>AI-ops platform</Breadcrumb.Item>
</Breadcrumb.Root>
```

`Breadcrumb.Item` is a link (`href`, `onNavigate`) or the current page
(`current`), never both; `TableOfContents.Root` takes `open` / `defaultOpen` /
`onOpenChange` only with `variant="menu"`. Without `onNavigate` a link does a
normal page load. Don't wrap a part in your router's `Link`, and don't put an
`onClick` on a wrapper to intercept it.

### Docs pages and rendered Markdown

**A docs page is `AppShell` + `Grid layout="content-aside"` + `Prose`.** The
pieces a reader page needs, each owning its accessibility:

```tsx
<AppShell.Root
  menuLabel="Menu"
  closeLabel="Close navigation"
  skipLabel="Skip to content"
  brand={<TextLink href="/">kb-vision</TextLink>}
>
  <AppShell.Rail aria-label="Navigation" footer={<UserMenu />}>
    {({close}) => <DocsNav onPick={close} />}
  </AppShell.Rail>
  <AppShell.Header>{search}</AppShell.Header>
  <AppShell.Main>
    <Grid ref={pageRef} layout="content-aside" gap="xl">
      <Prose>
        <ReactMarkdown components={{pre: ({children}) => <CodeBlock copyLabel="Copy" copiedLabel="Copied">{children}</CodeBlock>}}>
          {body}
        </ReactMarkdown>
      </Prose>
      <Aside aria-label="Page outline">{toc}</Aside>
    </Grid>
  </AppShell.Main>
</AppShell.Root>
```

- **`AppShell`** is generic: `Header` is optional (below `collapseBelow` the
  shell's own sticky bar still holds the Menu button and `brand`, and the
  Header's content joins them; above, the Header scrolls with the page), the
  `brand` sits at the top of the rail, `footer` at its foot (the user, a
  licence line). `collapseBelow` is `sm` (default), `md` or `lg`, on the
  shell's own width. Keep `Header` a direct child of `Root`. The skip link
  (`skipLabel`) is the first tab stop and focuses `Main`; an `Aside` inside
  `Main` sticks below the bar (`appBarH`).
- **`Prose`** styles HTML you do not write as JSX (headings, lists, tables,
  blockquotes, inline code, links, images) from tokens. Its rules are plain
  CSS in `dist/index.css`, in their own cascade layer (`duro-prose`, after
  the reset and before every component style) and wrapped in `:where()`: a
  Duro component inside it keeps its styles, and an app's CSS Module wins.
- **`useContainerBelow(ref, 'md')`** answers what CSS cannot choose (a TOC as
  a list or a menu, buttons or an overflow `Menu`) from the element's own
  width; `false` on the server, so the wide layout renders first. Hand it the
  `ref` of `Grid`, `Aside` or `AppShell.Main`.
- **`Time`** + **`relative(date, {now, locale})`**: pass the `now` your loader
  read, never `Date.now()` in render, or hydration sees two strings.
- **`LiveRegion`** is mounted from the start and changes its content to
  announce ("Link copied"); never mount it with the message.

## Canonical Recipes

<!-- duro:generated:recipes START -->

Complete, runnable compositions. Each emits consumer-ready source (imports already point at the published packages):

- **action-menu** — Dropdown action menu with button trigger, action items, and a link item. `npx @duro-app/cli action-menu --source-only`
- **admin-detail-page** — Admin detail page for one record: a Breadcrumb back to the collection, heading with status and actions, then Tabs whose panels hold the sections (the /admin/<collection>/:id shape). `npx @duro-app/cli admin-detail-page --source-only`
- **data-table** — Striped data table with badge status column. `npx @duro-app/cli data-table --source-only`
- **empty-state** — Empty state inside a card with icon and action button. `npx @duro-app/cli empty-state --source-only`
- **filter-bar** — Filter bar with Select dropdowns, ToggleGroup for view switching, and reset button. `npx @duro-app/cli filter-bar --source-only`
- **login-form** — Login form with username/password fields and Effect Schema validation. `npx @duro-app/cli login-form --source-only`
- **page-with-sidenav** — Page with a side navigation rail: SideNav in the narrow column of Grid layout="split-wide", the routed content in the wide one; the rail stacks above the content when the page is narrower than md. `npx @duro-app/cli page-with-sidenav --source-only`
- **settings-page** — Full settings page with tabbed navigation, profile form, notification switches, and page shell. `npx @duro-app/cli settings-page --source-only`
- **split-pane** — List/detail split: a selectable List beside a Panel showing the selection, on Grid layout="split" (list ≥ 240px, one column when the board is narrower than sm). `npx @duro-app/cli split-pane --source-only`

One inline exemplar (the others follow the same shape — fetch them with the CLI):

### Login Form

```tsx
import {Schema} from 'effect'
import {css, html} from 'react-strict-dom'
import {Field, Input, Fieldset, Button, Stack, Heading} from '@duro-app/ui'
import {Form} from '@duro-app/ui/form'

import {sizes} from '@duro-app/tokens/tokens/sizes.css'

const LoginSchema = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, {message: () => 'Username must be at least 3 characters'}),
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, {message: () => 'Password must be at least 8 characters'}),
  ),
})

const styles = css.create({
  wrap: {maxWidth: sizes.dialogSm},
})

export function LoginFormRecipe() {
  return (
    <html.div style={styles.wrap}>
      <Stack gap="lg">
        <Heading level={2}>Log in</Heading>
        <Form
          schema={LoginSchema}
          defaultValues={{username: '', password: ''}}
          onSubmit={(data) => console.log('login', data)}
        >
          {({formState}) => (
            <Fieldset.Root gap="md">
              <Field.Root name="username">
                <Field.Label>Username</Field.Label>
                <Input placeholder="Enter username" />
                <Field.Error />
              </Field.Root>

              <Field.Root name="password">
                <Field.Label>Password</Field.Label>
                <Input type="password" placeholder="Enter password" />
                <Field.Error />
              </Field.Root>

              <Button type="submit" disabled={!formState.isValid}>
                Log in
              </Button>
            </Fieldset.Root>
          )}
        </Form>
      </Stack>
    </html.div>
  )
}
```

<!-- duro:generated:recipes END -->

<!-- amont:start -->

## Git hooks (amont)

This repository enforces pre-commit / pre-push checks that can REJECT a
commit or a push. What runs, the branch-name rule, and why `git commit`
and `git push` both need a long timeout — or a background run — are in
[AGENTS.md](AGENTS.md) — read it before committing. Both files are
generated: run `amont agents-md` after changing either.

<!-- amont:end -->
