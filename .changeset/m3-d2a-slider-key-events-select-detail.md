---
'@duro-app/ui': minor
---

New `Slider`: a single-thumb range (`value`/`defaultValue`, `min`, `max`, `step`, `onValueChange`, `disabled`) named by its `children` label or an `aria-label`, with an optional visible value (`showValue`, `formatValue`). The thumb is `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`. On the web the arrow keys step, PageUp and PageDown move ten steps, Home and End go to the ends, and a pointer drag moves it; on React Native a touch drag moves it and the increment and decrement accessibility actions step it.

`Input`'s `onKeyDown` fires on native too, with an event carrying `key` (printable characters, `Backspace` and `Enter`; React Native reports no other keys). The web is unchanged.

`Select.Item` takes `description` (a second line under the text) and `leading` (an icon or small preview before it), on the web list and in the native bottom sheet. The option's accessible name and the trigger's selected label stay the option's text.
