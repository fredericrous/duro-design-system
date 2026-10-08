// Compile-only fixtures for the exclusive prop sets of the docs-nav parts.
// `pnpm typecheck` fails if an illegal combination becomes assignable, or a
// legal one stops being. Never imported at runtime.

import type {Breadcrumb} from '../components/Breadcrumb/Breadcrumb'
import type {TableOfContents} from '../components/TableOfContents/TableOfContents'
import type {OnNavigate} from './navigate'

/** `true` when every member of T is assignable to U. */
type Assignable<T, U> = [T] extends [U] ? true : false

/** The props a function component takes. */
type PropsOf<C> = C extends (props: infer P) => unknown ? P : never

type CrumbProps = PropsOf<typeof Breadcrumb.Item>
type TocRootProps = PropsOf<typeof TableOfContents.Root>
type Children = {children: string}

// Breadcrumb.Item: a link, or the current page — never both, never neither.
export const crumbLink: Assignable<{href: string} & Children, CrumbProps> = true
export const crumbLinkNavigate: Assignable<
  {href: string; onNavigate: OnNavigate} & Children,
  CrumbProps
> = true
export const crumbCurrent: Assignable<{current: true} & Children, CrumbProps> = true
export const crumbCurrentWithHref: Assignable<
  {current: true; href: string} & Children,
  CrumbProps
> = false
export const crumbCurrentWithNavigate: Assignable<
  {current: true; onNavigate: OnNavigate} & Children,
  CrumbProps
> = false
export const crumbNeither: Assignable<Children, CrumbProps> = false

// TableOfContents.Root: the disclosure props belong to the menu variant only.
type TocBase = {'aria-label': string} & Children
export const tocList: Assignable<TocBase, TocRootProps> = true
export const tocMenuOpen: Assignable<
  {variant: 'menu'; open: boolean; onOpenChange: (open: boolean) => void} & TocBase,
  TocRootProps
> = true
export const tocListOpen: Assignable<{open: boolean} & TocBase, TocRootProps> = false
export const tocListDefaultOpen: Assignable<
  {variant: 'list'; defaultOpen: boolean} & TocBase,
  TocRootProps
> = false
