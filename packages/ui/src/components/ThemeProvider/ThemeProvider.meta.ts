import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Theme context provider. Must wrap the entire app at the root level. Sets dark, light, or high-contrast theme for all child components via CSS custom properties.',
  whenToUse: [
    'App root — required for all Duro components to render correctly',
    'Theme switching (dark/light mode toggle)',
  ],
  whenNotToUse: ['Never omit — all Duro components require ThemeProvider'],
  example: `<ThemeProvider theme="dark">
  <App />
</ThemeProvider>`,
}
