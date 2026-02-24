# @fredericrous/duro-design-system

A React component library built with [react-strict-dom](https://github.com/facebook/react-strict-dom) for cross-platform, type-safe styling.

## Installation

```bash
npm install @fredericrous/duro-design-system
```

### Peer dependencies

This library requires the following peer dependencies:

```bash
npm install react react-dom react-strict-dom
```

## Usage

Import the CSS and wrap your app with `ThemeProvider`:

```tsx
import "@fredericrous/duro-design-system/dist/index.css"
import { ThemeProvider, Button } from "@fredericrous/duro-design-system"

function App() {
  return (
    <ThemeProvider theme="light">
      <Button variant="primary">Click me</Button>
    </ThemeProvider>
  )
}
```

## Components

- **Alert** -- Contextual feedback messages (success, error, warning, info)
- **Button** -- Primary, secondary, and danger variants in multiple sizes
- **Card** -- Content container with optional header/footer
- **Field** -- Form field wrapper with label and error display
- **Input** -- Text input with validation states
- **Menu** -- Dropdown menu
- **Select** -- Select input
- **ThemeProvider** -- Theme context provider (light, high-contrast)

## Tokens

Design tokens are exported for direct use:

```tsx
import { colors, spacing, radii, typography, shadows } from "@fredericrous/duro-design-system"
```

## Themes

```tsx
import { lightTheme, highContrastTheme } from "@fredericrous/duro-design-system"
```

## Development

```bash
npm install
npm run storybook    # Start Storybook dev server
npm run build        # Build the library
npm run typecheck    # Type-check with tsc
npm run lint         # Lint with ESLint
npm run format       # Format with Prettier
```

## License

MIT
