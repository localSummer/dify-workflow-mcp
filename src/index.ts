import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js'
import { DifyClient } from './dify-client.js'
import {
  BaseUserInputForm,
  DifyParameters,
  MCPTool,
  MCPToolInputSchema,
  NumberUserInputForm,
  ParagraphUserInputForm,
  SelectUserInputForm,
  TextUserInputForm,
  UserInputControlType
} from './types.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration
const config = loadConfig(process.env.CONFIG_PATH || path.resolve(__dirname, '../config.yaml'))

// Create server instance
const server = new Server(
  {
    name: 'dify-workflow-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

// cache dify parameters
const difyParametersMap = new Map<string, DifyParameters>()
// cache name app sks
const appSkMap = new Map<string, string>()
// Initialize Dify clients
const difyClients = new Map<string, DifyClient>()
for (const appSk of config.dify_app_sks) {
  const client = new DifyClient(config.dify_base_url, appSk)
  difyClients.set(appSk, client)
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: MCPTool[] = []

  let index = 0

  for (const client of difyClients.values()) {
    try {
      const [appInfo, parameters] = await Promise.all([client.getAppInfo(), client.getParameters()])

      const inputSchema: MCPToolInputSchema = convertDifyParametersToJsonSchema(parameters)

      // Cache Dify parameters
      difyParametersMap.set(appInfo.name, parameters)

      // Cache app sk
      appSkMap.set(appInfo.name, config.dify_app_sks[index++])

      tools.push({
        name: appInfo.name,
        description: appInfo.description,
        inputSchema
      })
    } catch (error) {
      console.error('Failed to load tool:', error)
    }
  }

  return { tools }
})

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    // Find the corresponding Dify client
    const appSk = appSkMap.get(name)
    if (!appSk) {
      throw new Error('Unsupported tool')
    }
    const client = difyClients.get(appSk)
    if (!client) {
      throw new Error('No Dify client available')
    }

    const difyParameters = difyParametersMap.get(name)
    if (!difyParameters) {
      throw new Error('No Dify parameters available')
    }

    // Validate input parameters
    const validatedArgs = await validateInputParameters(args, difyParameters)

    // Execute the workflow
    const result = await client.runWorkflow(validatedArgs)

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid arguments: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
    }
    throw error
  }
})

// Validate input parameters
const validateInputParameters = (args: any, difyParameters: DifyParameters) => {
  const schema = z.object(
    Object.fromEntries(
      difyParameters.user_input_form.map((form) => {
        if (isParagraphInput(form)) {
          const { required, label, variable } = form[UserInputControlType.ParagraphInput]
          const currentSchema = required
            ? z.string({
                message: `${label} is required!`
              })
            : z.optional(z.string())
          return [variable, currentSchema]
        }

        if (isTextInput(form)) {
          const { required, label, variable } = form[UserInputControlType.TextInput]
          const currentSchema = required
            ? z.string({
                message: `${label} is required!`
              })
            : z.optional(z.string())
          return [variable, currentSchema]
        }

        if (isSelectInput(form)) {
          const { required, options, variable } = form[UserInputControlType.SelectInput]
          const currentSchema = required
            ? z.enum(options as [string, ...string[]])
            : z.optional(z.enum(options as [string, ...string[]]))
          return [variable, currentSchema]
        }

        if (isNumberInput(form)) {
          const { required, label, variable } = form[UserInputControlType.NumberInput]
          const currentSchema = required
            ? z.number({
                message: `${label} is required!`
              })
            : z.optional(z.number())
          return [variable, currentSchema]
        }

        throw new Error(`Invalid difyParameters`)
      })
    )
  )
  return schema.parse(args)
}

/**
 * Convert Dify parameters to JSON Schema
 */
const convertDifyParametersToJsonSchema = (parameters: DifyParameters): MCPToolInputSchema => {
  const inputSchema: MCPToolInputSchema = {
    type: 'object',
    properties: {},
    required: []
  }
  for (const input of parameters.user_input_form) {
    // 处理 UserInputControlType.TextInput
    if (isTextInput(input)) {
      inputSchema.properties[input[UserInputControlType.TextInput].variable] = {
        type: 'string'
      }
    }

    // 处理 UserInputControlType.ParagraphInput
    if (isParagraphInput(input)) {
      inputSchema.properties[input[UserInputControlType.ParagraphInput].variable] = {
        type: 'string'
      }
    }

    // 处理 UserInputControlType.SelectInput
    if (isSelectInput(input)) {
      inputSchema.properties[input[UserInputControlType.SelectInput].variable] = {
        type: 'array',
        enum: input[UserInputControlType.SelectInput].options
      }
    }

    // 处理 UserInputControlType.NumberInput
    if (isNumberInput(input)) {
      inputSchema.properties[input[UserInputControlType.NumberInput].variable] = {
        type: 'number'
      }
    }
  }
  return inputSchema
}

const isTextInput = (input: BaseUserInputForm): input is TextUserInputForm => {
  return input['text'] !== undefined
}

const isParagraphInput = (input: BaseUserInputForm): input is ParagraphUserInputForm => {
  return input['paragraph'] !== undefined
}

const isSelectInput = (input: BaseUserInputForm): input is SelectUserInputForm => {
  return input['select'] !== undefined
}

const isNumberInput = (input: BaseUserInputForm): input is NumberUserInputForm => {
  return input['number'] !== undefined
}

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Dify MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
