import type {Linter} from 'eslint'

export declare const base: Linter.Config[]
export declare const react: Linter.Config[]
export declare const effect: Linter.Config[]
export declare const tests: Linter.Config[]

declare const presets: {
  base: Linter.Config[]
  react: Linter.Config[]
  effect: Linter.Config[]
  tests: Linter.Config[]
}
export default presets
