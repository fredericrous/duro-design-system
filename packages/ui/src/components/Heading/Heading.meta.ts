import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Semantic heading element (h1-h6) with typography presets. Always use the correct level for document hierarchy. The look is `variant` (heading, display, overline) and its size is `size` (sm, md, lg, xl), both independent of the semantic level. The old combined variants (headingSm, displayLg, …) still work and are deprecated.',
  whenToUse: [
    'Page titles (level 1)',
    'Section headers (level 2-3)',
    'Card or panel titles (level 3-4)',
    'Group titles over a list of rows or a form section (level 3-4, variant="overline", any size)',
  ],
  whenNotToUse: [
    'Body text — use Text',
    'Form labels — use Field.Label',
    'Non-semantic bold text — use Text with weight',
  ],
  relatedTo: [
    {
      component: 'Text',
      kind: 'contrast',
      relationship: 'Text for body/label; Heading for semantic headings',
    },
  ],
  example: `<Stack gap="md">
  <Heading level={1}>Page Title</Heading>
  <Heading level={2} size="md">Section</Heading>
  <Heading level={1} variant="display" size="lg">Hero</Heading>
  <Heading level={3} variant="overline" color="muted">Group</Heading>
  <Heading level={2} variant="overline" size="lg">Large group</Heading>
</Stack>`,
}
