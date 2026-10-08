import type {ComponentMeta} from '../component-meta'

export const meta: ComponentMeta = {
  description:
    "An application's frame: a navigation rail (a labelled nav, the brand at its top, an optional footer at its foot) beside the main content (main), with an optional Header. Below collapseBelow (sm default, md or lg), measured on the shell's own width, the rail is hidden and one sticky bar (a banner, appBarH tall) holds a Menu button that opens the same navigation in a left Drawer, the brand, and the Header's content when there is one — a shell without a Header still has its navigation on a phone. Above it the Header is a row that scrolls with the page and the rail stays sticky. CSS makes the switch: the server renders one HTML for every width with the brand in both places, and display: none hides the inactive copy, so nothing moves after hydration. A skip link (the first tab stop) focuses Main; an Aside inside Main sticks below the bar. Labels come from props. Compound component — Root is required.",
  whenToUse: [
    'The frame of an app with a persistent navigation rail: an admin, a docs site, a dashboard',
    'A layout whose navigation must collapse into a drawer on a phone',
    'An app with no header at all: the bar still gives the Menu button and the brand below collapseBelow',
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
      relationship:
        'AppShell opens the rail in a Drawer below collapseBelow; do not add a second one for it',
    },
    {
      component: 'Aside',
      kind: 'composition',
      relationship:
        "An Aside inside AppShell.Main sticks below the shell's bar (appBarH) below collapseBelow, and at its own offset above",
    },
  ],
  example: `<AppShell.Root
  menuLabel="Menu"
  closeLabel="Close navigation"
  skipLabel="Skip to content"
  brand={<TextLink href="/">Acme</TextLink>}
  collapseBelow="md"
>
  <AppShell.Rail aria-label="Navigation" footer={<Text variant="bodySm">{user.name}</Text>}>
    {({close}) => (
      <SideNav.Root value={pathname} onValueChange={(v) => { close(); navigate(v) }}>
        <SideNav.Item value="/docs">Docs</SideNav.Item>
      </SideNav.Root>
    )}
  </AppShell.Rail>
  <AppShell.Header>{search}</AppShell.Header>
  <AppShell.Main>{children}</AppShell.Main>
</AppShell.Root>`,
}
