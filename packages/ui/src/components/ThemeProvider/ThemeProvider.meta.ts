import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Theme context provider. Must wrap the entire app at the root level. Sets dark, light, or high-contrast theme for all child components via CSS custom properties. overrides replaces colours by token key ({accent: "#ff5a1f"}) and updates in place, without a re-mount: a scoped rule on the web (values that are not a colour are dropped), a runtime theme on React Native, where useResolvedColors() follows too. Overrides replace a colour whatever the theme, so pass per-mode values when the mode can change. A nested provider on the same theme keeps the outer overrides and lays its own over them; on another theme it starts from that theme\'s colours.',
  whenToUse: [
    'App root — required for all Duro components to render correctly',
    'Theme switching (dark/light mode toggle)',
  ],
  whenNotToUse: ['Never omit — all Duro components require ThemeProvider'],
  example: `<ThemeProvider theme="dark">
  <App />
</ThemeProvider>`,
}
