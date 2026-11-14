import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A colour picker whose value is a CSS colour string (hex, rgb(a), hsl(a) or transparent). Parts in order: a 2D saturation and brightness area for the current hue (a pointer or touch drag; on the web the arrow keys, Shift for a larger step), a hue slider and an alpha slider (role="slider" on the web, adjustable on React Native), a preview swatch, a text field that accepts #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla() and transparent (invalid input is shown and not committed; a valid one commits on Enter or blur), then swatches and recent colours as named buttons. onChange fires as the colour changes and onChangeComplete when a drag, key press or edit ends. allowTransparent lets alpha reach 0 and accepts the transparent keyword. labels renames the parts and recentLabel the recent group, for translation.',
  whenToUse: [
    'Picking any colour with fine control: a brand colour, a highlight, a drawing colour',
    'A colour that may be translucent or transparent',
  ],
  whenNotToUse: [
    'A hex colour in a form through the platform picker — use ColorInput',
    'A choice among a few named colours — use RadioGroup or ToggleGroup',
  ],
  relatedTo: [
    {
      component: 'ColorInput',
      kind: 'contrast',
      relationship:
        'ColorInput is the native swatch for a hex value; ColorPicker is the full picker with alpha',
    },
    {
      component: 'Slider',
      kind: 'composition',
      relationship: "The hue and alpha sliders use Slider's math (snap, fractions, keys)",
    },
    {
      component: 'Popover',
      kind: 'composition',
      relationship: 'Put the picker in Popover.Popup behind a swatch trigger',
    },
  ],
  example: `<ColorPicker
  aria-label="Accent"
  defaultValue="#3b82f6"
  swatches={['#ef4444', '#22c55e', '#3b82f6']}
  recentColors={recent}
  recentLabel="Recent colours"
  allowTransparent
  onChange={(value) => setAccent(value)}
  onChangeComplete={(value) => remember(value)}
/>`,
}
