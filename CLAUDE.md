# Duro Design System

> AI-facing guide for code generation. Read this before generating any UI code using Duro components.
>
> **Machine-queryable docs:** run `npx @duro-app/cli manifest --json` once — every component's props,
> every recipe's source, tokens and rules follow from it (`npx @duro-app/cli Button`,
> `npx @duro-app/cli login-form --source-only`, `npx @duro-app/cli "tags that wrap"`).
> As an MCP server: `duro mcp` (tools `duro_lookup` / `duro_list` / `duro_manifest`).

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Packages:** `@duro-app/ui` (components), `@duro-app/tokens` (design tokens), `@duro-app/eslint-plugin` (lint rules enforcing the Critical Rules below — `duro.configs.recommended`)
- **Rendering:** [react-strict-dom](https://github.com/nicklockwood/react-strict-dom) — all elements use `html.*` (e.g. `html.div`, `html.button`), **never** raw `<div>` or `<span>`
- **Styling:** `css.create()` from `react-strict-dom` with token references
- **Form validation:** Effect Schema + react-hook-form via `@hookform/resolvers`
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
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

const styles = css.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
  },
})

// Apply styles via the style prop (array for composition)
<html.div style={[styles.container, isActive && styles.active]}>
```

<!-- duro:rules:end -->

## Layout Decision Tree

Pick the right layout component:

| Need                                   | Component   | Key difference                        |
| -------------------------------------- | ----------- | ------------------------------------- |
| Vertical stack of elements             | `Stack`     | flex-direction: column                |
| Horizontal row, **no wrapping**        | `Inline`    | flex-direction: row, nowrap           |
| Horizontal row, **wraps** to next line | `Cluster`   | flex-direction: row, wrap             |
| Multi-column grid                      | `Grid`      | CSS grid, fixed or auto-fit columns   |
| Full page layout with header           | `PageShell` | max-width + padding + optional header |

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
<Grid minColumnWidth="280px" gap="md">
  <Card>...</Card>
  <Card>...</Card>
</Grid>
```

## Compound Components

### Hard-required Root (throws without it)

These components **must** be wrapped in their `.Root`:

| Component     | Sub-components                                                                           |
| ------------- | ---------------------------------------------------------------------------------------- |
| `Select`      | `Root`, `Trigger`, `Value`, `Icon`, `Popup`, `Item`, `ItemText`                          |
| `Menu`        | `Root`, `Trigger`, `Popup`, `Item`, `LinkItem`                                           |
| `Tabs`        | `Root`, `List`, `Tab`, `Panel`                                                           |
| `Dialog`      | `Root`, `Trigger`, `Portal`, `Header`, `Title`, `Description`, `Body`, `Footer`, `Close` |
| `Drawer`      | `Root`, `Trigger`, `Portal`, `Header`, `Title`, `Description`, `Body`, `Footer`, `Close` |
| `Table`       | `Root`, `Header`, `Body`, `Row`, `HeaderCell`, `Cell`                                    |
| `Tooltip`     | `Root`, `Trigger`                                                                        |
| `SideNav`     | `Root`, `Section`, `Group`, `Item`                                                       |
| `ScrollArea`  | `Root`, `Viewport`, `Content`, `Scrollbar`, `Thumb`                                      |
| `DetailPanel` | `Root`, `Content`, `Header`, `Title`, `Body`, `Footer`, `Close`                          |

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
| **Arrow** | Connector line between two points, with an arrowhead at the end | `from`, `to`, `bend` |
| **Badge** | Small label or tag for status indicators, counts, or categories | `variant`, `size` |
| **Button** | Standard interactive button | `variant`, `size`, `fullWidth` |
| **ButtonGroup** | Groups related buttons together with consistent spacing and layout | `orientation`, `align`, `disabled` |
| **Callout** | Block-level informational message with icon and colored background | `variant`, `icon`, `align` |
| **Card** | Container with visual styling (elevation, border, or fill) | `variant`, `size`, `header` |
| **Checkbox** | Checkbox input with optional visible label | `name`, `value`, `checked` |
| **CheckboxGroup** | Checkbox group for multi-select from a list of options | compound: Item, Root |
| **Cluster** | Horizontal flex layout that WRAPS to the next line when items overflow | `gap`, `align`, `justify` |
| **ColorInput** | A styled native color swatch (<input type="color">) for picking a hex color | `value`, `defaultValue`, `name` |
| **ColorModeToggle** | Color-mode controller + toggle | `size`, `aria-label` |
| **Combobox** | Searchable dropdown for selecting a value from a filterable list | compound: Empty, Input, Item, ItemText, Popup, … |
| **ConfirmDialog** | Destructive-confirmation dialog with an optional type-a-phrase gate | `open`, `onOpenChange`, `title` |
| **DetailPanel** | Non-modal side panel for right-side inspection | compound: Body, Close, Content, Footer, Header, … |
| **Diagram** | Root SVG canvas for a static diagram | `width`, `height`, `title` |
| **Dialog** | Modal dialog with backdrop overlay | compound: Body, Close, Description, Footer, Header, … |
| **Drawer** | Modal sliding panel from a screen edge (right, left, or bottom) | compound: Body, Close, Description, Footer, Header, … |
| **EmptyState** | Placeholder for empty content areas | `message`, `icon`, `action` |
| **Field** | Compound form field with label, description, and error display | compound: Description, Error, Label, Root |
| **Fieldset** | Groups related form controls with consistent gap spacing and an optional legend | compound: Legend, Root |
| **Form** | Form wrapper with Effect Schema validation and react-hook-form integration | `schema`, `defaultValues`, `onSubmit` |
| **Grid** | CSS grid layout | `gap`, `columns`, `minColumnWidth` |
| **Heading** | Semantic heading element (h1-h6) with typography presets | `level`, `variant`, `color` |
| **Icon** | SVG icon component | `name`, `size` |
| **Inline** | Horizontal flex layout with NO wrapping | `gap`, `align`, `justify` |
| **Input** | Text input with automatic Field/Form integration | `variant`, `font`, `type` |
| **InputGroup** | Wraps an Input with prefix and/or suffix addons (icons, text, buttons) | compound: Addon, Root |
| **Leader** | A dashed, thin line for callout/annotation leaders | `from`, `to` |
| **LinkButton** | Button-styled hyperlink | `href`, `variant`, `size` |
| **List** | Vertical list of interactive items | compound: Actions, Content, Description, Empty, Item, … |
| **Menu** | Dropdown action menu | compound: Item, LinkItem, Popup, Root, Trigger |
| **Node** | A rounded rectangle node with a title and optional subtitle | `x`, `y`, `w` |
| **PageShell** | Page-level layout wrapper | `maxWidth`, `padding`, `header` |
| **Panel** | Structural primitive for grouping content with header, body, and footer slots | compound: Body, Footer, Header, Root |
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
| **Tabs** | Tabbed interface with keyboard navigation | compound: List, Panel, Root, Tab |
| **Tag** | Interactive tag/chip with optional remove button | `value`, `variant`, `size` |
| **TagGroup** | Compound component for managing a collection of tags | compound: Input, List, Root |
| **Text** | Body and label typography component | `variant`, `color`, `weight` |
| **Text (diagrams)** | Free-floating text inside a Diagram | `x`, `y`, `variant` |
| **Textarea** | Multi-line text input with automatic Field/Form integration | `variant`, `name`, `placeholder` |
| **Toggle** | Toggle button with pressed/unpressed state | `pressed`, `defaultPressed`, `onPressedChange` |
| **ToggleGroup** | Container for Toggle buttons enabling single or multi selection | `value`, `defaultValue`, `onValueChange` |
| **Tooltip** | Hover/focus tooltip that shows supplementary content | compound: Root, Trigger |
| **VirtualTable** | Sortable data table that windows its rows above a threshold (default 150) with @tanstack/react-virtual, shows a floating position indicator, and reports the visible page so the caller can mirror it in the URL | `data`, `columns`, `sorting` |

Full props, usage guidance and examples: `npx @duro-app/cli <Name>` (or the `duro_lookup` MCP tool).

<!-- duro:generated:components END -->

## Form Composition Pattern

The canonical nesting for forms with validation:

```tsx
import {Schema} from 'effect'
import {Form, Field, Input, Textarea, Fieldset, Button, Select, Checkbox} from '@duro-app/ui'

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

### Border Radius

| Token | Value |
| --- | --- |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `full` | 9999px |

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
  border: 1px solid var(--duro-color-border);
  padding: var(--duro-spacing-md);
  border-radius: var(--duro-radius-md);
}
```

Naming is `--duro-<group>-<token>` in kebab-case: `colors.bgCard` →
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

### Shadows

| Token | Value                                |
| ----- | ------------------------------------ |
| `sm`  | Subtle — cards, dropdowns            |
| `md`  | Medium — popovers, floating elements |
| `lg`  | Strong — modals, dialogs             |

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

**Color-mode glyphs:** `sun`, `moon`, `monitor`, `contrast`

**Filled variants (solid shape with cutout symbol):** `info-circle-filled`, `alert-triangle-filled`, `check-circle-filled`, `x-circle-filled`, `shield-filled`, `lock-filled`



Sizes: `lg` 24px · `md` 18px · `sm` 16px · `xl` 36px · `xxl` 48px — `<Icon name="server" size="md" />`

<!-- duro:generated:icons END -->

## Component guidance

Hand-written judgment that props alone can't carry. (Per-component reference: `npx @duro-app/cli <Name>`.)

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
namespace → resource drill-down) needs `role="tree"` with roving tabindex,
typeahead and `aria-level`. Don't nest `SideNav` to fake it.

## Canonical Recipes

<!-- duro:generated:recipes START -->

Complete, runnable compositions. Each emits consumer-ready source (imports already point at the published packages):

- **action-menu** — Dropdown action menu with button trigger, action items, and a link item. `npx @duro-app/cli action-menu --source-only`
- **data-table** — Striped data table with badge status column. `npx @duro-app/cli data-table --source-only`
- **empty-state** — Empty state inside a card with icon and action button. `npx @duro-app/cli empty-state --source-only`
- **filter-bar** — Filter bar with Select dropdowns, ToggleGroup for view switching, and reset button. `npx @duro-app/cli filter-bar --source-only`
- **login-form** — Login form with username/password fields and Effect Schema validation. `npx @duro-app/cli login-form --source-only`
- **settings-page** — Full settings page with tabbed navigation, profile form, notification switches, and page shell. `npx @duro-app/cli settings-page --source-only`

One inline exemplar (the others follow the same shape — fetch them with the CLI):

### Login Form

```tsx
import {Schema} from 'effect'
import {css, html} from 'react-strict-dom'
import {Form, Field, Input, Fieldset, Button, Stack, Heading} from '@duro-app/ui'

const LoginSchema = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, {message: () => 'Username must be at least 3 characters'}),
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, {message: () => 'Password must be at least 8 characters'}),
  ),
})

const styles = css.create({
  wrap: {maxWidth: 400},
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
