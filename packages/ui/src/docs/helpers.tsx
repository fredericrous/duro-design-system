import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {typography, typeScale} from '@duro-app/tokens/tokens/typography.css'
import {Table} from '../components/Table/Table'

const styles = css.create({
  bar: {
    height: 12,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  label: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: 4,
  },
  mono: {
    fontFamily: 'monospace',
  },
  muted: {
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
})

const dynamicStyles = css.create({
  barWidth: (width: string) => ({
    width,
  }),
  typeSample: (fontSize: string, lineHeight: string) => ({
    fontFamily: typography.fontFamily,
    whiteSpace: 'nowrap' as const,
    fontSize,
    lineHeight,
  }),
})

interface SpacingBarProps {
  value: string
}

export function SpacingBar({value}: SpacingBarProps) {
  return <html.div style={[styles.bar, dynamicStyles.barWidth(value)]} />
}

interface TokenTableProps {
  tokens: Record<string, string>
  label?: string
}

interface TypeScaleRow {
  step: number
  token: string
  size: string
  lineHeight: string
}

interface TypeScaleTableProps {
  rows: TypeScaleRow[]
  label?: string
}

export function TypeScaleTable({rows, label}: TypeScaleTableProps) {
  return (
    <html.div>
      {label && <html.h3 style={styles.label}>{label}</html.h3>}
      <Table.Root columns={4} variant="striped" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Step</Table.HeaderCell>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell>Size / Line-height</Table.HeaderCell>
            <Table.HeaderCell>Sample</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.step}>
              <Table.Cell>
                <html.span style={styles.mono}>{row.step}</html.span>
              </Table.Cell>
              <Table.Cell>
                <html.span style={styles.mono}>{row.token}</html.span>
              </Table.Cell>
              <Table.Cell>
                <html.span style={styles.muted}>
                  {row.size} / {row.lineHeight}
                </html.span>
              </Table.Cell>
              <Table.Cell>
                <html.span style={dynamicStyles.typeSample(row.size, row.lineHeight)}>
                  The quick brown fox
                </html.span>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </html.div>
  )
}

export function TokenTable({tokens, label}: TokenTableProps) {
  const entries = Object.entries(tokens)

  return (
    <html.div>
      {label && <html.h3 style={styles.label}>{label}</html.h3>}
      <Table.Root columns={3} variant="striped" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
            <Table.HeaderCell>Preview</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {entries.map(([name, value]) => (
            <Table.Row key={name}>
              <Table.Cell>
                <html.span style={styles.mono}>{name}</html.span>
              </Table.Cell>
              <Table.Cell>
                <html.span style={styles.muted}>{value}</html.span>
              </Table.Cell>
              <Table.Cell>
                <SpacingBar value={value} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </html.div>
  )
}
