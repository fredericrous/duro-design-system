import type {Registry} from '../registry-types.js'
import {buildManifest} from '../manifest.js'
import {runLookup} from './lookup.js'
import {runList} from './list.js'
import {cliVersion} from './manifest.js'
import {renderComponent, renderRecipe} from '../format.js'

const INSTALL_HINT = `duro mcp needs @modelcontextprotocol/sdk (an optional peer).
  npm i -D @modelcontextprotocol/sdk
or run it without installing:
  npx -y -p @duro-app/cli -p @modelcontextprotocol/sdk duro mcp`

/** The three MCP tools, JSON Schemas hand-written (no zod dependency). */
export function toolDefinitions(registry: Registry) {
  return [
    {
      name: 'duro_lookup',
      description:
        'Docs for anything in the Duro design system by name: a component (props, usage, example), a recipe (runnable source), a token group, "icons", or "rules". Free text falls back to a ranked search over usage metadata — pass what you need, e.g. "tags that wrap".',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description:
              'Component/recipe/token-group name, "icons", "rules", or free text to search',
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
      name: 'duro_list',
      description: `One-line index of everything documented (${Object.keys(registry.components).length} components, ${Object.keys(registry.recipes).length} recipes, token groups).`,
      inputSchema: {
        type: 'object',
        properties: {
          kind: {type: 'string', enum: ['components', 'recipes', 'tokens']},
        },
      },
    },
    {
      name: 'duro_manifest',
      description: 'The duro command spec plus all valid lookup names.',
      inputSchema: {type: 'object', properties: {}},
    },
  ]
}

export function callTool(registry: Registry, name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'duro_lookup': {
      const result = runLookup(registry, String(args.name ?? ''), {
        part: typeof args.part === 'string' ? args.part : undefined,
        sourceOnly: args.sourceOnly === true,
      })
      return {text: result.text, data: result.data, isError: result.exitCode === 1}
    }
    case 'duro_list': {
      const result = runList(registry, typeof args.kind === 'string' ? args.kind : undefined)
      return {text: result.text, data: result.data, isError: result.exitCode !== undefined}
    }
    case 'duro_manifest':
      return {text: '', data: buildManifest(registry, cliVersion()), isError: false}
    default:
      throw new Error(`unknown tool ${name}`)
  }
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

  server.setRequestHandler(sdkTypes.CallToolRequestSchema, (request) => {
    const {text, data, isError} = callTool(
      registry,
      request.params.name,
      (request.params.arguments ?? {}) as Record<string, unknown>,
    )
    return {
      content: [{type: 'text', text: text || JSON.stringify(data, null, 2)}],
      structuredContent: data,
      isError,
    }
  })

  server.setRequestHandler(sdkTypes.ListResourcesRequestSchema, () => ({
    resources: [
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
    ],
  }))

  server.setRequestHandler(sdkTypes.ReadResourceRequestSchema, (request) => {
    const uri = request.params.uri
    const componentMatch = /^duro:\/\/component\/(.+)$/.exec(uri)
    const recipeMatch = /^duro:\/\/recipe\/(.+)$/.exec(uri)
    let text: string | null = null
    if (componentMatch) {
      const key = decodeURIComponent(componentMatch[1])
      const entry = registry.components[key]
      if (entry) text = renderComponent(registry, key, entry)
    } else if (recipeMatch) {
      const entry = registry.recipes[recipeMatch[1]]
      if (entry) text = renderRecipe(entry)
    }
    if (text === null) throw new Error(`unknown resource ${uri}`)
    return {contents: [{uri, mimeType: 'text/plain', text}]}
  })

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
            text: `You are building UI with the Duro design system. Follow these rules:\n\n${registry.rules.critical}\n\nAvailable components:\n${componentIndex}\n\nQuery details with the duro_lookup tool.`,
          },
        },
      ],
    }
  })

  const transport = new sdkStdio.StdioServerTransport()
  await server.connect(transport)
}
