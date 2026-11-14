export interface ColorPickerLabels {
  /** Names the saturation and brightness area. Default: "Saturation and brightness" */
  area?: string
  /** Names the hue slider. Default: "Hue" */
  hue?: string
  /** Names the alpha slider. Default: "Alpha" */
  alpha?: string
  /** Names the colour text field. Default: "Colour" */
  text?: string
  /** Names the preview swatch. Default: "Selected colour" */
  preview?: string
}

export interface ColorPickerProps {
  /** Controlled value: a CSS colour string (`#rrggbb`, `rgba(…)`, `hsl(…)`, `transparent`). */
  value?: string
  /** Initial value (uncontrolled). Default: `#000000` */
  defaultValue?: string
  /** Called with the new colour as it changes: on each key, and as a drag moves. */
  onChange?: (value: string) => void
  /** Called with the colour when a drag, a key press or a text edit ends. */
  onChangeComplete?: (value: string) => void
  /** Colours offered as buttons. */
  swatches?: string[]
  /** Colours used lately, offered as a second group of buttons. */
  recentColors?: string[]
  /** Names the group of recent colours. Default: "Recent colours" */
  recentLabel?: string
  /** Lets alpha reach 0 and accepts `transparent`. Default: false */
  allowTransparent?: boolean
  /** Prevents user interaction. */
  disabled?: boolean
  /** Names the picker as a group. */
  'aria-label'?: string
  /** Accessible names of the picker's parts. */
  labels?: ColorPickerLabels
}
