# Duro Design System

> AI-facing guide for code generation. Read this before generating any UI code using Duro components.

## Architecture

- **Monorepo** managed by pnpm workspaces
- **Packages:** `@duro-app/ui` (components), `@duro-app/tokens` (design tokens)
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

| Need | Component | Key difference |
|---|---|---|
| Vertical stack of elements | `Stack` | flex-direction: column |
| Horizontal row, **no wrapping** | `Inline` | flex-direction: row, nowrap |
| Horizontal row, **wraps** to next line | `Cluster` | flex-direction: row, wrap |
| Multi-column grid | `Grid` | CSS grid, fixed or auto-fit columns |
| Full page layout with header | `PageShell` | max-width + padding + optional header |

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

| Component | Sub-components |
|---|---|
| `Select` | `Root`, `Trigger`, `Value`, `Icon`, `Popup`, `Item`, `ItemText` |
| `Menu` | `Root`, `Trigger`, `Popup`, `Item`, `LinkItem` |
| `Tabs` | `Root`, `List`, `Tab`, `Panel` |
| `Table` | `Root`, `Header`, `Body`, `Row`, `HeaderCell`, `Cell` |
| `Tooltip` | `Root`, `Trigger` |
| `SideNav` | `Root`, `Group`, `Item` |
| `ScrollArea` | `Root`, `Viewport`, `Content`, `Scrollbar`, `Thumb` |

### Optional Root context (works standalone, gains features in context)

| Component | Sub-components | Standalone behavior |
|---|---|---|
| `Field` | `Root`, `Label`, `Description`, `Error` | Static labels/errors; inside `Form` auto-binds to react-hook-form |
| `Fieldset` | `Root`, `Legend` | Groups form controls with gap |
| `ToggleGroup` | (wraps `Toggle` children) | Toggle works alone; group adds multi/single select |
| `InputGroup` | `Root`, `Addon` | Input works alone; group adds prefix/suffix addons |

## Component Quick Reference

| Component | Description | Key props | Use instead of |
|---|---|---|---|
| **ActionBar** | Floating bulk-selection toolbar | `selectedItemCount`, `isEmphasized` | Custom fixed toolbar |
| **Alert** | Inline status message with icon | `variant: 'error'\|'success'\|'warning'\|'info'` | Custom banner |
| **Badge** | Small label/tag | `variant`, `size: 'sm'\|'md'` | Custom pill/chip |
| **Button** | Interactive button | `variant: 'primary'\|'secondary'\|'inverseSecondary'\|'link'\|'danger'`, `size`, `fullWidth` | `<button>` |
| **Callout** | Block-level informational message | `variant: 'error'\|'success'\|'warning'\|'info'` | Alert (use Callout for larger, prominent messages) |
| **Card** | Container with visual styling | `variant: 'elevated'\|'outlined'\|'filled'\|'interactive'`, `size`, `header` | Custom container div |
| **Checkbox** | Checkbox input with label | `checked`, `defaultChecked`, `onChange` | `<input type="checkbox">` |
| **Cluster** | Horizontal flex, **wraps** | `gap`, `align`, `justify` | `<div style="flex-wrap:wrap">` |
| **EmptyState** | Placeholder for empty content | `message`, `icon`, `action` | Custom empty view |
| **Field** | Form field with label/error | `name` (for Form binding), `invalid` | Custom label + input wiring |
| **Fieldset** | Groups related form controls | `gap`, `disabled` | `<fieldset>` |
| **Form** | Form with Effect Schema validation | `schema`, `defaultValues`, `onSubmit` | `<form>` + manual RHF setup |
| **Grid** | CSS grid layout | `columns: 1-6`, `minColumnWidth`, `gap` | Custom CSS grid |
| **Heading** | Semantic heading (h1-h6) | `level: 1-6`, `variant`, `color` | `<h1>`-`<h6>` |
| **Icon** | SVG icon | `name: IconName`, `size` | Inline SVGs |
| **Inline** | Horizontal flex, **no wrap** | `gap`, `align`, `justify` | `<div style="display:flex">` |
| **Input** | Text input | `type`, `variant: 'default'\|'error'` | `<input>` |
| **InputGroup** | Input with prefix/suffix addons | Wraps `Input` + `Addon` children | Custom input wrapper |
| **LinkButton** | Button-styled link | `href`, `variant: 'primary'\|'secondary'`, `target` | `<a>` styled as button |
| **Menu** | Dropdown action menu | Compound: `Root > Trigger + Popup > Item\|LinkItem` | Custom dropdown |
| **PageShell** | Page-level layout | `maxWidth: 'sm'\|'md'\|'lg'\|'full'`, `padding`, `header` | Custom page wrapper |
| **ScrollArea** | Custom scrollbar region | Compound: `Root > Viewport > Content`, `Scrollbar > Thumb` | `overflow: auto` |
| **Select** | Dropdown select | Compound: `Root > Trigger + Popup > Item` | `<select>` |
| **SideNav** | Side navigation | Compound: `Root > Group > Item` | Custom nav sidebar |
| **Spinner** | Loading indicator | `size: 'sm'\|'md'\|'lg'`, `label` | Custom loader |
| **Stack** | Vertical flex layout | `gap`, `align` | `<div style="flex-direction:column">` |
| **StatusIcon** | Icon with colored background | `name`, `variant`, `size` | Icon + custom wrapper |
| **Switch** | Toggle switch | `checked`, `onCheckedChange`, `disabled` | `<input type="checkbox">` styled as switch |
| **Table** | Data table | `variant: 'default'\|'striped'\|'bordered'`, `size`, `columns` | `<table>` |
| **Tabs** | Tabbed interface | `orientation: 'horizontal'\|'vertical'`, `value`, `onValueChange` | Custom tab implementation |
| **Text** | Body/label typography | `variant: 'bodySm'\|'bodyMd'\|'bodyLg'\|'caption'\|'label'\|'code'\|'overline'`, `color`, `truncate` | `<p>`, `<span>` |
| **Textarea** | Multi-line text input | `variant`, `rows` | `<textarea>` |
| **ThemeProvider** | Theme context root | `theme: 'dark'\|'light'\|'high-contrast'` | — (required at app root) |
| **Toggle** | Toggle button | `pressed`, `onPressedChange`, `value` (for ToggleGroup) | Custom toggle button |
| **ToggleGroup** | Multi/single toggle set | `multiple`, `value`, `orientation`, `size` | Custom radio/checkbox group |
| **Tooltip** | Hover/focus tooltip | `content`, `placement: 'top'\|'bottom'\|'left'\|'right'`, `delay` | `title` attribute |

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

| Token | Value |
|---|---|
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
|---|---|
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `full` | 9999px |

### Typography Presets

| Preset | Size | Weight | Use for |
|---|---|---|---|
| `bodySm` | 14px | normal | Secondary text, metadata |
| `bodyMd` | 16px | normal | Default body text |
| `bodyLg` | 18px | normal | Lead paragraphs |
| `caption` | 12px | normal | Fine print, timestamps |
| `label` | 14px | medium | Form labels, UI labels |
| `code` | 14px | normal | Code snippets (monospace) |
| `overline` | 12px | semibold | Section headers, categories (uppercase) |
| `headingSm` | 20px | semibold | h4-h6, section headers |
| `headingMd` | 24px | semibold | h3, card titles |
| `headingLg` | 30px | bold | h2, page sections |
| `headingXl` | 36px | bold | h1, page titles |
| `displaySm` | 36-48px | bold | Hero text (fluid) |
| `displayMd` | 44-60px | bold | Hero text (fluid) |
| `displayLg` | 56-72px | bold | Hero text (fluid) |

### Color Semantics

| Token | Purpose |
|---|---|
| `bg` | Page background |
| `bgCard` | Card/surface background |
| `bgCardHover` | Card hover state |
| `text` | Primary text |
| `textMuted` | Secondary/muted text |
| `accent` | Primary brand color (links, buttons) |
| `accentHover` | Accent hover state |
| `accentContrast` | Text on accent backgrounds |
| `border` | Default border color |
| `error` / `errorBg` / `errorText` | Error states |
| `success` / `successBg` / `successText` | Success states |
| `warning` / `warningBg` / `warningText` | Warning states |
| `info` / `infoBg` / `infoText` | Informational states |

### Shadows

| Token | Value |
|---|---|
| `sm` | Subtle — cards, dropdowns |
| `md` | Medium — popovers, floating elements |
| `lg` | Strong — modals, dialogs |

### Layout Spacing (semantic)

| Token | Value | Use for |
|---|---|---|
| `stackXs`-`stackXl` | 4-48px | Vertical rhythm (Stack gaps) |
| `inlineXs`-`inlineLg` | 4-24px | Horizontal rhythm (Inline gaps) |
| `containerSm`-`containerLg` | 16-32px | Page/section padding |

## Icon Names

**Stroke icons:** `x-circle`, `check-circle`, `check-done`, `clock`, `forbidden`, `info-circle`, `alert-triangle`, `shield`, `lock`, `key`

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

```tsx
import {Table} from '@duro-app/ui'

function UsersTable() {
  const users = [
    {id: 1, name: 'Alice', role: 'Admin', status: 'Active'},
    {id: 2, name: 'Bob', role: 'Editor', status: 'Inactive'},
    {id: 3, name: 'Carol', role: 'Viewer', status: 'Active'},
  ]

  return (
    <Table.Root variant="striped" size="md" columns={4}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Role</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell aria-label="Actions" />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.role}</Table.Cell>
            <Table.Cell>{user.status}</Table.Cell>
            <Table.Cell>Edit</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
```

### Settings Page

```tsx
import {Schema} from 'effect'
import {
  PageShell, Tabs, Form, Field, Input, Fieldset, Button,
  Stack, Inline, Heading, Text, Card,
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
                      <Button type="submit" disabled={!formState.isValid}>Save changes</Button>
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

### Empty State

```tsx
import {Card, EmptyState, Button, Icon} from '@duro-app/ui'

function NoResultsView() {
  return (
    <Card>
      <EmptyState
        icon={<Icon name="info-circle" size={48} />}
        message="No results found"
        action={<Button variant="secondary">Clear filters</Button>}
      />
    </Card>
  )
}
```
