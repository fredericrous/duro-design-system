import {RuleTester} from '@typescript-eslint/rule-tester'
import {TSESLint} from '@typescript-eslint/utils'
import {describe, expect, it} from 'vitest'
import {noRawLayerValues} from '../src/rules/no-raw-layer-values.js'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
  },
})

const wrap = (body: string) => `css.create({s: {${body}}})`
const layersImport = "import {layers} from '@duro-app/tokens/tokens/layers.css'\n"
const effectsImport = "import {effects} from '@duro-app/tokens/tokens/effects.css'\n"

tester.run('no-raw-layer-values', noRawLayerValues, {
  valid: [
    wrap('zIndex: layers.overlay, backdropFilter: effects.overlayBlur'),
    // 0 and negatives have no token: they only sort siblings.
    wrap("zIndex: 0, top: 8, lineHeight: 1.5, zIndex: '0'"),
    wrap('zIndex: -1'),
    wrap("zIndex: 'auto'"),
    // Not a blur.
    wrap("filter: 'grayscale(1)', backdropFilter: 'none'"),
    // Not a css.create argument.
    'const s = {zIndex: 1000}',
    // Component-local stacking (2 to localMax, default 9) is not reported.
    wrap('zIndex: 2'),
    wrap('zIndex: 5'),
    wrap("zIndex: '9'"),
    {code: wrap('zIndex: 49'), options: [{localMax: 49}]},
  ],
  invalid: [
    {
      code: wrap('zIndex: 1000'),
      errors: [
        {
          messageId: 'rawZIndex',
          data: {value: '1000', token: 'overlay', pkg: '@duro-app/tokens'},
          suggestions: [
            {messageId: 'replaceWithToken', output: layersImport + wrap('zIndex: layers.overlay')},
          ],
        },
      ],
    },
    {
      code: wrap('zIndex: 1050'),
      errors: [
        {
          messageId: 'rawZIndex',
          suggestions: [
            {messageId: 'replaceWithToken', output: layersImport + wrap('zIndex: layers.popup')},
          ],
        },
      ],
    },
    {
      // A numeric string counts too; inside a condition object as well.
      code: wrap("zIndex: {default: '1', ':focus-visible': 50}"),
      errors: [
        {
          messageId: 'rawZIndex',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output: layersImport + wrap("zIndex: {default: layers.raised, ':focus-visible': 50}"),
            },
          ],
        },
        {
          messageId: 'rawZIndex',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output:
                layersImport + wrap("zIndex: {default: '1', ':focus-visible': layers.floating}"),
            },
          ],
        },
      ],
    },
    {
      // Off the scale (a local stacking value): the nearest layers, no fix.
      code: wrap('zIndex: 16'),
      errors: [
        {
          messageId: 'offScaleZIndex',
          data: {
            value: '16',
            nearest: 'between `layers.raised` (1) and `layers.floating` (50)',
            pkg: '@duro-app/tokens',
            localMax: 9,
          },
          suggestions: [],
        },
      ],
    },
    {
      // Just above the default localMax: reported, with the localMax clause.
      code: wrap('zIndex: 10'),
      errors: [
        {
          messageId: 'offScaleZIndex',
          data: {
            value: '10',
            nearest: 'between `layers.raised` (1) and `layers.floating` (50)',
            pkg: '@duro-app/tokens',
            localMax: 9,
          },
          suggestions: [],
        },
      ],
    },
    {
      // 1 is a layer, so it keeps its suggestion under the local ceiling.
      code: wrap('zIndex: 1'),
      errors: [
        {
          messageId: 'rawZIndex',
          data: {value: '1', token: 'raised', pkg: '@duro-app/tokens'},
          suggestions: [
            {messageId: 'replaceWithToken', output: layersImport + wrap('zIndex: layers.raised')},
          ],
        },
      ],
    },
    {
      // localMax: 0 reports every positive value again.
      code: wrap('zIndex: 5'),
      options: [{localMax: 0}],
      errors: [
        {
          messageId: 'offScaleZIndex',
          // The clause names the configured value: "values up to 0 …".
          data: {
            value: '5',
            nearest: 'between `layers.raised` (1) and `layers.floating` (50)',
            pkg: '@duro-app/tokens',
            localMax: 0,
          },
          suggestions: [],
        },
      ],
    },
    {
      code: wrap('zIndex: 1002'),
      errors: [
        {
          messageId: 'rawZIndex',
          data: {value: '1002', token: 'modalRaised', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output: layersImport + wrap('zIndex: layers.modalRaised'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('zIndex: 60'),
      errors: [
        {
          messageId: 'rawZIndex',
          data: {value: '60', token: 'floatingRaised', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output: layersImport + wrap('zIndex: layers.floatingRaised'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('zIndex: 1041'),
      errors: [
        {
          messageId: 'rawZIndex',
          data: {value: '1041', token: 'popoverRaised', pkg: '@duro-app/tokens'},
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output: layersImport + wrap('zIndex: layers.popoverRaised'),
            },
          ],
        },
      ],
    },
    {
      code: wrap('zIndex: 5000'),
      errors: [
        {
          messageId: 'offScaleZIndex',
          data: {
            value: '5000',
            nearest: 'above `layers.portal` (1100)',
            pkg: '@duro-app/tokens',
            localMax: 9,
          },
          suggestions: [],
        },
      ],
    },
    {
      code: wrap("backdropFilter: 'blur(2px)'"),
      errors: [
        {
          messageId: 'rawEffect',
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output: effectsImport + wrap('backdropFilter: effects.overlayBlur'),
            },
          ],
        },
      ],
    },
    {
      code: wrap("backdropFilter: 'blur(6px)'"),
      errors: [
        {
          messageId: 'rawEffect',
          data: {
            value: 'blur(6px)',
            property: 'backdropFilter',
            tokenText: ' (it is effects.surfaceBlur)',
            pkg: '@duro-app/tokens',
          },
          suggestions: [
            {
              messageId: 'replaceWithToken',
              output: effectsImport + wrap('backdropFilter: effects.surfaceBlur'),
            },
          ],
        },
      ],
    },
    {
      // Another blur has no token: reported, no fix.
      code: wrap("filter: 'blur(8px)'"),
      errors: [{messageId: 'rawEffect', suggestions: []}],
    },
  ],
})

describe('no-raw-layer-values messages', () => {
  it('offScaleZIndex names the configured localMax', () => {
    expect(noRawLayerValues.meta.messages.offScaleZIndex).toContain(
      'values up to {{localMax}} that order children inside one component are not reported',
    )
    expect(noRawLayerValues.meta.messages.offScaleZIndex).not.toContain('has no token yet')
  })
})

describe('no-raw-layer-values options', () => {
  const lint = (localMax: number) => {
    const config: TSESLint.FlatConfig.Config = {
      plugins: {duro: {rules: {'no-raw-layer-values': noRawLayerValues}}},
      rules: {'duro/no-raw-layer-values': ['warn', {localMax}]},
    }
    return new TSESLint.Linter({configType: 'flat'}).verify(wrap('zIndex: 5'), config)
  }

  it('accepts a localMax up to 49', () => {
    expect(lint(49)).toEqual([])
  })

  it('rejects a localMax above 49 (layers.floating is 50)', () => {
    expect(() => lint(50)).toThrow(/Value 50 should be <= 49/)
  })
})
