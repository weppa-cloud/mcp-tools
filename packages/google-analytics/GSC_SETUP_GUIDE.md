# Guía de Configuración: Google Search Console MCP Server

Esta guía te ayudará a configurar el servidor MCP de Google Search Console para usar con Claude Desktop y analizar el rendimiento SEO de tu sitio web.

## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Google Cloud](#configuración-de-google-cloud)
3. [Instalación del Servidor](#instalación-del-servidor)
4. [Configuración en Claude Desktop](#configuración-en-claude-desktop)
5. [Verificación de la Instalación](#verificación-de-la-instalación)
6. [Uso del Servidor](#uso-del-servidor)
7. [Solución de Problemas](#solución-de-problemas)

## Requisitos Previos

- Node.js 18 o superior instalado
- Claude Desktop instalado
- Una cuenta de Google con acceso a Google Search Console
- Un sitio web verificado en Google Search Console

## Configuración de Google Cloud

### Paso 1: Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (parte superior)
3. Haz clic en "Nuevo Proyecto"
4. Nombre del proyecto: `mcp-search-console` (o el nombre que prefieras)
5. Haz clic en "Crear"

### Paso 2: Habilitar la API de Search Console

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca **"Google Search Console API"**
3. Haz clic en el resultado y luego en **"Habilitar"**
4. Espera a que se habilite la API (puede tomar unos segundos)

### Paso 3: Crear una Cuenta de Servicio

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Haz clic en **"+ Crear credenciales"** > **"Cuenta de servicio"**
3. Completa los detalles:
   - Nombre: `mcp-gsc-service`
   - ID de cuenta de servicio: (se generará automáticamente)
   - Descripción: `Cuenta de servicio para MCP Google Search Console`
4. Haz clic en **"Crear y continuar"**
5. En "Rol", puedes omitir esta sección (haz clic en "Continuar")
6. En "Acceso de usuarios", haz clic en **"Listo"**

### Paso 4: Crear y Descargar la Clave JSON

1. En la lista de cuentas de servicio, encuentra la que acabas de crear
2. Haz clic en el email de la cuenta de servicio
3. Ve a la pestaña **"Claves"**
4. Haz clic en **"Agregar clave"** > **"Crear clave nueva"**
5. Selecciona **"JSON"** como tipo de clave
6. Haz clic en **"Crear"**
7. El archivo se descargará automáticamente. **¡Guárdalo en un lugar seguro!**

### Paso 5: Otorgar Acceso en Google Search Console

1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Selecciona tu propiedad (sitio web)
3. En el menú lateral, ve a **"Configuración"**
4. Haz clic en **"Usuarios y permisos"**
5. Haz clic en **"Agregar usuario"**
6. Email: Copia el email de la cuenta de servicio (formato: `nombre@proyecto.iam.gserviceaccount.com`)
   - Lo encuentras en Google Cloud Console > Credenciales > Tu cuenta de servicio
7. Permisos: Selecciona **"Propietario"** (o "Completo" según lo que necesites)
8. Haz clic en **"Agregar"**

## Instalación del Servidor

### Opción 1: Instalación Automática (Recomendada)

```bash
npx -y @smithery/cli install mcp-server-gsc --client claude
```

### Opción 2: Instalación Manual

1. Navega al directorio del servidor:
```bash
cd "/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/mcp-server-gsc"
```

2. Instala las dependencias (ya lo hicimos):
```bash
npm install
```

## Configuración en Claude Desktop

1. Abre Claude Desktop
2. Ve a **Configuración** (Settings)
3. Busca la sección **"Developer"** o **"MCP Servers"**
4. Edita el archivo de configuración agregando:

```json
{
  "mcpServers": {
    "gsc": {
      "command": "node",
      "args": ["/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/mcp-server-gsc/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/ruta/a/tu/archivo/credenciales.json"
      }
    }
  }
}
```

**Importante**: Reemplaza `/ruta/a/tu/archivo/credenciales.json` con la ruta real donde guardaste el archivo JSON de credenciales.

### Ejemplo de Configuración Completa

Si ya tienes otros servidores MCP configurados:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "node",
      "args": ["/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/Users/yeisongomez/Documents/credentials/ga4-credentials.json"
      }
    },
    "gsc": {
      "command": "node",
      "args": ["/Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics/mcp-server-gsc/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/Users/yeisongomez/Documents/credentials/gsc-credentials.json"
      }
    }
  }
}
```

5. Guarda los cambios
6. Reinicia Claude Desktop completamente

## Verificación de la Instalación

Después de reiniciar Claude Desktop, verifica que el servidor esté funcionando:

1. En Claude, escribe:
```
¿Qué herramientas de Google Search Console tengo disponibles?
```

2. Claude debería mostrar las siguientes herramientas:
   - `list_sites`: Listar todos los sitios en Search Console
   - `search_analytics`: Obtener datos de rendimiento de búsqueda
   - `index_inspect`: Inspeccionar el estado de indexación de una URL
   - `list_sitemaps`: Listar sitemaps de un sitio
   - `get_sitemap`: Obtener información de un sitemap específico
   - `submit_sitemap`: Enviar un nuevo sitemap

## Uso del Servidor

### Ejemplos de Comandos

1. **Listar todos tus sitios verificados:**
```
Lista todos mis sitios en Google Search Console
```

2. **Analizar el rendimiento de búsqueda:**
```
Analiza el rendimiento de búsqueda de https://ejemplo.com desde el 1 de enero hasta el 31 de enero de 2024
```

3. **Verificar palabras clave principales:**
```
Muéstrame las consultas de búsqueda más populares para mi sitio con sus métricas de rendimiento
```

4. **Inspeccionar indexación de una URL:**
```
Verifica si la URL https://ejemplo.com/blog/articulo está indexada correctamente
```

### Parámetros de search_analytics

- **siteUrl** (requerido): URL del sitio (ej: `https://ejemplo.com` o `sc-domain:ejemplo.com`)
- **startDate** (requerido): Fecha de inicio (formato: YYYY-MM-DD)
- **endDate** (requerido): Fecha de fin (formato: YYYY-MM-DD)
- **dimensions** (opcional): Lista separada por comas:
  - `query`: Términos de búsqueda
  - `page`: URLs específicas
  - `country`: País de origen
  - `device`: Tipo de dispositivo (desktop, mobile, tablet)
  - `searchAppearance`: Tipo de resultado
- **type** (opcional): Tipo de búsqueda (`web`, `image`, `video`, `news`)
- **rowLimit** (opcional): Número máximo de filas (por defecto: 1000)

## Análisis Disponibles

Con este servidor puedes analizar:

1. **Rendimiento de Búsqueda**
   - Impresiones totales
   - Clics totales
   - CTR (Click-through rate)
   - Posición promedio

2. **Palabras Clave**
   - Consultas principales
   - Rendimiento por palabra clave
   - Oportunidades de mejora

3. **Páginas**
   - Páginas con mejor rendimiento
   - Páginas con problemas de rendimiento
   - Análisis de CTR por página

4. **Indexación**
   - Estado de indexación de URLs
   - Problemas de rastreo
   - Cobertura del sitio

5. **Sitemaps**
   - Estado de sitemaps enviados
   - Errores en sitemaps
   - URLs descubiertas

## Solución de Problemas

### Error: "GOOGLE_APPLICATION_CREDENTIALS environment variable is required"
- Verifica que la ruta al archivo JSON en la configuración sea correcta
- Asegúrate de que el archivo JSON existe en esa ubicación

### Error: "Permission denied"
- Verifica que agregaste el email de la cuenta de servicio en Search Console
- Asegúrate de que tiene permisos de "Propietario" o "Completo"

### Error: "API not enabled"
- Ve a Google Cloud Console y verifica que la API de Search Console está habilitada
- Puede tomar unos minutos después de habilitarla para que funcione

### El servidor no aparece en Claude
1. Verifica que la configuración JSON sea válida (sin comas extras, comillas correctas)
2. Asegúrate de reiniciar Claude Desktop completamente
3. Revisa que la ruta al archivo `index.js` sea correcta

### Error: "Site not found"
- Verifica que el formato de la URL sea correcto:
  - Para dominios: `https://ejemplo.com`
  - Para propiedades de dominio: `sc-domain:ejemplo.com`
- Asegúrate de que el sitio esté verificado en Search Console

## Notas Adicionales

- Los datos de Search Console pueden tener un retraso de 2-3 días
- El límite de filas por defecto es 1000, pero puedes aumentarlo hasta 25000
- Para análisis más complejos, puedes combinar múltiples dimensiones
- Guarda las credenciales JSON en un lugar seguro y nunca las compartas

## Próximos Pasos

Una vez configurado, puedes:
1. Crear informes automatizados de SEO
2. Monitorear el rendimiento de palabras clave específicas
3. Identificar oportunidades de mejora en CTR
4. Analizar el impacto de cambios en el sitio
5. Detectar problemas de indexación tempranamente

¡Tu servidor MCP de Google Search Console está listo para usar!