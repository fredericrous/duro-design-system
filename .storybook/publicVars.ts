// The --duro-* custom properties for Storybook. A consumer gets them from
// dist/vars.css, which packages/tokens/scripts/generate-vars-css.mjs writes
// from the BUILT tokens — and Storybook (and its Vitest run) compiles the
// token sources without building them, so that file does not exist here.
// This builds the same alias block at runtime from the same token objects
// (each value is the StyleX `var(--…)` the generator reads from dist), with
// the generator's group names, so Prose and any other plain-CSS rule resolve
// their tokens in stories and follow the story's theme.
//
// Deep imports: StyleX cannot resolve css.defineVars through a barrel.
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'
import {effects} from '@duro-app/tokens/tokens/effects.css'
import {layoutSpacing} from '@duro-app/tokens/tokens/layout-spacing.css'
import {typeScale, typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

// generate-vars-css.mjs GROUP_NAMES, in its order.
const GROUPS: Array<[string, object]> = [
  ['color', colors],
  ['radius', radii],
  ['shadow', shadows],
  ['spacing', spacing],
  ['micro-spacing', microSpacing],
  ['size', sizes],
  ['border', borders],
  ['layer', layers],
  ['effect', effects],
  ['layout-spacing', layoutSpacing],
  ['typography', typography],
  ['type-scale', typeScale],
  ['duration', duration],
  ['easing', easing],
]

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

export function publicVarsCss(): string {
  const lines: string[] = []
  for (const [alias, bag] of GROUPS) {
    for (const [name, value] of Object.entries(bag)) {
      if (typeof value === 'string' && value.startsWith('var(--')) {
        lines.push(`  --duro-${alias}-${kebab(name)}: ${value};`)
      }
    }
  }
  return `:root,\n[data-theme] {\n${lines.join('\n')}\n}\n`
}

if (typeof document !== 'undefined' && !document.getElementById('duro-public-vars')) {
  const style = document.createElement('style')
  style.id = 'duro-public-vars'
  style.textContent = publicVarsCss()
  document.head.appendChild(style)
}
