# MCP Tools

Herramientas MCP para growth y analytics del equipo.

## Para el equipo

### Configuración rápida

1. Agrega esto a tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["@weppa-cloud/mcp-google-analytics"],
      "env": {
        "GOOGLE_ANALYTICS_CREDENTIALS": "/ruta/a/tu/credentials.json"
      }
    }
  }
}
```

2. Reinicia Claude Desktop

¡Listo! Claude ahora puede acceder a Google Analytics.

## Herramientas disponibles

### 📊 Google Analytics MCP
- Obtener datos de Analytics
- Análisis de tráfico y conversiones
- Reportes personalizados
- Integración con Google Search Console

## Para desarrolladores

### Estructura del proyecto

```
mcp-tools/
├── packages/
│   ├── google-analytics/    # MCP para Google Analytics
│   └── (más herramientas próximamente)
└── package.json            # Configuración del workspace
```

### Desarrollo local

```bash
# Clonar el repo
git clone https://github.com/weppa-cloud/mcp-tools.git
cd mcp-tools

# Instalar dependencias
npm install

# Construir todos los paquetes
npm run build

# Desarrollar un paquete específico
cd packages/google-analytics
npm run dev
```

### Publicar cambios

```bash
# Construir todo
npm run build

# Publicar todos los paquetes
npm run publish-all
```

## Agregar nuevas herramientas

1. Crea una carpeta en `packages/`
2. Agrega tu MCP server
3. Actualiza este README
4. ¡Publica!

## Soporte

¿Preguntas? Contacta al equipo de Growth.