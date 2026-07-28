/**
 * `@duro-app/ui/table` — the TanStack-aware half of the table.
 *
 * Everything here reaches `@tanstack/react-table`, which is a peer dependency
 * a consumer only has if they asked for it. Keeping it out of the package root
 * is what makes that peer genuinely optional: a bundler must RESOLVE every
 * static import before tree-shaking can drop the code behind it, so a single
 * `import ... from '@tanstack/react-table'` anywhere in the root's graph fails
 * the build of an app that never renders a data table.
 *
 * `Table` exported here is the root's object with the TanStack pieces
 * attached, so migrating is one import line and no call sites change:
 *
 *   -import {Table, useDataTable} from '@duro-app/ui'
 *   +import {Table, useDataTable} from '@duro-app/ui/table'
 *
 * Plain `<Table.Root>` users need nothing — that stays on the package root.
 */

// Side-effect: registers our augmentation of TanStack's ColumnMeta
// (stackLabel / isActions). It belongs here rather than at the root because
// the augmentation only means anything once TanStack is in the program, and
// declaring it at the root made the root's types depend on the peer.
import './components/Table/tanstack-augmentation'

import {TableCore} from './components/Table/Table'
import {Pagination} from './components/Table/Pagination'
import {SortIndicator} from './components/Table/SortIndicator'
import {ColumnFilter} from './components/Table/ColumnFilter'
import {SortChip} from './components/Table/SortChip'
import {FromTanstack} from './components/Table/FromTanstack'

/** The full table: the presentational parts plus the TanStack integration. */
export const Table = {
  ...TableCore,
  Pagination,
  SortIndicator,
  ColumnFilter,
  SortChip,
  /** Renders a styled Table directly from a TanStack table instance. */
  FromTanstack,
}

export {useDataTable} from './components/Table/useDataTable'

// Web-only (DOM scroll measurement + @tanstack/react-virtual), and TanStack
// Table-aware, so it lives here rather than at the root.
export {VirtualTable, type VirtualTableRange} from './components/VirtualTable/VirtualTable'

export type {TableVariant, TableSize} from './components/Table/Table'
