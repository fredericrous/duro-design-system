/** One finding of the native graph lint. */
export interface Violation {
  file: string
  line: number
  column: number
  form: string
}

/** Lints the given files (the native graph) and returns what it finds. */
export function lintNativeGraph(files: string[], root: string): Promise<Violation[]>
