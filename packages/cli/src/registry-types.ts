import type {ComponentMeta} from '@duro-app/ui/component-meta'

export type {ComponentMeta}

export interface Registry {
  /** Incompatible-shape counter. Consumers should refuse unknown versions. */
  schemaVersion: 1
  components: Record<string, ComponentEntry>
  recipes: Record<string, RecipeEntry>
  tokens: TokenRegistry
  icons: IconRegistry
  rules: RulesRegistry
  /** Exported string-literal unions: ButtonVariant -> ['primary', ...]. */
  unions: Record<string, string[]>
}

export type ComponentKind = 'component' | 'compound' | 'provider' | 'hook'

export interface ComponentEntry {
  name: string
  kind: ComponentKind
  importPath: string
  /** Repo-relative POSIX path of the defining source file. */
  sourcePath: string
  meta: ComponentMeta | null
  /** null for compound components — see `parts`. */
  props: PropEntry[] | null
  parts?: Record<string, PartEntry>
  deprecated?: string
}

export interface PartEntry {
  name: string
  sourcePath: string
  props: PropEntry[]
  deprecated?: string
}

export interface PropEntry {
  name: string
  /** Syntactic type text — the name a consumer should actually write. */
  type: string
  required: boolean
  /** Verbatim initializer from the destructuring default. */
  default?: string
  /** JSDoc description, collapsed to one paragraph. */
  description?: string
  deprecated?: string
  /** Resolved members when `type` names an exported string-literal union. */
  union?: string[]
}

export interface RecipeEntry {
  name: string
  title: string
  /** The exported component function name. */
  export: string
  meta: ComponentMeta
  /** Full source with imports rewritten to publishable specifiers. */
  source: string
  sourcePath: string
  usesComponents: string[]
  peerDeps: string[]
}

export interface TokenRegistry {
  groups: Record<string, TokenGroup>
}

export interface TokenGroup {
  /** The deep import a consumer must copy. */
  importPath: string
  exportName: string
  entries: TokenEntry[]
}

export interface TokenEntry {
  key: string
  value?: string | number
  /** Per-theme values (colors group). */
  values?: Record<string, string>
}

export interface IconRegistry {
  names: string[]
  sizes: Record<string, number>
  groups: Array<{label: string | null; names: string[]}>
}

export interface RulesRegistry {
  /** Markdown slice lifted verbatim from CLAUDE.md's duro:rules region. */
  critical: string
  lint: LintRule[]
}

export interface LintRule {
  id: string
  severity: 'error' | 'warn' | 'off'
  description: string
  fixable: 'autofix' | 'suggestion' | 'none'
  messages: Record<string, string>
}
