# Guía para obtener credenciales de Google Analytics

## 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba)
3. Clic en "Nuevo Proyecto"
4. Nombra tu proyecto (ej: "mcp-analytics")
5. Clic en "Crear"

## 2. Habilitar la API de Google Analytics

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Analytics Data API"
3. Haz clic en ella y luego en "HABILITAR"

## 3. Crear cuenta de servicio

1. Ve a "APIs y servicios" > "Credenciales"
2. Clic en "+ CREAR CREDENCIALES" > "Cuenta de servicio"
3. Completa:
   - Nombre: `mcp-analytics-service`
   - ID: se genera automáticamente
   - Descripción: "Cuenta para MCP Google Analytics"
4. Clic en "CREAR Y CONTINUAR"
5. En "Rol", selecciona "Viewer" (o puedes omitir este paso)
6. Clic en "CONTINUAR" y luego "LISTO"

## 4. Generar clave JSON

1. En la lista de cuentas de servicio, encuentra la que acabas de crear
2. Haz clic en ella
3. Ve a la pestaña "CLAVES"
4. Clic en "AGREGAR CLAVE" > "Crear clave nueva"
5. Selecciona "JSON"
6. Clic en "CREAR"
7. Se descargará automáticamente un archivo JSON - **¡GUÁRDALO DE FORMA SEGURA!**

## 5. Obtener el ID de propiedad de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Selecciona tu cuenta y propiedad
3. Ve a "Administrar" (ícono de engranaje)
4. En la columna "Propiedad", haz clic en "Detalles de la propiedad"
5. Copia el "ID de propiedad" (es un número como 123456789)

## 6. Dar permisos en Google Analytics

1. En Google Analytics, ve a "Administrar"
2. En la columna "Cuenta" o "Propiedad", haz clic en "Administración de acceso"
3. Clic en el botón "+" > "Agregar usuarios"
4. Pega el email de la cuenta de servicio (está en el archivo JSON como "client_email")
   - Formato: `nombre@proyecto-id.iam.gserviceaccount.com`
5. Asigna el rol "Visualizador"
6. Clic en "Agregar"

## 7. Configurar las variables de entorno

1. Copia el archivo JSON descargado a una ubicación segura
2. Crea un archivo `.env` en el directorio del proyecto:

```bash
GA_PROPERTY_ID=123456789  # Tu ID de propiedad (sin 'properties/')
GOOGLE_APPLICATION_CREDENTIALS=/ruta/completa/al/archivo/credentials.json
```

## 8. Configurar en Claude Desktop

Edita `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "node",
      "args": ["/ruta/completa/a/mcp-google-analytics/dist/index.js"],
      "env": {
        "GA_PROPERTY_ID": "123456789",
        "GOOGLE_APPLICATION_CREDENTIALS": "/ruta/completa/a/credentials.json"
      }
    }
  }
}
```

## Verificación

Para verificar que todo funciona:

1. Compila el proyecto: `npm run build`
2. Prueba localmente: `npm start`
3. Reinicia Claude Desktop
4. En Claude, deberías poder usar comandos como:
   - "Muéstrame los usuarios activos en tiempo real"
   - "Dame las sesiones de los últimos 7 días"

## Solución de problemas

### Error: "Permission denied"
- Verifica que agregaste el email de la cuenta de servicio en Google Analytics
- Espera unos minutos para que los permisos se propaguen

### Error: "API not enabled"
- Asegúrate de haber habilitado "Google Analytics Data API" en Google Cloud Console

### Error: "Invalid property ID"
- Usa solo el número (ej: 123456789), no incluyas "properties/"
- Verifica que es el ID correcto en Google Analytics

### No aparece en Claude
- Reinicia Claude Desktop completamente
- Verifica que las rutas en la configuración son absolutas, no relativas
- Revisa los logs de Claude para errores