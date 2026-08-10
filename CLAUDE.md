# Duro Design System

> AI-facing guide for code generation. Read this before generating any UI code using Duro components.

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Packages:** `@duro-app/ui` (components), `@duro-app/tokens` (design tokens), `@duro-app/eslint-plugin` (lint rules enforcing the Critical Rules below — `duro.configs.recommended`)
- **Rendering:** [react-strict-dom](https://github.com/nicklockwood/react-strict-dom) — all elements use `html.*` (e.g. `html.div`, `html.button`), **never** raw `<div>` or `<span>`
- **Styling:** `css.create()` from `react-strict-dom` with token references
- **Form validation:** Effect Schema + react-hook-form via `@hookform/resolvers`
- **React 19**, TypeScript strict mode

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

| Component         | Description                             | Key props                                                                                            | Use instead of                                     |
| ----------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **ActionBar**     | Floating bulk-selection toolbar         | `selectedItemCount`, `isEmphasized`, `bottomOffset`                                                  | Custom fixed toolbar                               |
| **Alert**         | Inline status message with icon         | `variant: 'error'\|'success'\|'warning'\|'info'`                                                     | Custom banner                                      |
| **Badge**         | Small label/tag                         | `variant`, `size: 'sm'\|'md'`                                                                        | Custom pill/chip                                   |
| **Button**        | Interactive button                      | `variant: 'primary'\|'secondary'\|'inverseSecondary'\|'link'\|'danger'`, `size`, `fullWidth`         | `<button>`                                         |
| **Callout**       | Block-level informational message       | `variant: 'error'\|'success'\|'warning'\|'info'`                                                     | Alert (use Callout for larger, prominent messages) |
| **Card**          | Container with visual styling           | `variant: 'elevated'\|'outlined'\|'filled'\|'interactive'`, `size`, `header`                         | Custom container div                               |
| **Checkbox**      | Checkbox input with label               | `checked`, `defaultChecked`, `onChange`                                                              | `<input type="checkbox">`                          |
| **DetailPanel**   | Non-modal right-side inspection panel   | `open`, `onOpenChange`, `size: 'sm'\|'md'`, `label`                                                  | Custom side panel                                  |
| **Dialog**        | Modal dialog with backdrop              | `open`, `onOpenChange`, `dismissable`, sizes: `'sm'\|'md'\|'lg'`                                     | Custom modal                                       |
| **Drawer**        | Sliding panel from edge                 | `open`, `onOpenChange`, `anchor: 'right'\|'left'\|'bottom'`, sizes: `'sm'\|'md'\|'lg'`               | Custom side panel                                  |
| **Cluster**       | Horizontal flex, **wraps**              | `gap`, `align`, `justify`                                                                            | `<div style="flex-wrap:wrap">`                     |
| **EmptyState**    | Placeholder for empty content           | `message`, `icon`, `action`                                                                          | Custom empty view                                  |
| **Field**         | Form field with label/error             | `name` (for Form binding), `invalid`                                                                 | Custom label + input wiring                        |
| **Fieldset**      | Groups related form controls            | `gap`, `disabled`                                                                                    | `<fieldset>`                                       |
| **Form**          | Form with Effect Schema validation      | `schema`, `defaultValues`, `onSubmit`                                                                | `<form>` + manual RHF setup                        |
| **Grid**          | CSS grid layout                         | `columns: 1-6`, `minColumnWidth`, `gap`                                                              | Custom CSS grid                                    |
| **Heading**       | Semantic heading (h1-h6)                | `level: 1-6`, `variant`, `color`                                                                     | `<h1>`-`<h6>`                                      |
| **Icon**          | SVG icon                                | `name: IconName`, `size: 'sm'\|'md'\|'lg'\|'xl'\|'xxl'` (16/18/24/36/48px)                           | Inline SVGs                                        |
| **Inline**        | Horizontal flex, **no wrap**            | `gap`, `align`, `justify`                                                                            | `<div style="display:flex">`                       |
| **Input**         | Text input                              | `type`, `variant: 'default'\|'error'`                                                                | `<input>`                                          |
| **InputGroup**    | Input with prefix/suffix addons         | Wraps `Input` + `Addon` children                                                                     | Custom input wrapper                               |
| **LinkButton**    | Button-styled link                      | `href`, `variant: 'primary'\|'secondary'`, `target`                                                  | `<a>` styled as button                             |
| **Menu**          | Dropdown action menu                    | Compound: `Root > Trigger + Popup > Item\|LinkItem`                                                  | Custom dropdown                                    |
| **PageShell**     | Page-level layout                       | `maxWidth: 'sm'\|'md'\|'lg'\|'full'`, `padding`, `header`                                            | Custom page wrapper                                |
| **Panel**         | Structural content container with slots | `bordered`, sub-components: `Header`, `Body` (`padded`), `Footer`                                    | Custom section wrapper                             |
| **ScrollArea**    | Custom scrollbar region                 | Compound: `Root > Viewport > Content`, `Scrollbar > Thumb`                                           | `overflow: auto`                                   |
| **Select**        | Dropdown select                         | Compound: `Root > Trigger + Popup > Item`                                                            | `<select>`                                         |
| **SideNav**       | Side navigation                         | Compound: `Root > Section > Item` (`Group` = collapsible variant of `Section`)                       | Custom nav sidebar                                 |
| **Spinner**       | Loading indicator                       | `size: 'sm'\|'md'\|'lg'`, `label`                                                                    | Custom loader                                      |
| **Stack**         | Vertical flex layout                    | `gap`, `align`                                                                                       | `<div style="flex-direction:column">`              |
| **StatusIcon**    | Icon with colored background            | `name`, `variant`, `size`                                                                            | Icon + custom wrapper                              |
| **Switch**        | Toggle switch                           | `checked`, `onCheckedChange`, `disabled`                                                             | `<input type="checkbox">` styled as switch         |
| **Table**         | Data table                              | `variant: 'default'\|'striped'\|'bordered'`, `size`, `columns`                                       | `<table>`                                          |
| **Tabs**          | Tabbed interface                        | `orientation: 'horizontal'\|'vertical'`, `value`, `onValueChange`                                    | Custom tab implementation                          |
| **Text**          | Body/label typography                   | `variant: 'bodySm'\|'bodyMd'\|'bodyLg'\|'caption'\|'label'\|'code'\|'overline'`, `color`, `truncate` | `<p>`, `<span>`                                    |
| **Textarea**      | Multi-line text input                   | `variant`, `rows`                                                                                    | `<textarea>`                                       |
| **ThemeProvider** | Theme context root                      | `theme: 'dark'\|'light'\|'high-contrast'`                                                            | — (required at app root)                           |
| **Toggle**        | Toggle button                           | `pressed`, `onPressedChange`, `value` (for ToggleGroup)                                              | Custom toggle button                               |
| **ToggleGroup**   | Multi/single toggle set                 | `multiple`, `value`, `orientation`, `size`                                                           | Custom radio/checkbox group                        |
| **Tooltip**       | Hover/focus tooltip                     | `content`, `placement: 'top'\|'bottom'\|'left'\|'right'`, `delay`                                    | `title` attribute                                  |

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

### Spacing Scale

| Token  | Value |
| ------ | ----- |
| `xs`   | 4px   |
| `sm`   | 8px   |
| `ms`   | 12px  |
| `md`   | 16px  |
| `lg`   | 24px  |
| `xl`   | 32px  |
| `xxl`  | 48px  |
| `xxxl` | 64px  |

### Border Radius

| Token  | Value  |
| ------ | ------ |
| `sm`   | 8px    |
| `md`   | 12px   |
| `lg`   | 16px   |
| `full` | 9999px |

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

**Stroke icons:** `x-circle`, `check-circle`, `check-done`, `clock`, `forbidden`, `info-circle`, `alert-triangle`, `shield`, `lock`, `key`

**Navigation glyphs:** `map`, `layers`, `repeat`, `database`, `shield-check`, `route`, `git-branch`, `menu`, `pin`

**Infrastructure/inventory glyphs:** `server`, `hard-drive`, `box`, `image`, `tag`, `pie-chart`

**People/access glyphs:** `users`, `user-plus`, `mail`, `file-text`, `plug`

**Color-mode glyphs:** `sun`, `moon`, `monitor`, `contrast`

**Filled icons:** `info-circle-filled`, `alert-triangle-filled`, `check-circle-filled`, `x-circle-filled`, `shield-filled`, `lock-filled`

## Canonical Recipes

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

function LoginForm() {
  return (
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
  )
}
```

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

**Prefer `Table.FromTanstack` when your data has a TanStack table instance** —
collapses 25 lines of `flexRender`/header/body ceremony into one component
and wires SortChip, Pagination, and clickable-row keyboard activation for you.

```tsx
import {Table, useDataTable} from '@duro-app/ui/table'
import {createColumnHelper} from '@tanstack/react-table'

const col = createColumnHelper<User>()
const columns = [
  col.accessor('name', {header: 'Name', enableSorting: true}),
  col.accessor('role', {header: 'Role', enableSorting: true}),
  col.accessor('email', {header: 'Email'}),
  // Mark the actions column via `meta.actions` — applies the stack-mode
  // footer layout. Set `meta.label` when the header is JSX (icon + text);
  // string headers are auto-used as the stack-mode label.
  col.display({
    id: 'actions',
    header: 'Actions',
    meta: {actions: true, label: 'Actions'},
    cell: () => <Button size="small">Edit</Button>,
  }),
]

function UsersTable({users}: {users: User[]}) {
  const {table} = useDataTable({
    data: users,
    columns,
    pagination: {pageSize: 20},
    enableSorting: true,
  })
  return (
    <Table.FromTanstack
      table={table}
      variant="striped"
      sortChip
      pagination
      onRowClick={(row) => navigate(`/users/${row.original.id}`)}
      rowAriaLabel={(row) => `Open ${row.original.name}`}
    />
  )
}
```

**Manual JSX is fine for small static tables** — `Table.Root` now sets up
its own container query, and SortChip / Pagination plug in as slot props:

```tsx
<Table.Root
  variant="striped"
  sortChip={<Table.SortChip options={opts} value={sort} onChange={setSort} />}
  pagination={<Table.Pagination table={tanstack} />}
>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Role</Table.HeaderCell>
      <Table.HeaderCell label="Status">
        <Inline gap="xs">
          <Icon name="info-circle" />
          Status
        </Inline>
      </Table.HeaderCell>
      <Table.HeaderCell aria-label="Actions" />
    </Table.Row>
  </Table.Header>
  <Table.Body>{/* rows */}</Table.Body>
</Table.Root>
```

#### Don't

- ❌ **Don't wrap in `Table.Container`** for new code — Root handles the
  container query itself. `Container` is kept as a deprecated passthrough
  for backwards compatibility.
- ❌ **Don't pass `label` on `Table.HeaderCell` when `children` is a plain
  string** — the text is auto-used as the stack-mode label. Only set
  `label` when the header is JSX with no plain-text fallback (icon, etc).
- ❌ **Don't pass `isActions` on `Table.HeaderCell`** — it does nothing.
  The cell-level `isActions` is what drives stack-mode footer layout.

### Settings Page

```tsx
import {Schema} from 'effect'
import {
  PageShell,
  Tabs,
  Form,
  Field,
  Input,
  Fieldset,
  Button,
  Stack,
  Inline,
  Heading,
  Text,
  Card,
} from '@duro-app/ui'

const ProfileSchema = Schema.Struct({
  displayName: Schema.String.pipe(Schema.minLength(1, {message: () => 'Required'})),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: () => 'Invalid email'}),
  ),
})

function SettingsPage() {
  return (
    <PageShell maxWidth="md" padding="md" header={<Heading level={1}>Settings</Heading>}>
      <Tabs.Root defaultValue="profile">
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <Card>
            <Stack gap="lg">
              <Heading level={3}>Profile Information</Heading>
              <Form
                schema={ProfileSchema}
                defaultValues={{displayName: '', email: ''}}
                onSubmit={(data) => console.log('save', data)}
              >
                {({formState}) => (
                  <Fieldset.Root gap="md">
                    <Field.Root name="displayName">
                      <Field.Label>Display name</Field.Label>
                      <Input placeholder="Your name" />
                      <Field.Error />
                    </Field.Root>

                    <Field.Root name="email">
                      <Field.Label>Email</Field.Label>
                      <Input type="email" placeholder="you@example.com" />
                      <Field.Error />
                    </Field.Root>

                    <Inline gap="sm" justify="end">
                      <Button variant="secondary">Cancel</Button>
                      <Button type="submit" disabled={!formState.isValid}>
                        Save changes
                      </Button>
                    </Inline>
                  </Fieldset.Root>
                )}
              </Form>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Card>
            <Text>Notification preferences go here.</Text>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="security">
          <Card>
            <Text>Security settings go here.</Text>
          </Card>
        </Tabs.Panel>
      </Tabs.Root>
    </PageShell>
  )
}
```

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

### Empty State

```tsx
import {Card, EmptyState, Button, Icon} from '@duro-app/ui'

function NoResultsView() {
  return (
    <Card>
      <EmptyState
        icon={<Icon name="info-circle" size="xxl" />}
        message="No results found"
        action={<Button variant="secondary">Clear filters</Button>}
      />
    </Card>
  )
}
```
