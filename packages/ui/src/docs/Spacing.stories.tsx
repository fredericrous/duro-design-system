import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {Stack} from '../components/Stack/Stack'
import {Inline} from '../components/Inline/Inline'
import {useContainerQuery} from '../hooks/useContainerQuery'
import {TokenTable} from './helpers'

const primitiveTokens: Record<string, string> = {
  xs: '4px',
  sm: '8px',
  ms: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
}

const semanticTokens = {
  stack: {stackXs: '4px', stackSm: '8px', stackMd: '16px', stackLg: '24px', stackXl: '48px'},
  inline: {inlineXs: '4px', inlineSm: '8px', inlineMd: '16px', inlineLg: '24px'},
  container: {containerSm: '16px', containerMd: '24px', containerLg: '32px'},
}

const meta: Meta = {
  title: 'Foundations/Spacing',
}

export default meta

const styles = css.create({
  wrapper: {
    maxWidth: 640,
  },
  hint: {
    fontSize: '0.75rem',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  baselineRow: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  baselineLabel: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: colors.textMuted,
    width: 50,
  },
  baselineBlock: {
    flexGrow: 1,
    height: 24,
    backgroundColor: colors.accent,
    opacity: 0.15,
    borderRadius: 2,
  },
  resizableContainer: {
    resize: 'horizontal',
    overflow: 'auto',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: 200,
    maxWidth: '100%',
    width: 600,
  },
  sizeLabel: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  sizeCompact: {
    color: '#e67e22',
  },
  sizeDefault: {
    color: colors.accent,
  },
  sizeSpacious: {
    color: '#27ae60',
  },
  mappingRow: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  mappingLabel: {
    color: colors.textMuted,
  },
  mappingValue: {
    fontWeight: 600,
  },
})

export const PrimitiveScale: StoryObj = {
  render: () => (
    <html.div style={styles.wrapper}>
      <TokenTable tokens={primitiveTokens} label="Primitive Spacing Tokens" />
    </html.div>
  ),
}

export const SemanticTokens: StoryObj = {
  render: () => (
    <html.div style={styles.wrapper}>
      <Stack gap="xl">
        <TokenTable tokens={semanticTokens.stack} label="Stack (vertical)" />
        <TokenTable tokens={semanticTokens.inline} label="Inline (horizontal)" />
        <TokenTable tokens={semanticTokens.container} label="Container (insets)" />
      </Stack>
    </html.div>
  ),
}

export const BaselineRhythm: StoryObj = {
  render: () => {
    const rows = Array.from({length: 12}, (_, i) => i)
    return (
      <html.div style={styles.wrapper}>
        <Stack gap="md">
          <html.p style={styles.hint}>
            Each row is 24px tall — the baseline grid unit. Spacing tokens are multiples or
            fractions of this grid.
          </html.p>
          <html.div>
            {rows.map((i) => (
              <html.div key={i} style={styles.baselineRow}>
                <html.span style={styles.baselineLabel}>{(i + 1) * 24}px</html.span>
                {i % 2 === 0 && <html.div style={styles.baselineBlock} />}
              </html.div>
            ))}
          </html.div>
        </Stack>
      </html.div>
    )
  },
}

const spacingMappings: Record<string, Record<string, string>> = {
  compact: {
    stackGap: '4px – 8px',
    inlineGap: '4px – 8px',
    containerPad: '12px – 16px',
  },
  default: {
    stackGap: '8px – 16px',
    inlineGap: '8px – 16px',
    containerPad: '16px – 24px',
  },
  spacious: {
    stackGap: '16px – 24px',
    inlineGap: '16px – 24px',
    containerPad: '24px – 32px',
  },
}

function ResponsiveDemo() {
  const {ref, size} = useContainerQuery<HTMLDivElement>()
  const sizeStyle =
    size === 'compact'
      ? styles.sizeCompact
      : size === 'spacious'
        ? styles.sizeSpacious
        : styles.sizeDefault
  const mapping = spacingMappings[size]

  return (
    <Stack gap="md">
      <html.p style={styles.hint}>
        Drag the right edge of the container below to resize it. Breakpoints: compact &lt; 480px,
        default 480–768px, spacious &gt; 768px.
      </html.p>
      <html.div ref={ref} style={styles.resizableContainer}>
        <Stack gap="sm">
          <html.div style={[styles.sizeLabel, sizeStyle]}>{size}</html.div>
          {Object.entries(mapping).map(([key, value]) => (
            <html.div key={key} style={styles.mappingRow}>
              <Inline justify="between">
                <html.span style={styles.mappingLabel}>{key}</html.span>
                <html.span style={styles.mappingValue}>{value}</html.span>
              </Inline>
            </html.div>
          ))}
        </Stack>
      </html.div>
    </Stack>
  )
}

export const ResponsiveSpacing: StoryObj = {
  render: () => <ResponsiveDemo />,
}
