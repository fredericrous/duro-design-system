import type {ESLint, Linter} from 'eslint'

export declare const react: Linter.Config[]

/** The `greenrack/no-restricted-imports` entry `react` sets. */
export declare const uiImportBans: Linter.RuleEntry

/** The greenrack ESLint plugin, the same object `react` registers. */
export declare const greenrackPlugin: ESLint.Plugin

declare const presets: {
  react: Linter.Config[]
}
export default presets
