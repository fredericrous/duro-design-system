import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Compound component for managing a collection of tags. Supports editable mode with an inline input for adding tags via Enter/comma, removal via X button or Backspace, and paste support for bulk adding.',
  whenToUse: [
    'Email address input (add/remove multiple emails)',
    'Editable tag collections (categories, labels)',
    'Static display of tag groups with optional removal',
  ],
  whenNotToUse: [
    'Single value selection — use Select or Combobox',
    'Static non-interactive labels — use Badge with Cluster',
    'Toggle-based selection — use ToggleGroup',
  ],
  relatedTo: [
    {component: 'Tag', kind: 'composition', relationship: 'Tag is the item inside TagGroup.List'},
    {
      component: 'Badge',
      kind: 'contrast',
      relationship: 'TagGroup manages an editable collection; Badge is a static label',
    },
    {
      component: 'Field',
      kind: 'composition',
      relationship: 'Wrap in Field.Root for label + description + error',
    },
  ],
  example: `<TagGroup.Root name="emails" value={emails} onValueChange={setEmails}>
  <TagGroup.List aria-label="Emails">
    {emails.map(e => <Tag key={e} value={e}>{e}</Tag>)}
  </TagGroup.List>
  <TagGroup.Input placeholder="Add email..." />
</TagGroup.Root>`,
}
