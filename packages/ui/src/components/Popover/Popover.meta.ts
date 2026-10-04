import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Non-modal anchored overlay for small interactive content. Compound component — Root is required (throws without it). Anchored to Popover.Trigger, or to a virtual anchor (a () => DOMRect) when there is no Trigger; call reposition() through a ref when the anchor moves.',
  whenToUse: [
    'A small form or controls tied to one element that stay open while you work in them',
    'Anchoring to a spot that is not a button (a canvas point, a text selection) with a virtual anchor',
  ],
  whenNotToUse: [
    'A list of actions — use Menu',
    'Hover-only text — use Tooltip',
    'A blocking decision — use Dialog or ConfirmDialog',
    'A long editor, or one that follows the selection — use DetailPanel',
    'Phone width — use Drawer',
  ],
  anatomy: {
    required: ['Root', 'Popup'],
    optional: ['Trigger', 'Close'],
  },
  relatedTo: [
    {
      component: 'Menu',
      kind: 'contrast',
      relationship: 'Menu opens a list of actions; Popover holds small forms and controls',
    },
    {
      component: 'Tooltip',
      kind: 'contrast',
      relationship:
        'Tooltip shows hover-only text; Popover holds interactive content and stays open',
    },
    {
      component: 'Dialog',
      kind: 'contrast',
      relationship: 'Dialog is modal and blocks the page; Popover is non-modal and anchored',
    },
    {
      component: 'DetailPanel',
      kind: 'contrast',
      relationship:
        'DetailPanel is an in-flow panel for long editing; Popover is a small anchored overlay',
    },
    {
      component: 'Drawer',
      kind: 'contrast',
      relationship:
        'Drawer is the modal edge panel for phone width; Popover is anchored and non-modal',
    },
    {
      component: 'Field',
      kind: 'composition',
      relationship: 'Place Field.Root with its control inside Popover.Popup for a labelled field',
    },
  ],
  example: `const ref = useRef<PopoverHandle>(null)
const anchor = () => new DOMRect(point.x, point.y, 0, 0)

<Popover.Root ref={ref} open={open} onOpenChange={setOpen} anchor={anchor} side="bottom" align="start">
  <Popover.Popup label="Edit label">
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Input value={label} onChange={(e) => setLabel(e.target.value)} />
    </Field.Root>
    <Popover.Close>Done</Popover.Close>
  </Popover.Popup>
</Popover.Root>
// after the anchor moves: ref.current?.reposition()`,
}
