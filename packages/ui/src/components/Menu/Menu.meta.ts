import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    'Dropdown action menu. Triggers actions (not value selection). Compound component — Root is required (throws without it). Menu.Trigger renders the button itself: give it the label (text, an Icon), never a Button; an icon-only trigger takes aria-label, and variant="ghost" suits toolbars; size="small" matches small Toggles and Buttons (a small ghost trigger is iconButtonSm). The popup is portalled and placed against the trigger (never clipped by a sticky or overflow ancestor), capped at sizes.listMaxH with scrolling, and takes focus on open (WAI-ARIA menu button); Escape closes only the menu, not an enclosing Popover or Dialog. On React Native the popup is placed against the trigger in a modal overlay; a press outside or the Android back button closes it, and an item runs its onClick after the menu has gone (so an item can open a Dialog). Menu.LinkItem takes onNavigate(href, event) on both platforms (ADR-0002); on native, without it or without preventDefault, the link opens with the system. Native has no arrow keys: each item is its own screen-reader stop.',
  whenToUse: [
    'Context menu or "more actions" dropdown',
    'Navigation links in a dropdown',
    'Overflow menu for toolbar actions',
    'A toolbar dropdown (align, insert) in an editor — Menu.Trigger variant="ghost"',
  ],
  whenNotToUse: [
    'Picking a value — use Select',
    'Primary navigation — use SideNav or Tabs',
    'A small form tied to the trigger — use Popover',
  ],
  anatomy: {
    required: ['Root', 'Trigger', 'Popup', 'Item'],
    optional: ['LinkItem', 'Separator'],
  },
  relatedTo: [
    {
      component: 'Select',
      kind: 'contrast',
      relationship: 'Select picks values; Menu triggers actions',
    },
    {
      component: 'Button',
      kind: 'contrast',
      relationship:
        'Button runs one action; Menu opens a list of them. Menu.Trigger is already a button — never put a Button inside it',
    },
  ],
  example: `<Menu.Root>
  <Menu.Trigger>Actions</Menu.Trigger>
  <Menu.Popup>
    <Menu.Item onClick={() => console.log('edit')}>Edit</Menu.Item>
    <Menu.Item onClick={() => console.log('duplicate')}>Duplicate</Menu.Item>
    <Menu.Separator />
    <Menu.LinkItem href="/settings">Settings</Menu.LinkItem>
  </Menu.Popup>
</Menu.Root>`,
}
