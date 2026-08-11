import {addons} from 'storybook/preview-api'
import type {ComponentMeta} from '@duro-app/ui/component-meta'
import registry from '../../../packages/cli/registry.json'

const CHANNEL_EVENT = 'duro/ai-meta/update'

/**
 * Live metas via import.meta.glob — HMR keeps the panel instant while a
 * .meta.ts is being edited. Widened to every package so the diagram metas
 * show up too.
 */
const metaModules = import.meta.glob('../../../packages/*/src/components/**/*.meta.ts', {
  eager: true,
}) as Record<string, {meta: ComponentMeta}>

const metaByComponent: Record<string, ComponentMeta> = {}

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

export interface AiMetaPayload {
  meta: ComponentMeta | null
  /** The committed registry entry — what agents actually get (props included). */
  registryEntry: (typeof registry.components)[keyof typeof registry.components] | null
  /** Live meta differs from the registry snapshot — pnpm duro:registry. */
  registryStale: boolean
}

/**
 * Storybook decorator sending the live meta plus the registry snapshot (the
 * agent-facing view: extracted props, import path, deprecations) to the
 * manager panel.
 */
export function withAiMeta(storyFn: any, context: any) {
  const componentName = componentNameFromTitle(context.title)
  const meta = componentName ? (metaByComponent[componentName] ?? null) : null
  const registryEntry = componentName
    ? ((registry.components as Record<string, AiMetaPayload['registryEntry']>)[componentName] ??
      null)
    : null
  const registryStale =
    meta !== null &&
    registryEntry !== null &&
    JSON.stringify(meta) !== JSON.stringify(registryEntry.meta)

  try {
    const channel = addons.getChannel()
    channel.emit(CHANNEL_EVENT, {meta, registryEntry, registryStale} satisfies AiMetaPayload)
  } catch {
    // Channel not ready yet during initial render
  }

  return storyFn()
}
