import {ColorPickerBody} from './ColorPickerBody'
import type {ColorPickerProps} from './ColorPicker.types'

export type {ColorPickerProps, ColorPickerLabels} from './ColorPicker.types'

/**
 * A colour picker: a saturation and brightness area, hue and alpha sliders, a
 * preview, a validated text field, and swatches and recent colours as buttons.
 * Its value is a CSS colour string.
 */
export function ColorPicker(props: ColorPickerProps) {
  return <ColorPickerBody {...props} />
}
