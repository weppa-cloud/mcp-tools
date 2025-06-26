# 🎯 Guía de Configuración: Conversiones Chatwoot → GA4

## Objetivo
Trackear como conversión en Google Analytics 4 cuando se agrega la etiqueta "compro" a una conversación en Chatwoot.

## 📋 Requisitos Previos

1. **Google Analytics 4**
   - Propiedad GA4 configurada
   - Measurement ID (G-XXXXXXXXXX)
   - API Secret para Measurement Protocol

2. **Chatwoot**
   - Acceso admin a Chatwoot
   - Capacidad de configurar webhooks
   - Etiqueta "compro" creada

## 🚀 Paso 1: Obtener Credenciales de GA4

### 1.1 Measurement ID
1. Ve a GA4 → Admin → Data Streams
2. Selecciona tu web stream
3. Copia el Measurement ID (G-XXXXXXXXXX)

### 1.2 API Secret
1. En el mismo Data Stream
2. Bajo "Measurement Protocol API secrets"
3. Click "Create" → Nombra tu secret → Copia el valor

## 🔧 Paso 2: Configurar el Webhook Server

### Opción A: Servidor Node.js

```bash
# Instalar dependencias
npm install express axios googleapis

# Configurar variables de entorno
export GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
export GA4_API_SECRET="your-api-secret"
export CHATWOOT_WEBHOOK_TOKEN="generate-random-token"
export PORT=3000

# Ejecutar servidor
node chatwoot-ga4-integration.js
```

### Opción B: Serverless (Vercel)

```javascript
// api/chatwoot-webhook.js
const { handleChatwootWebhook } = require('../chatwoot-ga4-integration');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleChatwootWebhook(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
```

### Opción C: Google Cloud Functions

```javascript
const { handleChatwootWebhook } = require('./chatwoot-ga4-integration');

exports.chatwootWebhook = async (req, res) => {
  return handleChatwootWebhook(req, res);
};
```

## 📡 Paso 3: Configurar Webhook en Chatwoot

1. **Accede a Chatwoot Admin**
   - Settings → Integrations → Webhooks

2. **Crear nuevo Webhook**
   ```
   URL: https://tu-servidor.com/webhook/chatwoot
   Events: 
   ✅ conversation_updated
   ✅ label_added (si está disponible)
   ```

3. **Agregar Headers**
   ```
   x-chatwoot-webhook-token: your-webhook-token
   ```

## ⚙️ Paso 4: Configurar Conversión en GA4

1. **GA4 Admin → Events**
   - Espera a que aparezca el evento "purchase"
   - Click en "Mark as conversion"

2. **Crear Audiencia (Opcional)**
   - GA4 → Audiences → New Audience
   - Condición: `event_name = purchase AND source = chatwoot`

3. **Configurar Objetivos**
   - GA4 → Configure → Conversions
   - Asegúrate que "purchase" esté marcado como conversión

## 📊 Paso 5: Verificar Implementación

### Test Manual
```bash
# Simular webhook de Chatwoot
curl -X POST https://tu-servidor.com/webhook/chatwoot \
  -H "Content-Type: application/json" \
  -H "x-chatwoot-webhook-token: your-webhook-token" \
  -d '{
    "event": "conversation_updated",
    "data": {
      "conversation": {
        "id": 12345,
        "labels": ["compro"],
        "contact": {
          "email": "test@example.com",
          "name": "Test User"
        },
        "assignee": {
          "name": "Agent Name"
        }
      }
    }
  }'
```

### Verificar en GA4
1. GA4 → Reports → Realtime
2. Busca eventos "purchase" con source = "chatwoot"
3. Verifica en Conversions → Overview

## 🎯 Datos Trackeados

### Evento Principal: `purchase`
- **value**: Valor monetario (configurable)
- **currency**: Moneda (default: USD)
- **transaction_id**: ID único de la conversión
- **source**: "chatwoot"
- **conversation_id**: ID de la conversación
- **contact_email**: Email del contacto
- **label_name**: "compro"
- **agent_name**: Nombre del agente asignado

### Evento Secundario: `chatwoot_label_compro_added`
- Datos adicionales de la conversación
- Útil para segmentación avanzada

## 🔍 Debugging

### Logs del Servidor
```bash
# Ver logs en tiempo real
tail -f chatwoot-ga4.log

# Verificar eventos enviados
grep "Conversion sent to GA4" chatwoot-ga4.log
```

### GA4 DebugView
1. Activa Debug Mode en GA4
2. Agrega `debug_mode: true` en el payload
3. Ve a GA4 → Configure → DebugView

## 📈 Reportes Recomendados

1. **Conversiones por Agente**
   - Dimension: agent_name
   - Metric: Conversions

2. **Tiempo hasta Conversión**
   - Analiza el tiempo desde inicio de chat hasta etiqueta "compro"

3. **Fuente de Tráfico → Chat → Compra**
   - Conecta source/medium original con conversiones de chat

## 🚨 Consideraciones Importantes

1. **GDPR/Privacidad**
   - Asegúrate de tener consentimiento para tracking
   - Anonimiza datos sensibles si es necesario

2. **Rate Limits**
   - GA4 Measurement Protocol: 25 eventos/segundo
   - Implementa retry logic si es necesario

3. **Validación de Datos**
   - Valida que la etiqueta sea exactamente "compro"
   - Maneja casos donde falten datos del contacto

## 📞 Soporte

- **Documentación GA4 MP**: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- **Chatwoot Webhooks**: https://www.chatwoot.com/docs/product/features/webhooks

---

Última actualización: ${new Date().toISOString()}