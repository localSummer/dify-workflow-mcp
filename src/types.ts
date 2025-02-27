import { ToolSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

// Configuration types
export interface DifyConfig {
  dify_base_url: string
  dify_app_sks: string[]
}

// Dify API response types
export interface DifyAppInfo {
  name: string
  description: string
  tags: string[]
}

export interface DifyParameterField {
  label: string
  variable: string
  required: boolean
  default: string
}

export interface DifyFileUploadConfig {
  enabled: boolean
  number_limits: number
  detail: string
  transfer_methods: string[]
}

export interface DifySystemParameters {
  file_size_limit: number
  image_file_size_limit: number
  audio_file_size_limit: number
  video_file_size_limit: number
}

interface BaseInputControl {
  label: string
  variable: string
  required: boolean
  default?: string
}

export enum UserInputControlType {
  TextInput = 'text-input',
  ParagraphInput = 'paragraph',
  SelectInput = 'select',
  NumberInput = 'number'
}

export abstract class BaseUserInputForm {
  [key: string]: BaseInputControl
}

export interface TextUserInputForm extends BaseUserInputForm {
  [UserInputControlType.TextInput]: BaseInputControl
}

export interface ParagraphUserInputForm extends BaseUserInputForm {
  [UserInputControlType.ParagraphInput]: BaseInputControl
}

export interface SelectUserInputForm extends BaseUserInputForm {
  [UserInputControlType.SelectInput]: BaseInputControl & {
    options: string[]
  }
}

export interface NumberUserInputForm extends BaseUserInputForm {
  [UserInputControlType.NumberInput]: BaseInputControl
}

export type UserInputForm = TextUserInputForm | ParagraphUserInputForm | SelectUserInputForm | NumberUserInputForm

export interface DifyParameters {
  user_input_form: UserInputForm[]
  file_upload: {
    image: DifyFileUploadConfig
  }
  system_parameters: DifySystemParameters
}

// MCP Tool types
export type MCPToolInputSchema = Required<z.infer<typeof ToolSchema>['inputSchema']>

export interface MCPTool {
  name: string
  description: string
  inputSchema: MCPToolInputSchema
}

// Dify API response types
export interface DifyWorkflowResponse {
  answer: string
  task_id: string
}
