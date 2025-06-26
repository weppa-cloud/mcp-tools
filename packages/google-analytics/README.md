# MCP Google Analytics Server

Un servidor MCP (Model Context Protocol) para integrar Google Analytics con LLMs.

## Instalación

1. Clona el repositorio y navega al directorio:
```bash
cd mcp-google-analytics
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el proyecto:
```bash
npm run build
```

## Configuración

### 1. Credenciales de Google Analytics

Necesitas una cuenta de servicio de Google Cloud con acceso a Google Analytics:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Analytics Data
4. Crea una cuenta de servicio y descarga el archivo JSON de credenciales
5. En Google Analytics, añade el email de la cuenta de servicio como usuario con permisos de lectura

### 2. Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
GA_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### 3. Configuración en Claude Desktop

Añade el servidor a tu configuración de Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "node",
      "args": ["/path/to/mcp-google-analytics/dist/index.js"],
      "env": {
        "GA_PROPERTY_ID": "YOUR_PROPERTY_ID",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/credentials.json"
      }
    }
  }
}
```

## Herramientas disponibles

### Herramientas Básicas

#### 1. `get_realtime_data`
Obtiene datos en tiempo real de Google Analytics.

#### 2. `get_report_data`
Obtiene datos de reportes para un rango de fechas.

#### 3. `get_audience_data`
Obtiene datos demográficos y de intereses de la audiencia.

### Herramientas de Growth

#### 4. `analyze_funnel`
Analiza embudos de conversión con tasas de abandono entre pasos.

**Parámetros:**
- `startDate`, `endDate`: Rango de fechas
- `steps`: Array de pasos del funnel con `name`, `eventName` (opcional), `pagePath` (opcional)
- `segmentBy`: (Opcional) Dimensiones para segmentar

#### 5. `analyze_cohorts`
Análisis de cohortes para retención y patrones de comportamiento.

**Parámetros:**
- `startDate`, `endDate`: Rango de fechas para definir cohortes
- `cohortType`: `"daily"`, `"weekly"`, o `"monthly"`
- `metric`: Métrica a analizar (ej: `"activeUsers"`, `"revenue"`)
- `periodsToAnalyze`: Número de períodos a analizar

#### 6. `get_user_segments`
Segmentación detallada de usuarios.

**Parámetros:**
- `segmentType`: `"behavior"`, `"technology"`, `"acquisition"`, o `"demographic"`
- `metrics`: Métricas a analizar por segmento
- `minThreshold`: (Opcional) Umbral mínimo de usuarios

#### 7. `analyze_conversion_paths`
Analiza caminos de usuarios hacia conversiones.

**Parámetros:**
- `conversionEvent`: Evento de conversión (ej: `"purchase"`, `"signup"`)
- `touchpointDimension`: Dimensión para touchpoints (default: `"sessionSource"`)
- `pathLength`: Longitud máxima del path

#### 8. `get_growth_metrics`
Calcula métricas clave de growth.

**Parámetros:**
- `compareWith`: `"previous_period"`, `"previous_year"`, o `"custom"`
- `metrics`: Array con opciones como `"user_growth_rate"`, `"retention_rate"`, `"ltv"`, `"churn_rate"`

#### 9. `analyze_ab_test`
Analiza resultados de tests A/B.

**Parámetros:**
- `experimentDimension`: Dimensión con variantes del experimento
- `successMetrics`: Métricas de éxito a comparar
- `guardrailMetrics`: (Opcional) Métricas guardrail
- `segmentBy`: (Opcional) Dimensiones adicionales

#### 10. `get_user_journey`
Obtiene journey detallado de usuarios.

**Parámetros:**
- `userId`: (Opcional) ID específico de usuario
- `userSegment`: (Opcional) Segmento de usuarios
- `eventTypes`: (Opcional) Tipos de eventos a incluir
- `maxEvents`: Máximo de eventos por journey

#### 11. `identify_power_users`
Identifica y analiza power users.

**Parámetros:**
- `threshold`: Objeto con `metric` y `value` para identificar power users
- `analyzeMetrics`: Métricas adicionales para analizar
- `compareWithAverage`: Comparar con usuarios promedio

## Ejemplos de uso en Claude

### Análisis Básicos
- "Muéstrame los usuarios activos en tiempo real por país"
- "Dame un reporte de sesiones y páginas vistas de la última semana"
- "Analiza la demografía de mi audiencia del último mes"

### Análisis de Growth
- "Analiza mi funnel de conversión: Homepage → Product View → Add to Cart → Purchase"
- "Muéstrame la retención de cohortes semanales del último mes"
- "Identifica mis power users con más de 50 sesiones este mes"
- "Calcula mi tasa de crecimiento comparando con el período anterior"
- "Analiza el A/B test en la dimensión 'experimentVariant'"
- "Muéstrame los caminos de conversión más comunes para el evento 'purchase'"
- "Segmenta mis usuarios por comportamiento y muéstrame métricas clave"

## Desarrollo

Para desarrollo local:

```bash
npm run dev
```

## Métricas y dimensiones comunes

### Métricas
- `activeUsers`, `newUsers`, `totalUsers`
- `sessions`, `sessionsPerUser`, `averageSessionDuration`
- `screenPageViews`, `screenPageViewsPerSession`
- `eventCount`, `conversions`
- `totalRevenue`, `purchaseRevenue`

### Dimensiones
- `date`, `dateHour`, `dateHourMinute`
- `country`, `city`, `region`
- `deviceCategory`, `platform`, `operatingSystem`
- `sessionSource`, `sessionMedium`, `sessionCampaignName`
- `userAgeBracket`, `userGender`
- `pagePath`, `pageTitle`
- `eventName`