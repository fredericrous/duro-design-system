import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Semantic heading element (h1-h6) with typography presets. Always use the correct level for document hierarchy. Visual size can differ from semantic level via the variant prop.',
  whenToUse: [
    'Page titles (level 1)',
    'Section headers (level 2-3)',
    'Card or panel titles (level 3-4)',
  ],
  whenNotToUse: [
    'Body text — use Text',
    'Form labels — use Field.Label',
    'Non-semantic bold text — use Text with weight',
  ],
  relatedTo: [
    {component: 'Text', relationship: 'Text for body/label; Heading for semantic headings'},
  ],
  example: `<Stack gap="md">
  <Heading level={1}>Page Title</Heading>
  <Heading level={2} variant="headingMd">Section</Heading>
  <Heading level={3}>Subsection</Heading>
</Stack>`,
}
