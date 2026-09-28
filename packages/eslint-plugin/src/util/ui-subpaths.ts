// Names exported only from an @duro-app/ui subpath, never from the root.
// Literals so the published plugin stays dependency-free; the drift test in
// packages/ui/test/ui-subpaths-drift.test.ts rebuilds this from packages/ui/src.

export interface UiSubpathExport {
  subpath: 'form' | 'table'
  /** The optional peers that are the reason the subpath exists. */
  peers: string
}

const FORM: UiSubpathExport = {subpath: 'form', peers: 'react-hook-form, @hookform/resolvers'}
const TABLE: UiSubpathExport = {subpath: 'table', peers: '@tanstack/react-table'}

export const UI_SUBPATH_EXPORTS: Record<string, UiSubpathExport> = {
  Form: FORM,
  FormProps: FORM,
  useDataTable: TABLE,
  VirtualTable: TABLE,
  VirtualTableRange: TABLE,
}
