import {html} from 'react-strict-dom'
import {Input} from '../Input/Input'
import {ColorArea} from './ColorArea'
import {ColorSlider} from './ColorSlider'
import {formatColor, formatHex, hsvaToRgba, hueColor, hueGradient, parseColor} from './colorModel'
import type {ColorPickerProps} from './ColorPicker.types'
import {styles} from './styles.css'
import {useColorPickerState} from './useColorPickerState'

const DEFAULT_VALUE = '#000000'

function sameColor(first: string, second: string): boolean {
  const left = parseColor(first)
  const right = parseColor(second)
  return left !== null && right !== null && formatColor(left) === formatColor(right)
}

interface SwatchButtonsProps {
  colors: string[]
  selected: string
  disabled: boolean
  onPick: (color: string) => void
}

function SwatchButtons({colors, selected, disabled, onPick}: SwatchButtonsProps) {
  return (
    <>
      {colors.map((color, index) => (
        <html.button
          key={`${color}-${index}`}
          type="button"
          aria-label={color}
          aria-pressed={sameColor(color, selected)}
          disabled={disabled}
          onClick={() => onPick(color)}
          style={[
            styles.swatch,
            styles.swatchFill(color),
            sameColor(color, selected) && styles.swatchSelected,
            disabled && styles.swatchDisabled,
          ]}
        />
      ))}
    </>
  )
}

export function ColorPickerBody({
  value,
  defaultValue = DEFAULT_VALUE,
  onChange,
  onChangeComplete,
  swatches,
  recentColors,
  recentLabel = 'Recent colours',
  allowTransparent = false,
  disabled = false,
  'aria-label': ariaLabel,
  labels,
}: ColorPickerProps) {
  const state = useColorPickerState({
    value,
    defaultValue,
    allowTransparent,
    onChange,
    onChangeComplete,
  })
  const {hsva} = state
  const opaque = formatHex({...hsvaToRgba(hsva), a: 1})
  const names = {
    area: labels?.area ?? 'Saturation and brightness',
    hue: labels?.hue ?? 'Hue',
    alpha: labels?.alpha ?? 'Alpha',
    text: labels?.text ?? 'Colour',
    preview: labels?.preview ?? 'Selected colour',
  }

  return (
    <html.div
      role="group"
      aria-label={ariaLabel}
      style={[styles.root, disabled && styles.rootDisabled]}
    >
      <ColorArea
        position={{s: hsva.s, v: hsva.v}}
        hueColor={hueColor(hsva.h)}
        label={names.area}
        saturationLabel="Saturation"
        brightnessLabel="Brightness"
        disabled={disabled}
        onMove={({s, v}) => state.move({s, v})}
        onCommit={({s, v}) => state.complete({s, v})}
      />
      <ColorSlider
        value={Math.round(hsva.h)}
        max={360}
        label={names.hue}
        valueText={`${Math.round(hsva.h)}°`}
        disabled={disabled}
        onMove={(h) => state.move({h})}
        onCommit={(h) => state.complete({h})}
      >
        <html.div style={[styles.layer, styles.hueTrack(hueGradient())]} />
      </ColorSlider>
      <ColorSlider
        value={Math.round(hsva.a * 100)}
        max={100}
        label={names.alpha}
        valueText={`${Math.round(hsva.a * 100)}%`}
        disabled={disabled}
        onMove={(percent) => state.move({a: percent / 100})}
        onCommit={(percent) => state.complete({a: percent / 100})}
      >
        <html.div style={[styles.layer, styles.alphaBase]} />
        <html.div style={[styles.layer, styles.alphaTrack(opaque)]} />
      </ColorSlider>
      <html.div style={styles.row}>
        <html.div
          role="img"
          aria-label={`${names.preview}: ${state.current}`}
          style={[styles.preview, styles.previewFill(state.current)]}
        />
        <html.div style={styles.field}>
          <Input
            aria-label={names.text}
            variant={state.invalid ? 'error' : 'default'}
            value={state.text}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="none"
            onChange={(event) => state.editText(event.target.value)}
            onBlur={state.commitText}
            onKeyDown={(event) => {
              if (event.key === 'Enter') state.commitText()
            }}
          />
        </html.div>
      </html.div>
      {swatches && swatches.length > 0 && (
        <html.div style={styles.wrap}>
          <SwatchButtons
            colors={swatches}
            selected={state.current}
            disabled={disabled}
            onPick={state.pick}
          />
        </html.div>
      )}
      {recentColors && recentColors.length > 0 && (
        <html.div role="group" aria-label={recentLabel} style={styles.wrap}>
          <SwatchButtons
            colors={recentColors}
            selected={state.current}
            disabled={disabled}
            onPick={state.pick}
          />
        </html.div>
      )}
    </html.div>
  )
}
