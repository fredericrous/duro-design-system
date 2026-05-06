import type {ComponentMeta} from '../../component-meta'

export const meta: ComponentMeta = {
  description:
    'Root SVG canvas for a static diagram. Provides accessibility (role=img, title, desc), the shared arrow marker definition, and the .duro-diagram scope class that all child node/connector classes resolve under. Authoring is coordinate-explicit; pair with Node, Arrow, Leader, Text.',
  whenToUse: [
    'Hand-authored flowcharts and architecture diagrams rendered inline',
    'Static, non-interactive visualisations with controlled coordinates',
    'Diagrams that must theme alongside the rest of the UI (light/dark/high-contrast via ThemeProvider)',
  ],
  whenNotToUse: [
    'Auto-laid-out graphs — pick a layout engine (dagre, elkjs) and adapt downstream',
    'Interactive editors with drag/drop or live data — out of scope',
    'Charts (bar, line, pie) — use a charting library',
  ],
  example: `<Diagram width={680} height={320} title="Vault PKI flow">
  <Node x={240} y={20} w={200} h={56} ramp="gray" title="Start" />
  <Node x={240} y={120} w={200} h={72} ramp="blue" title="Lookup metadata" />
  <Arrow from={[340, 76]} to={[340, 120]} />
</Diagram>`,
}
