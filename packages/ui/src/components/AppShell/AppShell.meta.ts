import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    "An application's frame: a navigation rail (a labelled nav) beside a header (banner) and the main content (main). Below the sm breakpoint, measured on the shell's own width, the rail is hidden and a Menu button in the header opens the same navigation in a left Drawer; focus returns to the button when it closes. CSS makes the switch, so the server renders the desktop shell. Labels come from props. Compound component — Root is required.",
  whenToUse: [
    'The frame of an app with a persistent navigation rail: an admin, a docs site, a dashboard',
    'A layout whose navigation must collapse into a drawer on a phone',
  ],
  whenNotToUse: [
    'A single page with a header and no rail — use PageShell',
    'A rail beside one region inside a page — use Grid layout="split-wide" with a SideNav',
  ],
  anatomy: {
    required: ['Root', 'Main'],
    optional: ['Rail', 'Header'],
  },
  relatedTo: [
    {
      component: 'SideNav',
      kind: 'composition',
      relationship:
        'The usual content of AppShell.Rail; call the render function close() in its onValueChange so the drawer shuts after a pick',
    },
    {
      component: 'PageShell',
      kind: 'contrast',
      relationship:
        'PageShell centres one page under a header; AppShell frames the whole app around a rail',
    },
    {
      component: 'Drawer',
      kind: 'composition',
      relationship: 'AppShell opens the rail in a Drawer below sm; do not add a second one for it',
    },
  ],
  example: `<AppShell.Root menuLabel="Menu" closeLabel="Close navigation">
  <AppShell.Rail aria-label="Navigation">
    {({close}) => (
      <SideNav.Root value={pathname} onValueChange={(v) => { close(); navigate(v) }}>
        <SideNav.Item value="/docs">Docs</SideNav.Item>
      </SideNav.Root>
    )}
  </AppShell.Rail>
  <AppShell.Header>{search}</AppShell.Header>
  <AppShell.Main id="main">{children}</AppShell.Main>
</AppShell.Root>`,
}
