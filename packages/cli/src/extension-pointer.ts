import {accessSync, constants, existsSync} from 'node:fs'
import {delimiter, join} from 'node:path'

const README_POINTER =
  'duro: the design extension (skills, agent, MCP server) installs with grh — see the Extension section of the @duro-app/cli README'

function onPath(command: string, pathVariable: string): boolean {
  return pathVariable.split(delimiter).some((dir) => {
    if (dir === '') return false
    try {
      accessSync(join(dir, command), constants.X_OK)
      return true
    } catch {
      return false
    }
  })
}

/**
 * The one stderr line `duro hook install` and `duro skill install` add: how to
 * install the same content as a grh extension. A runnable command when grh is
 * on PATH, else a pointer to the README. Nothing here runs grh.
 */
export function extensionPointer(cwd: string, pathVariable: string): string {
  if (!onPath('grh', pathVariable)) return README_POINTER
  if (existsSync(join(cwd, 'node_modules', '@duro-app', 'cli', 'greenharness.toml'))) {
    return 'duro: also available as a grh extension: grh install --extension node_modules/@duro-app/cli'
  }
  return 'duro: also available as a grh extension: npm pack @duro-app/cli@6 && tar -xzf duro-app-cli-6*.tgz && grh install --extension package'
}
