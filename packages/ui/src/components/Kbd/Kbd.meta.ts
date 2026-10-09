import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A key or chord hint: one inline <kbd> per key, spaced apart, styled with tokens only. It shows a shortcut; it does not bind it.',
  whenToUse: [
    'Next to an action that has a keyboard shortcut ("J" next, "Cmd K" search)',
    'In help text or a tooltip that names a key',
  ],
  whenNotToUse: ['A clickable control — use Button', 'A status or count — use Badge'],
  relatedTo: [
    {
      component: 'Badge',
      kind: 'contrast',
      relationship: 'Badge labels a status or count; Kbd names a key to press',
    },
  ],
  example: `<Kbd keys={['J']} />
<Kbd keys={['Cmd', 'K']} />`,
}
