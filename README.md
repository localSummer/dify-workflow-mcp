# Dify Workflows MCP 服务器 (TypeScript)

一个 Model Context Protocol (MCP) 服务器的 TypeScript 实现，将 Dify 工作流作为工具暴露出来。

## 特性

- 将 Dify 应用程序转换为 MCP 工具
- 支持从 Dify 工作流流式响应（待实现）
- 通过 YAML 配置文件进行配置
- 使用 TypeScript 编写，具有类型安全性

## 前提条件

- Node.js 18 或更高版本
- npm 8 或更高版本
- 访问 Dify API 和应用程序密钥

## 安装

1. 克隆仓库：

   ```bash
   git clone https://github.com/localSummer/dify-workflow-mcp
   cd dify-workflow-mcp
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 创建配置文件：
   ```yaml
   # config.yaml
   dify_base_url: 'https://api.dify.ai/v1'
   dify_app_sks:
     - 'your-dify-app-sk-1' # 替换为你的实际 Dify 应用程序密钥
     - 'your-dify-app-sk-2' # 替换为你的实际 Dify 应用程序密钥
   ```

## 使用方法

1. 构建项目：

   ```bash
   npm run build
   ```

2. 启动服务器：
   ```bash
   npm start
   ```

开发环境：

```bash
npm run dev
```

## 配置

服务器可以使用 YAML 文件进行配置。默认情况下，它会在项目根目录中查找 `config.yaml`。您可以使用 `CONFIG_PATH` 环境变量指定不同的路径。

### 配置选项

- `dify_base_url`: Dify API 的基本 URL
- `dify_app_sks`: Dify 应用程序密钥列表

## Cline/Roo Code配置
```json
"dify-workflow-mcp": {
   "command": "node",
   "args": [
      "path/dify-workflow-mcp/build/index.js"
   ],
   "env": {
      "CONFIG_PATH": "path/dify-workflow-mcp/config.yaml"
   },
   "disabled": false,
   "alwaysAllow": [],
   "timeout": 300
}
```

## 许可证

ISC
