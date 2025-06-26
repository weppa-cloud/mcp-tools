# MCP Google Analytics - Claude Code Integration

## Overview
Este proyecto implementa un servidor MCP (Model Context Protocol) para integrar Google Analytics con Claude Code, proporcionando herramientas avanzadas de growth hacking y análisis de datos.

## Quick Setup
```bash
# Build the project
npm run build

# Add MCP to Claude Code
claude mcp add google-analytics \
  -e GA_PROPERTY_ID=294486074 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json \
  -- node "/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/dist/index.js"

# Verify installation
claude mcp list
```

## Available Tools

### Basic Analytics
1. **get_realtime_data** - Datos en tiempo real
2. **get_report_data** - Reportes históricos
3. **get_audience_data** - Demografía y audiencias

### Growth Hacking Tools
4. **analyze_funnel** - Análisis de embudos de conversión
5. **analyze_cohorts** - Análisis de retención por cohortes
6. **get_user_segments** - Segmentación avanzada de usuarios
7. **analyze_conversion_paths** - Caminos hacia conversiones
8. **get_growth_metrics** - Métricas de crecimiento (growth rate, LTV, CAC)
9. **analyze_ab_test** - Análisis de tests A/B
10. **get_user_journey** - Journey detallado de usuarios
11. **identify_power_users** - Identificación de usuarios más valiosos

## Usage Examples

### Real-time Monitoring
```
Muéstrame cuántos usuarios activos tengo ahora mismo por país
```

### Growth Analysis
```
Calcula mi tasa de crecimiento de usuarios comparando con el mes anterior
```

### Funnel Optimization
```
Analiza mi funnel de conversión:
- Homepage (pagePath: /)
- Product View (eventName: view_item)  
- Add to Cart (eventName: add_to_cart)
- Purchase (eventName: purchase)
```

### User Segmentation
```
Segmenta mis usuarios por comportamiento y muéstrame:
- Sesiones promedio
- Duración de sesión
- Páginas por sesión
```

### Cohort Analysis
```
Muéstrame el análisis de cohortes semanales de retención del último mes
```

### Power Users
```
Identifica mis power users con más de 50 sesiones este mes y compáralos con usuarios promedio
```

### A/B Testing
```
Analiza los resultados del A/B test en la dimensión 'experimentVariant' con métricas de conversión
```

## Configuration

### Environment Variables
- `GA_PROPERTY_ID`: 294486074
- `GOOGLE_APPLICATION_CREDENTIALS`: /Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json

### Credentials Setup
1. Google Cloud Console: Crear proyecto y habilitar Google Analytics Data API
2. Crear cuenta de servicio y descargar JSON de credenciales
3. En Google Analytics: Agregar email de cuenta de servicio como Viewer
4. Configurar variables de entorno

## Development Commands

```bash
# Install dependencies
npm install

# Build project
npm run build

# Development mode
npm run dev

# Start server directly
npm start
```

## MCP Management

```bash
# List configured MCPs
claude mcp list

# Remove MCP
claude mcp remove google-analytics

# Add with different scope
claude mcp add google-analytics -s user [command]
claude mcp add google-analytics -s project [command]

# Check MCP status
/mcp
```

## Growth Metrics Available

### Core Metrics
- User Growth Rate
- Revenue Growth Rate  
- Retention Rate
- Churn Rate
- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- Activation Rate
- Viral Coefficient

### Segmentation Types
- **Behavior**: engagement, sessions, pages
- **Technology**: device, OS, browser
- **Acquisition**: source, medium, campaign
- **Demographic**: age, gender, location

## Troubleshooting

### Common Issues
1. **Permission denied**: Verificar que la cuenta de servicio tiene permisos en GA
2. **Property not found**: Confirmar GA_PROPERTY_ID correcto
3. **Credentials error**: Verificar ruta del archivo JSON
4. **MCP not loading**: Reiniciar Claude Code después de configurar

### Debug Commands
```bash
# Check if MCP is running
node "/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/dist/index.js"

# Verify credentials file exists
ls -la /Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json

# Check build output
ls -la dist/
```

## Architecture

```
Claude Code → MCP Server → Google Analytics Data API → Your GA Property
```

### Components
- **src/index.ts**: Main MCP server with tool handlers
- **src/auth.ts**: Google Analytics authentication
- **src/growth-tools.ts**: Schema definitions for growth tools
- **dist/**: Compiled JavaScript output

## Growth Hacking Workflows

### 1. Daily Health Check
```
Hazme un health check diario:
- Usuarios activos vs ayer
- Tasa de conversión
- Páginas con mayor drop-off
```

### 2. Weekly Growth Review
```
Análisis semanal:
- Crecimiento de usuarios (WoW)
- Retención de cohortes
- Top sources de crecimiento
- Experimentos activos
```

### 3. Monthly Deep Dive
```
Análisis mensual profundo:
- Análisis completo de funnel
- Segmentación de poder users
- LTV por cohorte
- Optimizaciones recomendadas
```

## Best Practices

1. **Usar fechas específicas** para análisis comparativos
2. **Segmentar por dimensiones relevantes** (source, device, etc.)
3. **Definir eventos de conversión claros** para funnels
4. **Comparar períodos similares** (mismo día de semana, etc.)
5. **Filtrar datos por umbrales** para eliminar ruido
6. **Combinar métricas** para insights más profundos

## Data Privacy & Security

- Credenciales almacenadas localmente
- Conexión directa a Google Analytics (sin intermediarios)
- Datos no persistidos en el MCP
- Respeto a políticas de retención de GA
- Solo acceso de lectura (Viewer permissions)

## Next Steps

1. **Alertas automáticas** para métricas críticas
2. **Integración con otras fuentes** (CRM, email, ads)
3. **Modelos predictivos** basados en datos históricos  
4. **Dashboards automatizados** para stakeholders
5. **Webhook support** para eventos en tiempo real