import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Text for assistive tech only: kept in the accessibility tree, clipped off screen. Gives words to an icon-only control or a visual-only cue.',
  whenToUse: [
    'A label for an icon inside a control that has no aria-label prop',
    'Spelling out what a colour or icon shows (a status dot, "(opens in a new tab)")',
    'A heading that structures a page for screen readers without a visible title',
  ],
  whenNotToUse: [
    'Naming a control that takes aria-label — pass aria-label instead',
    'Hiding content from everyone — render nothing, or use display: none',
  ],
  example: `<Button variant="secondary">
  <Icon name="search" size="sm" />
  <VisuallyHidden>Search</VisuallyHidden>
</Button>`,
}
