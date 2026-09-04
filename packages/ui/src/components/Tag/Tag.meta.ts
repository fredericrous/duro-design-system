import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Interactive tag/chip with optional remove button. Works standalone or inside TagGroup for collection management. Visually similar to Badge but supports interaction.',
  whenToUse: [
    'Removable items in a list (emails, categories)',
    'Inside TagGroup for editable tag collections',
    'Interactive labels that can be dismissed',
  ],
  whenNotToUse: [
    'Static status indicators — use Badge',
    'Toggleable selection — use Toggle or ToggleGroup',
  ],
  relatedTo: [
    {
      component: 'Badge',
      kind: 'contrast',
      relationship: 'Tag is interactive and removable; Badge is a static label',
    },
    {
      component: 'TagGroup',
      kind: 'composition',
      relationship: 'Wrap in TagGroup.Root for collection management',
    },
  ],
  example: `<Tag removable onRemove={() => console.log('removed')}>
  user@example.com
</Tag>`,
}
