import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Animated loading indicator. Use while content is being fetched or an action is processing. Always provide a label for accessibility.',
  whenToUse: [
    'Page or section loading states',
    'Button loading states (inside a button)',
    'Async operation feedback',
  ],
  whenNotToUse: [
    'Skeleton loading — use placeholder skeleton patterns',
    'Progress with known completion — use a progress bar',
  ],
  example: `<Stack gap="md" align="center">
  <Spinner size="lg" label="Loading data..." />
  <Button disabled><Spinner size="sm" /> Saving...</Button>
</Stack>`,
}
