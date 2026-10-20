import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Multi-line text input with automatic Field/Form integration. Same Field binding behavior as Input. autoGrow makes the height follow the content from rows up to maxRows, then it scrolls (CSS field-sizing, with a scrollHeight fallback; native grows with the content and caps at maxRows). The anchor props of Listbox.getAnchorProps() (role combobox, aria-controls, aria-expanded, aria-activedescendant) are forwarded as ARIA attributes on web and as the matching accessibility props on native, so a Listbox can be anchored to it while the editor keeps focus. On the web, onFiles receives files pasted into the field or dropped on it (the drop ring shows while files are dragged over it); text pastes stay text.',
  whenToUse: [
    'Multi-line text entry (comments, messages, descriptions)',
    'A composer that grows with its text (autoGrow, maxRows)',
    'An editor a Listbox is anchored to for mentions or slash commands (spread Listbox.getAnchorProps())',
  ],
  whenNotToUse: ['Single-line input — use Input'],
  relatedTo: [
    {
      component: 'Input',
      kind: 'contrast',
      relationship: 'Input for single-line entry; Textarea for multi-line',
    },
    {component: 'Field', kind: 'composition', relationship: 'Wrap in Field.Root for label + error'},
  ],
  example: `<Field.Root name="message">
  <Field.Label>Message</Field.Label>
  <Textarea placeholder="Tell us what you think..." rows={4} />
  <Field.Description>At least 10 characters</Field.Description>
  <Field.Error />
</Field.Root>`,
}
