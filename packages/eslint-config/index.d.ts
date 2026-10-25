import type {Linter} from 'eslint'

export declare const base: Linter.Config[]
export declare const react: Linter.Config[]
export declare const effect: Linter.Config[]
export declare const tests: Linter.Config[]

export type AdrLintStack = 'react' | 'effect'

export interface AdrLintRestrictedImport {
  files?: string[]
  paths?: (string | {name: string; message?: string; allowTypeImports?: boolean})[]
  patterns?: (string | {group: string[]; message?: string; allowTypeImports?: boolean})[]
}

export interface AdrLintOptions {
  stack?: AdrLintStack[]
  restrictedImports?: AdrLintRestrictedImport[]
}

export declare function adrLint(options?: AdrLintOptions): Linter.Config[]
export declare function adrLintTyped(options?: AdrLintOptions): Linter.Config[]

declare const presets: {
  base: Linter.Config[]
  react: Linter.Config[]
  effect: Linter.Config[]
  tests: Linter.Config[]
  adrLint: typeof adrLint
  adrLintTyped: typeof adrLintTyped
}
export default presets
