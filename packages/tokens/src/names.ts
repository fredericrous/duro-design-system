// How a token group and key are named in the published CSS custom properties
// (`--duro-<alias>-<kebab key>`). No imports, so the build scripts can load
// this file straight from source (Node strips the types), which keeps
// `build-registry.mjs` a function of the tree and not of a tokens build.
// `theme.ts` re-exports both for `@duro-app/tokens/theme`.

/** Group name in the emitted variable. Singularised where the plural reads oddly (`radii` → `radius`). */
export const GROUP_ALIASES = {
  colors: 'color',
  radii: 'radius',
  shadows: 'shadow',
  spacing: 'spacing',
  microSpacing: 'micro-spacing',
  sizes: 'size',
  borders: 'border',
  layers: 'layer',
  effects: 'effect',
  layoutSpacing: 'layout-spacing',
  typography: 'typography',
  typeScale: 'type-scale',
  duration: 'duration',
  easing: 'easing',
  breakpoints: 'breakpoint',
} as const

/** `bgCard` → `bg-card`, `stackXl` → `stack-xl`. */
export function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}
