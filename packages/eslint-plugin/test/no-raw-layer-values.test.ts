import {RuleTester} from '@typescript-eslint/rule-tester'
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
          },
          suggestions: [],
        },
      ],
    },
    {
      code: wrap('zIndex: 5000'),
      errors: [
        {
          messageId: 'offScaleZIndex',
          data: {value: '5000', nearest: 'above `layers.portal` (1100)', pkg: '@duro-app/tokens'},
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
      // Another blur has no token: reported, no fix.
      code: wrap("filter: 'blur(8px)'"),
      errors: [{messageId: 'rawEffect', suggestions: []}],
    },
  ],
})
