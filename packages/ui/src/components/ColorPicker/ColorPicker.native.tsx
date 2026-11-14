import {ColorPickerBody} from './ColorPickerBody'
import type {ColorPickerProps} from './ColorPicker.types'

export type {ColorPickerProps, ColorPickerLabels} from './ColorPicker.types'

/**
 * Native ColorPicker: the shared body, with touch-drag parts (./ColorArea and
 * ./ColorSlider resolve to their .native files), whose accessibility actions
 * step the colour because native has no arrow keys.
 */
export function ColorPicker(props: ColorPickerProps) {
  return <ColorPickerBody {...props} />
}
