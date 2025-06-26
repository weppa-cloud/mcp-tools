# 🎯 GUÍA COMPLETA: ATTRIBUTION DE CAMPAÑAS EN CHATWOOT → GA4

## 📊 El Problema de Attribution

Cuando un usuario convierte en el chat días después de hacer clic en un anuncio, GA4 no puede conectar automáticamente estos eventos. Esta guía muestra cómo solucionarlo.

## 🔗 MÉTODOS DE ATTRIBUTION (De mejor a más simple)

### MÉTODO 1: CLIENT ID PERSISTENCE ⭐⭐⭐⭐⭐
**Mejor para**: Sitios web con widget de Chatwoot integrado

#### Paso 1: Capturar Client ID en tu sitio web
```html
<!-- En tu sitio web, ANTES del widget de Chatwoot -->
<script>
// Obtener y guardar el Client ID de GA4
gtag('get', 'G-XXXXXXXXXX', 'client_id', (clientId) => {
  // Configurar Chatwoot con el Client ID
  window.chatwootSettings = {
    hideMessageBubble: false,
    position: 'right',
    locale: 'es',
    // IMPORTANTE: Pasar datos de attribution
    customAttributes: {
      ga4_client_id: clientId,
      // Capturar UTMs de la URL
      utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
      landing_page: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    }
  };
  
  // Inicializar Chatwoot
  (function(d,t) {
    var BASE_URL="https://app.chatwoot.com";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'YOUR_WEBSITE_TOKEN',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
});
</script>
```

#### Paso 2: En tu webhook, usar el mismo Client ID
```javascript
// En el webhook handler
const clientId = conversation.custom_attributes?.ga4_client_id || `chatwoot_${conversation.id}`;

const conversionEvent = {
  client_id: clientId, // MISMO ID = ATTRIBUTION PERFECTA
  events: [{
    name: 'purchase',
    params: {
      // La conversión se atribuirá a la campaña original
      value: 500,
      currency: 'USD',
      // Opcionalmente incluir UTMs originales
      source: conversation.custom_attributes?.utm_source,
      medium: conversation.custom_attributes?.utm_medium,
      campaign: conversation.custom_attributes?.utm_campaign
    }
  }]
};
```

### MÉTODO 2: USER ID MATCHING ⭐⭐⭐⭐
**Mejor para**: Sitios con login/registro

#### Paso 1: Configurar User ID cuando el usuario se identifica
```javascript
// Cuando el usuario hace login o se registra
function onUserLogin(email) {
  // Configurar User ID en GA4
  gtag('config', 'G-XXXXXXXXXX', {
    'user_id': email
  });
  
  // También en Chatwoot
  if (window.$chatwoot) {
    window.$chatwoot.setUser(email, {
      email: email
    });
  }
}
```

#### Paso 2: Usar el mismo User ID en conversiones
```javascript
const conversionEvent = {
  client_id: `chatwoot_${conversation.id}`,
  user_id: conversation.contact?.email, // GA4 unifica automáticamente
  events: [{
    name: 'purchase',
    params: {
      value: 500,
      currency: 'USD'
    }
  }]
};
```

### MÉTODO 3: UTM PARAMETER TRACKING ⭐⭐⭐
**Mejor para**: WhatsApp/canales externos

#### Paso 1: Agregar UTMs a tus enlaces de WhatsApp
```
https://wa.me/521234567890?text=Hola%20vengo%20de%20Google%20Ads
↓
https://wa.me/521234567890?text=Hola%20vengo%20de%20Google%20Ads%20utm_source%3Dgoogle%20utm_medium%3Dcpc%20utm_campaign%3Dviajes-cartagena
```

#### Paso 2: Capturar UTMs en Chatwoot
```javascript
// En tu primer mensaje automático o mediante API
const firstMessage = conversation.messages[0]?.content || '';
const utmMatch = firstMessage.match(/utm_source=(\w+).*utm_medium=(\w+).*utm_campaign=([\w-]+)/);

if (utmMatch) {
  const [_, source, medium, campaign] = utmMatch;
  // Guardar como custom attributes
  await updateConversationAttributes(conversation.id, {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign
  });
}
```

### MÉTODO 4: OFFLINE CONVERSION IMPORT ⭐⭐
**Mejor para**: Volumen alto, attribution precisa

#### Paso 1: Recopilar datos de conversiones
```javascript
// Guardar conversiones en tu base de datos
const conversion = {
  client_id: conversation.custom_attributes?.ga4_client_id,
  transaction_id: `chat_${conversation.id}`,
  value: 500,
  currency: 'USD',
  date: new Date().toISOString(),
  original_source: 'google',
  original_medium: 'cpc',
  original_campaign: 'viajes-cartagena'
};
```

#### Paso 2: Generar CSV para importar
```csv
client_id,transaction_id,value,currency,date,source,medium,campaign
Iv8_8Q3Je,chat_12345,500,USD,2024-06-22T10:45:00Z,google,cpc,viajes-cartagena
Kx9_2R4Mf,chat_12346,750,USD,2024-06-22T11:30:00Z,facebook,paid,remarketing
```

#### Paso 3: Importar en GA4
- GA4 → Admin → Data Import → Create
- Tipo: "Event data import"
- Subir CSV

## 📈 CONFIGURACIÓN EN GA4

### 1. Habilitar User-ID Reports
```
Admin → Reporting Identity → Blended
(Combina User ID, Google Signals, y Device ID)
```

### 2. Configurar Attribution Settings
```
Admin → Attribution Settings
- Reporting attribution model: Data-driven
- Conversion window: 90 días
- Engagement window: 30 días
```

### 3. Crear Conversión Personalizada
```javascript
// Evento personalizado con attribution completa
{
  name: 'chat_purchase',
  params: {
    value: 500,
    currency: 'USD',
    // Attribution params
    source: 'google',
    medium: 'cpc', 
    campaign: 'viajes-cartagena',
    // Original session
    original_session_id: 'abc123',
    days_to_conversion: 3,
    // Chat details
    chat_source: 'chatwoot',
    agent_name: 'Carlos'
  }
}
```

## 🎯 EJEMPLOS DE ATTRIBUTION

### Ejemplo 1: Usuario viene de Google Ads
```
Día 1: Click en Google Ads → Visita sitio → Se va
       Client ID: Abc123, Source: google/cpc
       
Día 3: Regresa directo → Inicia chat → Compra
       Client ID: Abc123 (mismo)
       
Resultado: Conversión atribuida a google/cpc ✓
```

### Ejemplo 2: Multi-touch Attribution
```
Día 1: Facebook Ad → Visita → No convierte
Día 3: Google Search → Visita → No convierte  
Día 5: Email → Chat → Compra

GA4 Data-driven attribution distribuye el crédito:
- Facebook: 20%
- Google: 30%
- Email: 50%
```

## 🛠️ DEBUGGING ATTRIBUTION

### 1. Verificar Client ID
```javascript
// En el navegador
gtag('get', 'G-XXXXXXXXXX', 'client_id', (clientId) => {
  console.log('GA4 Client ID:', clientId);
});

// En Chatwoot
console.log('Chatwoot attributes:', conversation.custom_attributes);
```

### 2. GA4 DebugView
- Activa debug_mode
- Verifica que client_id coincida
- Revisa source/medium/campaign

### 3. Reporte de Attribution
```
GA4 → Advertising → Attribution → Conversion paths
- Filtrar por conversión "purchase"
- Ver el path completo del usuario
```

## 📊 REPORTES RECOMENDADOS

### 1. Campaign ROI Dashboard
```sql
-- Pseudo-query para GA4
SELECT 
  source,
  medium, 
  campaign,
  COUNT(conversions) as total_conversions,
  SUM(value) as revenue,
  revenue / ad_cost as ROAS
WHERE event_name = 'purchase'
  AND custom_dimension = 'chatwoot'
```

### 2. Attribution por Canal
- Dimensiones: Source/Medium, Campaign
- Métricas: Conversiones, Valor, Días hasta conversión
- Filtro: conversion_source = 'chatwoot'

### 3. Customer Journey Report
- First touch: ¿Dónde descubrieron?
- Last touch: ¿Qué los convenció?
- Chat influence: ¿Cuántos necesitaron chat?

## ⚡ QUICK SETUP (5 minutos)

Para implementación rápida, mínimo necesitas:

```javascript
// 1. En tu sitio web
gtag('get', 'G-XXXXXXXXXX', 'client_id', (clientId) => {
  localStorage.setItem('ga4_cid', clientId);
});

// 2. En Chatwoot webhook
const conversionEvent = {
  client_id: localStorage.getItem('ga4_cid') || `chat_${id}`,
  user_id: contact.email,
  events: [{
    name: 'purchase',
    params: { value: 500 }
  }]
};
```

## 🚀 PRÓXIMOS PASOS

1. **Implementa Client ID persistence** (mayor precisión)
2. **Configura User ID** si tienes login
3. **Activa Data-driven attribution** en GA4
4. **Crea dashboard** de ROI por campaña
5. **Optimiza campañas** basado en conversiones reales

---

¿Necesitas ayuda con algún método específico? Contáctame para implementación.