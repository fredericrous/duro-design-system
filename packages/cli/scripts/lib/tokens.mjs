import {join} from 'node:path'
import {Node} from 'ts-morph'
import {staticEval} from './static-eval.mjs'
import {repoRoot} from './project.mjs'

const TOKENS = 'packages/tokens/src'

function callArgNode(project, file, exportName, argIndex = 0) {
  const sourceFile = project.getSourceFileOrThrow(join(repoRoot, TOKENS, file))
  const decl = sourceFile.getVariableDeclarationOrThrow(exportName)
  const init = decl.getInitializerOrThrow()
  if (!Node.isCallExpression(init)) {
    throw new Error(`${file}: expected ${exportName} to be a call expression`)
  }
  return init.getArguments()[argIndex]
}

function callArg(project, file, exportName, argIndex = 0) {
  return staticEval(callArgNode(project, file, exportName, argIndex), `${file}#${exportName}`)
}

/** Top-level keys of a css.create()-style object whose values aren't literals. */
function callArgKeys(project, file, exportName) {
  const node = callArgNode(project, file, exportName)
  if (!Node.isObjectLiteralExpression(node)) {
    throw new Error(`${file}: expected ${exportName} argument to be an object literal`)
  }
  return node.getProperties().map((prop) => prop.getName())
}

function constValue(project, file, exportName) {
  const sourceFile = project.getSourceFileOrThrow(join(repoRoot, TOKENS, file))
  const decl = sourceFile.getVariableDeclarationOrThrow(exportName)
  return staticEval(decl.getInitializerOrThrow(), `${file}#${exportName}`)
}

function scaleGroup(importPath, exportName, values) {
  return {
    importPath,
    exportName,
    entries: Object.entries(values).map(([key, value]) => ({key, value})),
  }
}

/**
 * Unions defined by the tokens package (SpacingToken and friends) — seeded
 * into the surface walk so ui props typed with them resolve their members.
 */
export function extractTokenUnions(project) {
  const spacingKeys = constValue(project, 'keys.ts', 'SPACING_KEYS')
  const radiusKeys = constValue(project, 'keys.ts', 'RADIUS_KEYS')
  const shadowKeys = constValue(project, 'keys.ts', 'SHADOW_KEYS')
  const durations = constValue(project, 'keys.ts', 'DURATION_MS')
  const iconSizes = constValue(project, 'keys.ts', 'ICON_SIZES')
  const breakpoints = constValue(project, 'tokens/breakpoints.css.ts', 'breakpointsPx')
  return {
    SpacingToken: spacingKeys,
    SpacingKey: spacingKeys,
    RadiusToken: radiusKeys,
    ShadowToken: shadowKeys,
    DurationToken: Object.keys(durations),
    IconSize: Object.keys(iconSizes),
    Breakpoint: Object.keys(breakpoints),
  }
}

export function extractTokens(project) {
  const spacing = callArg(project, 'tokens/spacing.css.ts', 'spacing')
  const radii = callArg(project, 'tokens/spacing.css.ts', 'radii')
  const shadows = callArg(project, 'tokens/shadows.css.ts', 'shadows')
  const duration = callArg(project, 'tokens/motion.css.ts', 'duration')
  const easing = callArg(project, 'tokens/motion.css.ts', 'easing')
  const layoutSpacing = callArg(project, 'tokens/layout-spacing.css.ts', 'layoutSpacing')
  const typography = callArg(project, 'tokens/typography.css.ts', 'typography')
  const breakpoints = constValue(project, 'tokens/breakpoints.css.ts', 'breakpointsPx')
  const iconSizes = constValue(project, 'keys.ts', 'ICON_SIZES')
  const typePresetKeys = callArgKeys(project, 'tokens/type-presets.css.ts', 'typePresets')

  const dark = constValue(project, 'raw.ts', 'darkColors')
  const light = constValue(project, 'raw.ts', 'lightColors')
  const highContrast = constValue(project, 'raw.ts', 'highContrastColors')

  return {
    groups: {
      spacing: scaleGroup('@duro-app/tokens/tokens/spacing.css', 'spacing', spacing),
      radii: scaleGroup('@duro-app/tokens/tokens/spacing.css', 'radii', radii),
      shadows: scaleGroup('@duro-app/tokens/tokens/shadows.css', 'shadows', shadows),
      motion: {
        importPath: '@duro-app/tokens/tokens/motion.css',
        exportName: 'duration, easing',
        entries: [
          ...Object.entries(duration).map(([key, value]) => ({key: `duration.${key}`, value})),
          ...Object.entries(easing).map(([key, value]) => ({key: `easing.${key}`, value})),
        ],
      },
      iconSizes: scaleGroup('@duro-app/tokens/keys', 'ICON_SIZES', iconSizes),
      typography: scaleGroup('@duro-app/tokens/tokens/typography.css', 'typography', typography),
      typePresets: {
        importPath: '@duro-app/tokens/tokens/type-presets.css',
        exportName: 'typePresets',
        entries: typePresetKeys.map((key) => ({key})),
      },
      layoutSpacing: scaleGroup(
        '@duro-app/tokens/tokens/layout-spacing.css',
        'layoutSpacing',
        layoutSpacing,
      ),
      breakpoints: scaleGroup(
        '@duro-app/tokens/tokens/breakpoints.css',
        'breakpointsPx',
        breakpoints,
      ),
      colors: {
        importPath: '@duro-app/tokens/tokens/colors.css',
        exportName: 'colors',
        entries: Object.keys(dark).map((key) => ({
          key,
          values: {dark: dark[key], light: light[key], highContrast: highContrast[key]},
        })),
      },
    },
  }
}
