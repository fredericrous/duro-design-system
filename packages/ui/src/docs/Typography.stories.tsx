import type {Meta, StoryObj} from '@storybook/react'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typePresets} from '@duro-app/tokens/tokens/type-presets.css'
import {Stack} from '../components/Stack/Stack'
import {Text} from '../components/Text/Text'
import {Heading} from '../components/Heading/Heading'
import {TypeScaleTable} from './helpers'

const meta: Meta = {
  title: 'Foundations/Typography',
}

export default meta

const scaleRows = [
  {step: 1, token: 'fontSize1', size: '0.75rem', lineHeight: '1rem'},
  {step: 2, token: 'fontSize2', size: '0.8125rem', lineHeight: '1.25rem'},
  {step: 3, token: 'fontSize3', size: '0.875rem', lineHeight: '1.25rem'},
  {step: 4, token: 'fontSize4', size: '1rem', lineHeight: '1.5rem'},
  {step: 5, token: 'fontSize5', size: '1.125rem', lineHeight: '1.5rem'},
  {step: 6, token: 'fontSize6', size: '1.25rem', lineHeight: '1.75rem'},
  {step: 7, token: 'fontSize7', size: '1.5rem', lineHeight: '2rem'},
  {step: 8, token: 'fontSize8', size: '1.875rem', lineHeight: '2.25rem'},
  {step: 9, token: 'fontSize9', size: '2.25rem', lineHeight: '2.75rem'},
]

export const PrimitiveScale: StoryObj = {
  render: () => (
    <html.div style={localStyles.wrapper}>
      <TypeScaleTable rows={scaleRows} label="9-Step Type Scale" />
    </html.div>
  ),
}

const presetEntries: Array<{name: string; key: keyof typeof typePresets; sample: string}> = [
  {name: 'bodySm', key: 'bodySm', sample: 'Body small — default UI text at 14px.'},
  {name: 'bodyMd', key: 'bodyMd', sample: 'Body medium — standard body text at 16px.'},
  {name: 'bodyLg', key: 'bodyLg', sample: 'Body large — emphasized body text at 18px.'},
  {name: 'caption', key: 'caption', sample: 'Caption — supplementary info at 12px.'},
  {name: 'label', key: 'label', sample: 'Label — form labels and UI labels at 14px medium.'},
  {name: 'code', key: 'code', sample: 'const x = "Code — monospace for inline code"'},
  {name: 'overline', key: 'overline', sample: 'Overline — section labels, uppercase'},
  {name: 'headingSm', key: 'headingSm', sample: 'Heading Small'},
  {name: 'headingMd', key: 'headingMd', sample: 'Heading Medium'},
  {name: 'headingLg', key: 'headingLg', sample: 'Heading Large'},
  {name: 'headingXl', key: 'headingXl', sample: 'Heading Extra Large'},
  {name: 'displaySm', key: 'displaySm', sample: 'Display Small'},
  {name: 'displayMd', key: 'displayMd', sample: 'Display Medium'},
  {name: 'displayLg', key: 'displayLg', sample: 'Display Large'},
]

export const SemanticPresets: StoryObj = {
  render: () => (
    <html.div style={localStyles.wrapper}>
      <Stack gap="lg">
        {presetEntries.map(({name, key, sample}) => (
          <html.div key={name}>
            <html.span style={localStyles.presetLabel}>{name}</html.span>
            <html.div style={typePresets[key]}>{sample}</html.div>
          </html.div>
        ))}
      </Stack>
    </html.div>
  ),
}

export const BaselineGrid: StoryObj = {
  render: () => {
    const gridLines = Array.from({length: 8}, (_, i) => i)
    return (
      <html.div style={localStyles.wrapper}>
        <Stack gap="md">
          <html.p style={localStyles.hint}>
            Text overlaid on a 24px baseline grid showing vertical rhythm alignment.
          </html.p>
          <html.div style={localStyles.gridContainer}>
            {gridLines.map((i) => (
              <html.div key={i} style={localStyles.gridLine} />
            ))}
            <html.div style={localStyles.gridOverlay}>
              <html.div style={typePresets.bodyMd}>Body medium sits on the 24px grid.</html.div>
              <html.div style={typePresets.headingMd}>Heading medium aligns too.</html.div>
              <html.div style={typePresets.bodySm}>Body small text flows naturally below.</html.div>
            </html.div>
          </html.div>
        </Stack>
      </html.div>
    )
  },
}

export const FluidDisplay: StoryObj = {
  render: () => (
    <html.div style={localStyles.wrapper}>
      <Stack gap="md">
        <html.p style={localStyles.hint}>
          Drag the right edge of the container to resize. Display headings scale fluidly between
          their min and max sizes using clamp().
        </html.p>
        <html.div style={localStyles.resizableContainer}>
          <Stack gap="md">
            <html.div style={typePresets.displayLg}>Display Large</html.div>
            <html.div style={typePresets.displayMd}>Display Medium</html.div>
            <html.div style={typePresets.displaySm}>Display Small</html.div>
          </Stack>
        </html.div>
      </Stack>
    </html.div>
  ),
}

export const HeadingLevels: StoryObj = {
  render: () => (
    <html.div style={localStyles.wrapper}>
      <Stack gap="lg">
        <Heading level={1}>Heading Level 1 — headingXl</Heading>
        <Heading level={2}>Heading Level 2 — headingLg</Heading>
        <Heading level={3}>Heading Level 3 — headingMd</Heading>
        <Heading level={4}>Heading Level 4 — headingSm</Heading>
        <Heading level={5}>Heading Level 5 — headingSm</Heading>
        <Heading level={6}>Heading Level 6 — headingSm</Heading>
      </Stack>
    </html.div>
  ),
}

export const TextVariants: StoryObj = {
  render: () => (
    <html.div style={localStyles.wrapper}>
      <Stack gap="lg">
        <Text variant="bodyMd" as="p">
          Body medium — the default paragraph text.
        </Text>
        <Text variant="bodySm" as="p">
          Body small — compact UI text for secondary content.
        </Text>
        <Text variant="bodyLg" as="p">
          Body large — emphasized text for intros or callouts.
        </Text>
        <Text variant="caption" color="muted">
          Caption — timestamps, footnotes, metadata
        </Text>
        <Text variant="label">Label — form labels and input descriptions</Text>
        <Text variant="code">const greeting = &quot;Hello, world!&quot;</Text>
        <Text variant="overline" color="muted">
          Overline — section dividers
        </Text>
        <Stack gap="sm">
          <Text variant="bodyMd" color="accent">
            Accent colored text
          </Text>
          <Text variant="bodyMd" color="error">
            Error colored text
          </Text>
          <Text variant="bodyMd" color="success">
            Success colored text
          </Text>
          <Text variant="bodyMd" color="warning">
            Warning colored text
          </Text>
        </Stack>
      </Stack>
    </html.div>
  ),
}

const localStyles = css.create({
  wrapper: {
    maxWidth: 720,
  },
  hint: {
    fontSize: '0.75rem',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  presetLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    fontFamily: 'monospace',
    color: colors.textMuted,
    marginBottom: 4,
  },
  gridContainer: {
    position: 'relative',
  },
  gridLine: {
    height: 24,
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  resizableContainer: {
    resize: 'horizontal',
    overflow: 'auto',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: 280,
    maxWidth: '100%',
    width: 700,
  },
})
