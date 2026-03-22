import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Structural primitive for grouping content with header, body, and footer slots. A "workspace surface" for forms, settings sections, and inspectors. Sub-components are purely structural — no context required.',
  whenToUse: [
    'Organizing content with distinct header/body/footer sections',
    'Settings panels, form containers, inspector views',
    'When you need more structure than Card but less than a full page layout',
  ],
  whenNotToUse: [
    'Repeating item cards — use Card',
    'Modal/overlay content — use Dialog or Drawer',
    'Page-level layout — use PageShell',
  ],
  anatomy: {
    required: [],
    optional: ['Root', 'Header', 'Body', 'Footer'],
  },
  relatedTo: [
    {
      component: 'Card',
      relationship: 'Card is for shallow, repeated items; Panel is for deep, organized content',
    },
    {
      component: 'DetailPanel',
      relationship: 'DetailPanel uses Panel internally for its structural layout',
    },
    {
      component: 'PageShell',
      relationship: 'PageShell is for page-level layout; Panel is for section-level',
    },
  ],
  example: `<Panel.Root bordered>
  <Panel.Header>
    <Heading level={3}>Section Title</Heading>
    <Button variant="secondary" size="small">Action</Button>
  </Panel.Header>
  <Panel.Body>
    {/* Content */}
  </Panel.Body>
  <Panel.Footer>
    <Button>Save</Button>
  </Panel.Footer>
</Panel.Root>`,
}
