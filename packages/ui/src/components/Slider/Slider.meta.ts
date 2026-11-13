import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Single-thumb range slider for choosing a number between min and max. The thumb is role="slider" with aria-valuemin, aria-valuemax, aria-valuenow and aria-valuetext (formatValue). On the web the arrow keys move one step, PageUp and PageDown ten steps, Home and End to the ends, and a pointer drag moves the thumb; on React Native a touch and drag move it, and the track is one adjustable element whose increment and decrement actions step the value. children is a visible label that names the slider; without it, give aria-label. showValue shows the current value beside the label.',
  whenToUse: [
    'Choosing an approximate number in a range (volume, opacity, a threshold)',
    'A value where the relative position matters more than the exact figure',
  ],
  whenNotToUse: [
    'An exact figure to type — use Input type="number"',
    'A choice among a few named options — use Select or ToggleGroup',
    'A range with two ends — Slider has one thumb',
  ],
  relatedTo: [
    {
      component: 'Input',
      kind: 'contrast',
      relationship:
        'Input type="number" for an exact figure; Slider for a value picked by position',
    },
    {
      component: 'Switch',
      kind: 'contrast',
      relationship: 'Switch for on/off; Slider for a value in a range',
    },
  ],
  example: `<Slider
  min={0}
  max={100}
  step={5}
  defaultValue={40}
  showValue
  formatValue={(value) => \`\${value}%\`}
  onValueChange={(value) => console.log(value)}
>
  Volume
</Slider>`,
}
