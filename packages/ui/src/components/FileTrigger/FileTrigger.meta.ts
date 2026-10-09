import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'A Button that opens the OS file picker. Pass the chosen files to onSelect; call open() on its ref to open the picker from elsewhere.',
  whenToUse: [
    'Uploading or attaching one or more files',
    'Opening the file picker from a custom control via the ref',
  ],
  whenNotToUse: [
    'Drag-and-drop zones — build on a drop target instead',
    'Triggering a non-file action — use Button',
  ],
  relatedTo: [
    {
      component: 'Button',
      kind: 'composition',
      relationship: 'FileTrigger renders a Button and forwards variant, size and disabled',
    },
  ],
  example: `<FileTrigger accept="image/*" multiple onSelect={(files) => upload(files)}>
  Choose images
</FileTrigger>`,
}
