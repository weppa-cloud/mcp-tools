# 🚀 Setup MCP Google Analytics - Guía del Equipo

## ⚡ Setup en 2 minutos

### 1. Abre el archivo de configuración

**Mac:**
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. Agrega esta configuración

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["@weppa-cloud/mcp-google-analytics"],
      "env": {
        "GOOGLE_ANALYTICS_CREDENTIALS": "/Users/TU_USUARIO/credentials/ga-credentials.json"
      }
    }
  }
}
```

### 3. Obtén las credenciales

**Opción A: Pídelas al equipo**
- Solicita el archivo `ga-credentials.json` en Slack
- Guárdalo en una carpeta segura
- Actualiza la ruta en el config

**Opción B: Crea las tuyas** (5 min)
1. Ve a https://console.cloud.google.com
2. Selecciona el proyecto de Weppa
3. Ve a "IAM y administración" > "Cuentas de servicio"
4. Crea nueva cuenta o descarga key existente
5. Guarda el JSON en tu computadora

### 4. Reinicia Claude Desktop

Cierra completamente y vuelve a abrir Claude Desktop.

### 5. ¡Listo! Prueba con:

```
Dame el growth pulse de hoy
```

## 🎯 Comandos Útiles

### Daily Check
```
"Growth pulse + alertas"
"¿Cuántos usuarios activos ahora?"
"Revenue de hoy vs ayer"
```

### Growth Hacking
```
"¿Dónde está mi mayor oportunidad de crecimiento?"
"Analiza mi funnel de conversión"
"¿Qué usuarios están en riesgo de churn?"
```

### Experimentos
```
"Status de mis A/B tests activos"
"¿Cuál experimento está ganando?"
"Lanza test de precio $X vs $Y"
```

## ❓ FAQ

### "No funciona el comando"
1. Verifica que reiniciaste Claude Desktop
2. Checa que la ruta del JSON sea correcta
3. Confirma que el archivo JSON existe

### "No tengo datos"
- Verifica que tienes acceso a la propiedad de GA
- Confirma el Property ID con el equipo
- Checa el rango de fechas

### "Error de permisos"
- Tu cuenta necesita permisos de Viewer en GA
- Pide acceso al admin de Analytics

## 🔧 Configuración Avanzada

### Múltiples propiedades
```json
{
  "mcpServers": {
    "ga-colombia": {
      "command": "npx",
      "args": ["@weppa-cloud/mcp-google-analytics"],
      "env": {
        "GA_PROPERTY_ID": "294486074",
        "GOOGLE_ANALYTICS_CREDENTIALS": "/path/to/colombia-creds.json"
      }
    },
    "ga-mexico": {
      "command": "npx",
      "args": ["@weppa-cloud/mcp-google-analytics"],
      "env": {
        "GA_PROPERTY_ID": "123456789",
        "GOOGLE_ANALYTICS_CREDENTIALS": "/path/to/mexico-creds.json"
      }
    }
  }
}
```

### Debug mode
```json
"env": {
  "GOOGLE_ANALYTICS_CREDENTIALS": "/path/to/creds.json",
  "DEBUG": "true"
}
```

## 📚 Recursos

- **Docs completos**: [CLAUDE.md](./packages/google-analytics/CLAUDE.md)
- **GitHub**: https://github.com/weppa-cloud/mcp-tools
- **NPM**: https://www.npmjs.com/package/@weppa-cloud/mcp-google-analytics
- **Soporte**: Slack #mcp-support

## 🎉 Tips Pro

1. **Usa aliases** para comandos frecuentes
2. **Combina queries** para insights más profundos
3. **Programa checks diarios** a la misma hora
4. **Comparte insights** en Slack con screenshots
5. **Experimenta** con diferentes métricas

---

¿Problemas? Escribe en Slack #mcp-support o abre un issue en GitHub.