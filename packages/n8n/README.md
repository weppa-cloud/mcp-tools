# @weppa-cloud/mcp-n8n

> **Fork of [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) by Romuald Czlonkowski**
> 
> This package is automatically synced with upstream to ensure you always have the latest features.
> All credit goes to the original author: [AI Advisors](https://www.aiadvisors.pl/en)

## Installation

```bash
npm install -g @weppa-cloud/mcp-n8n
```

Or use directly with npx:

```bash
npx @weppa-cloud/mcp-n8n
```

## Configuration for Claude Desktop

```json
{
  "mcpServers": {
    "n8n-automation": {
      "command": "npx",
      "args": ["@weppa-cloud/mcp-n8n@latest"]
    }
  }
}
```

## Why use this fork?

1. **Always up-to-date**: Automatically synced weekly with the original repository
2. **NPM namespace**: Available under @weppa-cloud for consistency with other MCP tools
3. **Growth team focus**: Part of the @weppa-cloud MCP ecosystem for marketing teams
4. **Maintained**: Actively monitored and updated

## Features

- Access to 525+ n8n nodes (263 with AI capabilities)
- Search and discover workflow nodes
- Get node properties and configurations
- Validate node configurations
- Generate task templates
- Dependency analysis
- Average response time: ~12ms

## Available Tools

- `search_nodes` - Search for nodes by functionality
- `get_node_properties` - Get node properties and configuration
- `validate_workflow` - Validate workflow configurations
- `generate_template` - Create workflow templates
- `analyze_dependencies` - Analyze node dependencies

## Attribution

This is a fork of the excellent [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) project by Romuald Czlonkowski.
Please visit the original repository for detailed documentation and to support the original author.

## License

MIT License - See LICENSE file for details