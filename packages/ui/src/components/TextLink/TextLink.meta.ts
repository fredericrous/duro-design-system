import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Inline hyperlink for running text and standalone text links ("View all", "Edit profile"). Always underlined, so colour is never the only cue: default is accent text with an accent underline; subtle keeps the surrounding text colour with a muted underline and turns accent on hover. target="_blank" defaults rel to noopener noreferrer.',
  whenToUse: [
    'A link inside a sentence or paragraph',
    'A standalone text link under a list or card ("View all requests")',
    'A quiet link in dense UI (variant="subtle")',
  ],
  whenNotToUse: [
    'A link that should look like a button — use LinkButton',
    'An action that does not navigate — use Button (variant="link" for a text-styled action)',
    'A link inside a dropdown — use Menu.LinkItem',
  ],
  relatedTo: [
    {
      component: 'LinkButton',
      kind: 'contrast',
      relationship:
        'LinkButton is a hyperlink styled as a button; TextLink is a hyperlink styled as text',
    },
    {
      component: 'Button',
      kind: 'contrast',
      relationship: 'Button runs an action; TextLink navigates',
    },
  ],
  example: `<Text>
  Read the <TextLink href="/docs/migrate">migration guide</TextLink> before you change seats, or{' '}
  <TextLink href="/plans" variant="subtle">compare plans</TextLink> first.
</Text>`,
}
