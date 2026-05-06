import type {Meta, StoryObj} from '@storybook/react'
import {expect} from 'storybook/test'
import {Diagram} from './Diagram'
import {Node} from '../Node/Node'
import {Arrow} from '../Arrow/Arrow'
import {Leader} from '../Leader/Leader'
import {Text} from '../Text/Text'
import {RAMPS} from '../types'

const meta: Meta<typeof Diagram> = {
  title: 'Diagrams/Diagram',
  component: Diagram,
}
export default meta
type Story = StoryObj<typeof Diagram>

/**
 * One swatch row per ramp. Each row shows a Node with both title and subtitle
 * so all four colour stops (fill, stroke, title, subtitle) are exercised. Wrap
 * the story in a different ThemeProvider via the toolbar background switcher
 * to verify dark / light / high-contrast all flip cleanly.
 */
export const RampSwatches: Story = {
  args: {
    width: 680,
    height: RAMPS.length * 70 + 40,
    title: 'All ramps',
    desc: 'Every ramp rendered as a Node with title + subtitle to exercise all four colour stops.',
    children: (
      <>
        {RAMPS.map((ramp, i) => (
          <Node
            key={ramp}
            x={40}
            y={20 + i * 70}
            w={600}
            h={56}
            ramp={ramp}
            title={`Ramp: ${ramp}`}
            subtitle="Title and subtitle, fill and stroke"
          />
        ))}
      </>
    ),
  },
  play: async ({canvas}) => {
    await expect(canvas.getByText('Ramp: blue')).toBeInTheDocument()
    await expect(canvas.getByText('Ramp: red')).toBeInTheDocument()
  },
}

/**
 * The chat's worked example: an idempotent Vault PKI certificate-issuance flow.
 * Exercises Diagram + Node + Arrow (straight + L-bend) + Leader + Text in one piece.
 *
 * Layout, with the box centres marked:
 *
 *                 Start            (240,20)–(440,76)
 *                   |
 *               Lookup metadata    (240,120)–(440,192)
 *                   |
 *              decision split (no diamond — colour split + L-bends carry meaning)
 *              /             \
 *   Cached?  Y                N  Cached?
 *      |                          |
 *   Return cached cert         Issue new certificate     (then back to bottom row)
 *   (40,240)–(280,312)         (400,240)–(640,312)
 *      \                          /
 *               End               (240,360)–(440,416)
 */
export const VaultPkiFlow: Story = {
  args: {
    width: 680,
    height: 440,
    title: 'Vault PKI idempotent issuance flow',
    desc:
      'Start → look up KV metadata → branch: cached cert is returned, otherwise a new ' +
      'cert is issued and metadata is updated. Both branches converge on End.',
    children: (
      <>
        <Node x={240} y={20} w={200} h={56} ramp="gray" title="Start" />
        <Arrow from={[340, 76]} to={[340, 120]} />

        <Node
          x={240}
          y={120}
          w={200}
          h={72}
          ramp="blue"
          title="Lookup metadata"
          subtitle="Read KV at secret/pki/<cn>"
        />

        <Arrow from={[340, 192]} to={[140, 240]} bend="Z" />
        <Arrow from={[340, 192]} to={[520, 240]} bend="Z" />

        <Node
          x={40}
          y={240}
          w={200}
          h={72}
          ramp="teal"
          title="Return cached cert"
          subtitle="Skip issuance"
        />

        <Node
          x={420}
          y={240}
          w={220}
          h={72}
          ramp="coral"
          title="Issue new certificate"
          subtitle="POST pki/issue/<role>"
        />

        <Arrow from={[140, 312]} to={[340, 360]} bend="Z" />
        <Arrow from={[530, 312]} to={[340, 360]} bend="Z" />

        <Node x={240} y={360} w={200} h={56} ramp="gray" title="End" />

        {/* Edge label on the right branch arrow's horizontal leg (y=216, x=340..520).
            Centered on the midpoint, offset 8px above so it doesn't sit on the line. */}
        <Text x={430} y={208} variant="ts" anchor="middle">
          Coral encodes a write
        </Text>
      </>
    ),
  },
  play: async ({canvas}) => {
    await expect(canvas.getByText('Start')).toBeInTheDocument()
    await expect(canvas.getByText('Lookup metadata')).toBeInTheDocument()
    await expect(canvas.getByText('Return cached cert')).toBeInTheDocument()
    await expect(canvas.getByText('Issue new certificate')).toBeInTheDocument()
    await expect(canvas.getByText('End')).toBeInTheDocument()
  },
}
