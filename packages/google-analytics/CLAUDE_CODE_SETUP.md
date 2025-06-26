# Configurar MCP Google Analytics con Claude Code

## Método 1: Usando comandos CLI (Recomendado)

### Paso 1: Agregar el MCP server
```bash
claude mcp add google-analytics \
  -e GA_PROPERTY_ID=294486074 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json \
  -- node "/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/dist/index.js"
```

### Paso 2: Verificar que se agregó correctamente
```bash
claude mcp list
```

### Paso 3: Usar en Claude Code
Ahora puedes usar comandos como:
- "Muéstrame los usuarios activos en tiempo real"
- "Analiza mi funnel de conversión de los últimos 30 días"
- "Identifica mis power users con más de 10 sesiones"

## Método 2: Usando JSON (Alternativo)

```bash
claude mcp add-json google-analytics '{
  "command": "node",
  "args": ["/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/dist/index.js"],
  "env": {
    "GA_PROPERTY_ID": "294486074",
    "GOOGLE_APPLICATION_CREDENTIALS": "/Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json"
  }
}'
```

## Comandos útiles de gestión

```bash
# Listar MCPs configurados
claude mcp list

# Remover el MCP
claude mcp remove google-analytics

# Verificar conexión
/mcp
```

## Diferencias con Claude Desktop

| Claude Desktop | Claude Code |
|---------------|-------------|
| Manual JSON editing | CLI commands |
| `claude_desktop_config.json` | `~/.claude.json` |
| Solo stdio | stdio, SSE, HTTP |
| Un archivo global | User/project/local scopes |

## Ventajas de usar con Claude Code

1. **Configuración más fácil**: Un solo comando vs editar JSON
2. **Gestión**: Comandos para add/remove/list
3. **Scopes**: Configurar para usuario, proyecto o local
4. **Verificación**: Comando `/mcp` para verificar conexión

¡Ahora sí podemos usar el MCP juntos en esta sesión!