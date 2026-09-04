import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Color-mode controller + toggle. ColorModeProvider owns the preference (system/light/dark/high-contrast), resolves "system" against the OS scheme, persists it to localStorage, and applies the resolved theme via ThemeProvider. ColorModeToggle is an icon button that cycles the preference; useColorMode() reads it.',
  whenToUse: [
    'App-level light/dark (and high-contrast) switching that persists across reloads',
    'Respecting the OS prefers-color-scheme with a user override',
    'Any place that needs the resolved theme name (useColorMode().theme)',
  ],
  whenNotToUse: [
    'A single static theme — use ThemeProvider directly with a fixed theme prop',
    'On/off setting unrelated to theming — use Switch',
  ],
  anatomy: {
    required: ['ColorModeProvider'],
    optional: ['ColorModeToggle', 'useColorMode'],
  },
  relatedTo: [
    {
      component: 'ThemeProvider',
      kind: 'contrast',
      relationship:
        'ColorModeProvider renders ThemeProvider with the resolved theme; use ThemeProvider alone for a fixed theme',
    },
    {
      component: 'Toggle',
      kind: 'contrast',
      relationship: 'Toggle is a generic pressed button; ColorModeToggle cycles theme modes',
    },
  ],
  example: `// At the app root — replaces a bare <ThemeProvider>:
<ColorModeProvider defaultPreference="system" modes={['light', 'dark']}>
  <App />
</ColorModeProvider>

// Anywhere inside (e.g. the top bar):
<ColorModeToggle />

// Or read the resolved theme:
const {theme, preference, setPreference} = useColorMode()`,
}
