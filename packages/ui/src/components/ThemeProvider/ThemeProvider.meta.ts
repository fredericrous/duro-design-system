import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Theme context provider. Must wrap the entire app at the root level. Sets dark, light, or high-contrast theme for all child components via CSS custom properties. overrides replaces colours by token key ({accent: "#ff5a1f"}) and updates in place, without a re-mount; it is the colour alias of tokens. tokens replaces values by group and key ({colors, shadows, typography, typeScale, spacing, layoutSpacing, radii, sizes, borders, duration, easing, effects}, each a partial record of the keys of that group), so an app passes its theme file as is: a scoped rule on the web (values that are not valid for their key are dropped with one development warning), a runtime theme per group on React Native, where useResolvedColors() follows the colours. layers, breakpoints, microSpacing, radii.px6 and radii.full are refused; sizes.touchTarget (44px), borders.focusRing (2px) and borders.focusOffset keep their floors. colors and shadows reset when a nested provider changes theme; every other group inherits. The app loads its own fonts (weights 400, 500, 600 and 700); native takes the first family of a list, unquoted, and is unverified on a device. Keep radii ordered xs <= sm <= md <= lg. Colours replace whatever the theme, so pass per-mode values when the mode can change. A nested provider on the same theme keeps the outer overrides and lays its own over them; on another theme it starts from that theme colours.',
  whenToUse: [
    'App root — required for all Duro components to render correctly',
    'Theme switching (dark/light mode toggle)',
  ],
  whenNotToUse: ['Never omit — all Duro components require ThemeProvider'],
  example: `<ThemeProvider theme="dark">
  <App />
</ThemeProvider>`,
}
