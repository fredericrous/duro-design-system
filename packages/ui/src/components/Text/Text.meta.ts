import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Body and label typography component. Renders a span or paragraph with design system typography presets. Use for all non-heading text content.',
  whenToUse: [
    'Body text (paragraphs, descriptions)',
    'UI labels and metadata',
    'Captions, code snippets, overlines',
  ],
  whenNotToUse: [
    'Page or section titles — use Heading',
    'Form field labels — use Field.Label (auto-binds to form)',
  ],
  relatedTo: [
    {component: 'Heading', relationship: 'Heading for semantic h1-h6; Text for body/label'},
  ],
  example: `<Stack gap="xs">
  <Text variant="label">Email</Text>
  <Text variant="bodySm" color="muted">We will never share your email.</Text>
  <Text variant="code">user@example.com</Text>
</Stack>`,
}
