import {addons} from 'storybook/preview-api'

const CHANNEL_EVENT = 'duro/ai-meta/update'

/**
 * Eagerly import all component .meta.ts files and build a lookup map.
 */
const metaModules = import.meta.glob(
  '../../../packages/ui/src/components/**/*.meta.ts',
  {eager: true},
) as Record<string, {meta: any}>

const metaByComponent: Record<string, any> = {}

for (const [path, mod] of Object.entries(metaModules)) {
  const match = path.match(/\/components\/([^/]+)\//)
  if (match && mod.meta) {
    metaByComponent[match[1]] = mod.meta
  }
}

function componentNameFromTitle(title?: string): string | null {
  if (!title) return null
  const parts = title.split('/')
  return parts[parts.length - 1] || null
}

/**
 * Storybook decorator that sends AI meta to the manager panel via channel.
 */
export function withAiMeta(storyFn: any, context: any) {
  const componentName = componentNameFromTitle(context.title)
  const meta = componentName ? metaByComponent[componentName] ?? null : null

  try {
    const channel = addons.getChannel()
    channel.emit(CHANNEL_EVENT, meta)
  } catch {
    // Channel not ready yet during initial render
  }

  return storyFn()
}
