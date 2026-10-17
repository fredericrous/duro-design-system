import type {Registry} from '../registry-types.js'
import {buildManifest} from '../manifest.js'
import {guideNames, lookupGuide} from '../registry.js'
import {runLookup} from './lookup.js'
import {runList} from './list.js'
import {cliVersion} from './manifest.js'
import {renderComponent, renderRecipe} from '../format.js'
import {buildCanvas, checkArtboard} from './mockup.js'

const INSTALL_HINT = `duro mcp needs @modelcontextprotocol/sdk (an optional peer).
  npm i -D @modelcontextprotocol/sdk
or run it without installing:
  npx -y -p @duro-app/cli -p @modelcontextprotocol/sdk duro mcp`

/** The MCP tools, JSON Schemas hand-written (no zod dependency). */
export function toolDefinitions(registry: Registry) {
  return [
    {
      name: 'duro_ds_lookup',
      description:
        'Docs for anything in the Duro design system by name: a component (props, usage, example), a recipe (runnable source), a token group, "icons", "rules", or an interface guide ("guide:colors", "guide:typography", "guide:ui"; "guide:<skill>/<file>" for one of its reference files). Free text falls back to a ranked search over usage metadata — pass what you need, e.g. "tags that wrap".',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description:
              'Component/recipe/token-group name, "icons", "rules", "guide:<skill>[/<file>]", or free text to search',
          },
          part: {
            type: 'string',
            description: 'Narrow a compound component to one part (e.g. Root)',
          },
          sourceOnly: {type: 'boolean', description: 'Recipes: return just the source file'},
        },
        required: ['name'],
      },
    },
    {
      name: 'duro_ds_list',
      description: `One-line index of everything documented (${Object.keys(registry.components).length} components, ${Object.keys(registry.recipes).length} recipes, token groups; kind "guides" lists the interface guides).`,
      inputSchema: {
        type: 'object',
        properties: {
          kind: {type: 'string', enum: ['components', 'recipes', 'tokens', 'guides']},
        },
      },
    },
    {
      name: 'duro_ds_manifest',
      description: 'The duro command spec plus all valid lookup names.',
      inputSchema: {type: 'object', properties: {}},
    },
    {
      name: 'duro_ds_mockup_check',
      description:
        'Check a mockup artboard (.dc.html source) against the design system: every colour, spacing, radius, font, shadow and duration must be a var(--duro-*) token, media queries must sit on the breakpoint scale, and every control must carry data-duro="<Component>" naming an @duro-app/ui component. Returns findings; an empty list means the artboard is a valid handoff contract.',
      inputSchema: {
        type: 'object',
        properties: {
          html: {type: 'string', description: 'The full artboard HTML'},
          file: {type: 'string', description: 'A name for the findings, e.g. Main.dc.html'},
        },
        required: ['html'],
      },
    },
    {
      name: 'duro_ds_mockup_canvas',
      description:
        'One self-contained HTML review page for a set of mockup artboards: each direction (Tree.dc.html and Tree-Phone.dc.html are direction Tree) under a letter, every artboard inlined and scaled to its frame. Publish the page for the person to pick a direction. Nothing is built while an artboard fails duro_ds_mockup_check: the findings come back instead.',
      inputSchema: {
        type: 'object',
        properties: {
          artboards: {
            type: 'array',
            description: 'The artboards, each with its file name and full HTML',
            items: {
              type: 'object',
              properties: {
                file: {type: 'string', description: 'e.g. Tree-Phone.dc.html'},
                html: {type: 'string', description: 'The full artboard HTML'},
              },
              required: ['file', 'html'],
            },
          },
          title: {type: 'string', description: 'The page title'},
        },
        required: ['artboards'],
      },
    },
  ]
}

/**
 * The wire shape of a tools/call answer. `structuredContent` must be a JSON
 * object — a bare array is rejected by the SDK's result schema, which is how
 * duro_ds_list (a ListEntry[]) used to fail with -32602 — so arrays ride under
 * `entries`.
 */
export function toolResponse(registry: Registry, name: string, args: Record<string, unknown>) {
  const {text, data, isError} = callTool(registry, name, args)
  return {
    content: [{type: 'text' as const, text: text || JSON.stringify(data, null, 2)}],
    structuredContent: (Array.isArray(data) ? {entries: data} : data) as Record<string, unknown>,
    isError,
  }
}

export function callTool(registry: Registry, name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'duro_ds_lookup': {
      const result = runLookup(registry, String(args.name ?? ''), {
        part: typeof args.part === 'string' ? args.part : undefined,
        sourceOnly: args.sourceOnly === true,
      })
      return {text: result.text, data: result.data, isError: result.exitCode === 1}
    }
    case 'duro_ds_list': {
      const result = runList(registry, typeof args.kind === 'string' ? args.kind : undefined)
      return {text: result.text, data: result.data, isError: result.exitCode !== undefined}
    }
    case 'duro_ds_manifest':
      return {text: '', data: buildManifest(registry, cliVersion()), isError: false}
    case 'duro_ds_mockup_check': {
      const file = typeof args.file === 'string' ? args.file : 'artboard.dc.html'
      const findings = checkArtboard(registry, file, String(args.html ?? ''))
      const text =
        findings.length === 0
          ? `${file}: speaks tokens and names its components`
          : findings.map((f) => `${f.file}:${f.line} ${f.rule}: ${f.message}`).join('\n')
      return {text, data: {ok: findings.length === 0, findings}, isError: false}
    }
    case 'duro_ds_mockup_canvas': {
      const artboards = (Array.isArray(args.artboards) ? args.artboards : [])
        .filter((a): a is {file: unknown; html: unknown} => typeof a === 'object' && a !== null)
        .map((a) => ({file: String(a.file ?? 'artboard.dc.html'), html: String(a.html ?? '')}))
      if (artboards.length === 0) {
        return {text: 'give at least one artboard', data: {ok: false}, isError: true}
      }
      const title = typeof args.title === 'string' ? args.title : undefined
      const {html, findings} = buildCanvas(registry, artboards, {title})
      const text =
        html ?? findings.map((f) => `${f.file}:${f.line} ${f.rule}: ${f.message}`).join('\n')
      return {text, data: {ok: html !== null, html, findings}, isError: false}
    }
    default:
      throw new Error(`unknown tool ${name}`)
  }
}

export function listResources(registry: Registry): {uri: string; name: string; mimeType: string}[] {
  return [
    ...Object.keys(registry.components).map((name) => ({
      uri: `duro://component/${encodeURIComponent(name)}`,
      name: `${name} docs`,
      mimeType: 'text/plain',
    })),
    ...Object.keys(registry.recipes).map((name) => ({
      uri: `duro://recipe/${name}`,
      name: `${name} recipe`,
      mimeType: 'text/plain',
    })),
    ...guideNames(registry).map((name) => ({
      uri: `duro://guide/${name.slice('guide:'.length)}`,
      name: `${name} guide`,
      mimeType: 'text/markdown',
    })),
  ]
}

export function readResource(
  registry: Registry,
  uri: string,
): {contents: {uri: string; mimeType: string; text: string}[]} {
  const componentMatch = /^duro:\/\/component\/(.+)$/.exec(uri)
  const recipeMatch = /^duro:\/\/recipe\/(.+)$/.exec(uri)
  const guideMatch = /^duro:\/\/guide\/(.+)$/.exec(uri)
  let text: string | null = null
  if (guideMatch) {
    const guide = lookupGuide(registry, `guide:${guideMatch[1]}`)
    if (guide.ok) text = guide.content
  } else if (componentMatch) {
    const key = decodeURIComponent(componentMatch[1])
    const entry = registry.components[key]
    if (entry) text = renderComponent(registry, key, entry)
  } else if (recipeMatch) {
    const entry = registry.recipes[recipeMatch[1]]
    if (entry) text = renderRecipe(entry)
  }
  if (text === null) throw new Error(`unknown resource ${uri}`)
  return {contents: [{uri, mimeType: 'text/plain', text}]}
}

export async function runMcp(registry: Registry): Promise<void> {
  let sdkServer, sdkStdio, sdkTypes
  try {
    sdkServer = await import('@modelcontextprotocol/sdk/server/index.js')
    sdkStdio = await import('@modelcontextprotocol/sdk/server/stdio.js')
    sdkTypes = await import('@modelcontextprotocol/sdk/types.js')
  } catch {
    process.stderr.write(INSTALL_HINT + '\n')
    process.exit(2)
  }

  const server = new sdkServer.Server(
    {name: 'duro', version: cliVersion()},
    {capabilities: {tools: {}, resources: {}, prompts: {}}},
  )

  server.setRequestHandler(sdkTypes.ListToolsRequestSchema, () => ({
    tools: toolDefinitions(registry),
  }))

  server.setRequestHandler(sdkTypes.CallToolRequestSchema, (request) =>
    toolResponse(
      registry,
      request.params.name,
      (request.params.arguments ?? {}) as Record<string, unknown>,
    ),
  )

  server.setRequestHandler(sdkTypes.ListResourcesRequestSchema, () => ({
    resources: listResources(registry),
  }))

  server.setRequestHandler(sdkTypes.ReadResourceRequestSchema, (request) =>
    readResource(registry, request.params.uri),
  )

  server.setRequestHandler(sdkTypes.ListPromptsRequestSchema, () => ({
    prompts: [
      {
        name: 'duro/build-ui',
        description: 'Prime a session with the Duro critical rules and component index',
      },
    ],
  }))

  server.setRequestHandler(sdkTypes.GetPromptRequestSchema, (request) => {
    if (request.params.name !== 'duro/build-ui') {
      throw new Error(`unknown prompt ${request.params.name}`)
    }
    const componentIndex = Object.entries(registry.components)
      .map(([key, entry]) => `${key}: ${entry.meta?.description ?? entry.kind}`)
      .join('\n')
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are building UI with the Duro design system. Follow these rules:\n\n${registry.rules.critical}\n\nAvailable components:\n${componentIndex}\n\nQuery details with the duro_ds_lookup tool.`,
          },
        },
      ],
    }
  })

  const transport = new sdkStdio.StdioServerTransport()
  await server.connect(transport)
}
