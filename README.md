# Dify MCP Server (TypeScript)
[![smithery badge](https://smithery.ai/badge/@faiz-gear/dify-mcp-server-ts)](https://smithery.ai/server/@faiz-gear/dify-mcp-server-ts)

A TypeScript implementation of a Model Context Protocol (MCP) server that exposes Dify workflows as tools.

## Features

- Converts Dify applications into MCP tools
- Supports streaming responses from Dify workflows
- Configurable via YAML configuration file
- Written in TypeScript for type safety

## Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Access to Dify API and application secret keys

## Installation

### Installing via Smithery

To install Dify MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@faiz-gear/dify-mcp-server-ts):

```bash
npx -y @smithery/cli install @faiz-gear/dify-mcp-server-ts --client claude
```

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd dify-mcp-server-ts
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a configuration file:
   ```yaml
   # config.yaml
   dify_base_url: 'https://api.dify.ai/v1'
   dify_app_sks:
     - 'your-dify-app-sk-1' # Replace with your actual Dify app secret key
     - 'your-dify-app-sk-2' # Replace with your actual Dify app secret key
   ```

## Usage

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

For development:

```bash
npm run dev
```

## Configuration

The server can be configured using a YAML file. By default, it looks for `config.yaml` in the project root. You can specify a different path using the `CONFIG_PATH` environment variable.

### Configuration Options

- `dify_base_url`: The base URL for the Dify API
- `dify_app_sks`: A list of Dify application secret keys

## License

ISC
