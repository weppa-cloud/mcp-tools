# Instrucciones de Configuración Final

## Tu MCP de Google Analytics está listo! 🎉

### Paso 1: Verificar que todo está compilado
```bash
cd "/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics"
npm run build
```

### Paso 2: Configurar Claude Desktop

1. Abre el archivo de configuración de Claude Desktop:
   ```bash
   open ~/Library/Application\ Support/Claude/
   ```

2. Si no existe `claude_desktop_config.json`, créalo

3. Copia el contenido del archivo `claude_config.json` que está en este directorio

4. Si ya tienes otros MCPs configurados, agrega solo la sección "google-analytics" dentro de "mcpServers"

### Paso 3: Reiniciar Claude Desktop

1. Cierra completamente Claude Desktop (Cmd+Q)
2. Vuelve a abrirlo

### Paso 4: Verificar que funciona

En Claude, prueba estos comandos:

1. **Datos en tiempo real:**
   ```
   Muéstrame cuántos usuarios activos tengo ahora mismo
   ```

2. **Análisis básico:**
   ```
   Dame las sesiones y usuarios de los últimos 7 días
   ```

3. **Análisis de Growth:**
   ```
   Analiza mi funnel de conversión: 
   - Homepage (pagePath: /)
   - Product View (eventName: view_item)
   - Add to Cart (eventName: add_to_cart)
   - Purchase (eventName: purchase)
   ```

### Solución de problemas

Si no funciona:

1. **Verifica las rutas:**
   - Property ID: 294486074
   - Credenciales: /Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json
   - MCP compilado: /Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/dist/index.js

2. **Verifica permisos en Google Analytics:**
   - El email de la cuenta de servicio debe tener permisos de "Visualizador"
   - El email está en el archivo JSON como "client_email"

3. **Revisa los logs:**
   - En Claude Desktop, ve a View → Developer → Toggle Developer Tools
   - Busca errores relacionados con "google-analytics"

### Herramientas disponibles

Ahora puedes usar estas 11 herramientas:

1. `get_realtime_data` - Datos en tiempo real
2. `get_report_data` - Reportes históricos
3. `get_audience_data` - Demografía
4. `analyze_funnel` - Análisis de embudos
5. `analyze_cohorts` - Retención por cohortes
6. `get_user_segments` - Segmentación avanzada
7. `analyze_conversion_paths` - Caminos de conversión
8. `get_growth_metrics` - Métricas de crecimiento
9. `analyze_ab_test` - Tests A/B
10. `get_user_journey` - Journey de usuarios
11. `identify_power_users` - Power users

¡Tu MCP está listo para hacer Growth Hacking con datos reales!