# 📊 GUÍA COMPLETA: TRACKING DE CONVERSIONES WORDPRESS → NEXT.JS

## 🎯 OBJETIVO
Medir TODO el funnel desde el click hasta la venta en WhatsApp, tanto en WordPress actual como en el futuro Next.js.

## 📈 FUNNEL COMPLETO A TRACKEAR

```
1. Vista de página → 2. Click en CTA → 3. Formulario iniciado → 
4. Formulario enviado → 5. WhatsApp iniciado → 6. Cotización solicitada → 
7. VENTA CERRADA 💰
```

## 🔧 IMPLEMENTACIÓN EN WORDPRESS (ACTUAL)

### 1. Instalar Google Tag Manager
```html
<!-- En header.php antes de </head> -->
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>

<!-- En body justo después de <body> -->
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### 2. Tracking de CTAs en WordPress
```javascript
// functions.php o plugin personalizado
function colombia_tours_tracking_scripts() {
    ?>
    <script>
    // Tracking de todos los CTAs
    document.addEventListener('DOMContentLoaded', function() {
        // Capturar Client ID de GA4
        let clientId = null;
        gtag('get', 'G-XXXXXXXXXX', 'client_id', (cid) => {
            clientId = cid;
            localStorage.setItem('ga4_client_id', cid);
        });
        
        // Track clicks en WhatsApp
        document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const destination = this.href;
                const buttonText = this.innerText;
                const pagePath = window.location.pathname;
                
                // Evento GA4
                gtag('event', 'whatsapp_click', {
                    button_text: buttonText,
                    page_location: pagePath,
                    destination_url: destination,
                    client_id: clientId
                });
                
                // Guardar datos para attribution
                const clickData = {
                    timestamp: new Date().toISOString(),
                    client_id: clientId,
                    utm_source: getURLParam('utm_source') || 'direct',
                    utm_medium: getURLParam('utm_medium') || 'none',
                    utm_campaign: getURLParam('utm_campaign') || 'none',
                    landing_page: window.location.href,
                    page_path: pagePath
                };
                
                localStorage.setItem('colombia_tours_attribution', JSON.stringify(clickData));
            });
        });
        
        // Track formularios
        document.querySelectorAll('form').forEach(form => {
            // Cuando inician el formulario
            form.addEventListener('focusin', function(e) {
                if (!this.dataset.tracked) {
                    this.dataset.tracked = 'true';
                    gtag('event', 'form_start', {
                        form_id: this.id || 'unknown',
                        form_location: window.location.pathname
                    });
                }
            }, { once: true });
            
            // Cuando envían el formulario
            form.addEventListener('submit', function(e) {
                const formData = new FormData(this);
                
                gtag('event', 'generate_lead', {
                    currency: 'USD',
                    value: 100, // Valor estimado del lead
                    form_id: this.id,
                    lead_source: 'website_form',
                    client_id: clientId
                });
                
                // Guardar attribution data
                const leadData = {
                    ...JSON.parse(localStorage.getItem('colombia_tours_attribution') || '{}'),
                    form_data: Object.fromEntries(formData),
                    form_submitted_at: new Date().toISOString()
                };
                
                // Enviar a tu servidor para guardar
                fetch('/wp-json/colombiatours/v1/track-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });
            });
        });
    });
    
    // Helper function
    function getURLParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    </script>
    <?php
}
add_action('wp_footer', 'colombia_tours_tracking_scripts');
```

### 3. Webhook para Chatwoot/WhatsApp
```php
// wp-content/plugins/colombiatours-tracking/webhook.php
add_action('rest_api_init', function () {
    register_rest_route('colombiatours/v1', '/chatwoot-webhook', array(
        'methods' => 'POST',
        'callback' => 'handle_chatwoot_webhook',
        'permission_callback' => '__return_true'
    ));
});

function handle_chatwoot_webhook($request) {
    $data = $request->get_json_params();
    
    // Verificar tipo de evento
    if ($data['event'] === 'conversation_status_changed' && 
        $data['status'] === 'resolved' &&
        isset($data['custom_attributes']['sale_completed'])) {
        
        // Recuperar client_id original
        $client_id = $data['custom_attributes']['ga4_client_id'] ?? 'chatwoot_' . $data['conversation']['id'];
        
        // Enviar conversión a GA4
        $measurement_protocol_secret = 'YOUR_SECRET';
        $measurement_id = 'G-XXXXXXXXXX';
        
        $payload = [
            'client_id' => $client_id,
            'events' => [[
                'name' => 'purchase',
                'params' => [
                    'currency' => 'USD',
                    'value' => $data['custom_attributes']['sale_value'] ?? 0,
                    'transaction_id' => 'WA_' . $data['conversation']['id'],
                    'items' => [[
                        'item_id' => $data['custom_attributes']['product_id'] ?? 'unknown',
                        'item_name' => $data['custom_attributes']['product_name'] ?? 'Tour Package',
                        'price' => $data['custom_attributes']['sale_value'] ?? 0,
                        'quantity' => 1
                    ]],
                    // Attribution data
                    'source' => $data['custom_attributes']['utm_source'] ?? 'direct',
                    'medium' => $data['custom_attributes']['utm_medium'] ?? 'none',
                    'campaign' => $data['custom_attributes']['utm_campaign'] ?? 'none'
                ]
            ]]
        ];
        
        // Enviar a GA4
        wp_remote_post(
            "https://www.google-analytics.com/mp/collect?measurement_id={$measurement_id}&api_secret={$measurement_protocol_secret}",
            [
                'body' => json_encode($payload),
                'headers' => ['Content-Type' => 'application/json']
            ]
        );
    }
    
    return ['success' => true];
}
```

## 🚀 IMPLEMENTACIÓN EN NEXT.JS (FUTURO)

### 1. Setup Analytics en Next.js
```bash
npm install @next/third-parties react-ga4
```

### 2. Provider de Analytics
```jsx
// app/providers/AnalyticsProvider.jsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';

export function AnalyticsProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Track page views
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_search: searchParams.toString(),
      });
    }
  }, [pathname, searchParams]);
  
  return (
    <>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      {children}
    </>
  );
}
```

### 3. Hook de Tracking Reutilizable
```jsx
// hooks/useTracking.js
import { useCallback, useEffect, useState } from 'react';

export function useTracking() {
  const [clientId, setClientId] = useState(null);
  const [attribution, setAttribution] = useState({});
  
  useEffect(() => {
    // Obtener Client ID
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('get', 'G-XXXXXXXXXX', 'client_id', (cid) => {
        setClientId(cid);
        localStorage.setItem('ga4_client_id', cid);
      });
      
      // Capturar attribution data
      const params = new URLSearchParams(window.location.search);
      const attributionData = {
        client_id: clientId,
        utm_source: params.get('utm_source') || 'direct',
        utm_medium: params.get('utm_medium') || 'none',
        utm_campaign: params.get('utm_campaign') || 'none',
        landing_page: window.location.href,
        timestamp: new Date().toISOString()
      };
      
      setAttribution(attributionData);
      sessionStorage.setItem('attribution_data', JSON.stringify(attributionData));
    }
  }, []);
  
  const trackEvent = useCallback((eventName, parameters = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        client_id: clientId,
        ...attribution
      });
    }
  }, [clientId, attribution]);
  
  const trackCTA = useCallback((ctaName, ctaLocation, value = null) => {
    trackEvent('cta_click', {
      cta_name: ctaName,
      cta_location: ctaLocation,
      value: value,
      engagement_time_msec: 100
    });
  }, [trackEvent]);
  
  const trackFormStart = useCallback((formName) => {
    trackEvent('form_start', {
      form_name: formName,
      form_location: window.location.pathname
    });
  }, [trackEvent]);
  
  const trackFormSubmit = useCallback((formName, formData = {}) => {
    trackEvent('generate_lead', {
      currency: 'USD',
      value: 100, // Valor estimado del lead
      form_name: formName,
      lead_source: 'website_form',
      form_data: formData
    });
    
    // Guardar para attribution
    const leadData = {
      ...attribution,
      form_data: formData,
      submitted_at: new Date().toISOString()
    };
    
    // Enviar a API
    fetch('/api/track-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
  }, [trackEvent, attribution]);
  
  const trackWhatsAppClick = useCallback((destination, context) => {
    trackEvent('whatsapp_click', {
      destination_url: destination,
      click_context: context,
      page_location: window.location.pathname
    });
  }, [trackEvent]);
  
  const trackPurchase = useCallback((transactionData) => {
    trackEvent('purchase', {
      currency: 'USD',
      value: transactionData.value,
      transaction_id: transactionData.id,
      items: transactionData.items,
      ...attribution
    });
  }, [trackEvent, attribution]);
  
  return {
    clientId,
    attribution,
    trackEvent,
    trackCTA,
    trackFormStart,
    trackFormSubmit,
    trackWhatsAppClick,
    trackPurchase
  };
}
```

### 4. Componentes con Tracking Integrado
```jsx
// components/SmartCTA.jsx
import { useTracking } from '@/hooks/useTracking';

export function SmartCTA({ 
  href, 
  text, 
  variant = 'primary', 
  value = null,
  context = 'general' 
}) {
  const { trackCTA, trackWhatsAppClick } = useTracking();
  
  const handleClick = (e) => {
    // Track CTA genérico
    trackCTA(text, context, value);
    
    // Si es WhatsApp, track específico
    if (href.includes('wa.me') || href.includes('whatsapp')) {
      e.preventDefault();
      trackWhatsAppClick(href, context);
      
      // Delay para asegurar tracking
      setTimeout(() => {
        window.location.href = href;
      }, 100);
    }
  };
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={`cta cta-${variant}`}
      data-track-cta={text}
    >
      {text}
    </a>
  );
}
```

```jsx
// components/LeadForm.jsx
import { useState } from 'react';
import { useTracking } from '@/hooks/useTracking';

export function LeadForm({ productId, productName, productPrice }) {
  const { trackFormStart, trackFormSubmit, attribution } = useTracking();
  const [focused, setFocused] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });
  
  const handleFocus = () => {
    if (!focused) {
      setFocused(true);
      trackFormStart('lead_form_product');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track form submission
    trackFormSubmit('lead_form_product', {
      product_id: productId,
      product_name: productName,
      product_price: productPrice,
      ...formData
    });
    
    // Preparar datos con attribution
    const leadData = {
      ...formData,
      product_id: productId,
      product_name: productName,
      product_price: productPrice,
      ...attribution
    };
    
    // Enviar a Chatwoot con attribution
    try {
      const response = await fetch('/api/create-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      
      const data = await response.json();
      
      // Redirigir a WhatsApp con parámetros
      const waMessage = `Hola! Me interesa ${productName}. Mi código es: ${data.conversationId}`;
      window.location.href = `https://wa.me/573001234567?text=${encodeURIComponent(waMessage)}`;
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} onFocus={handleFocus}>
      <input
        type="text"
        name="name"
        placeholder="Tu nombre"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="tel"
        name="whatsapp"
        placeholder="WhatsApp"
        value={formData.whatsapp}
        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <button type="submit">
        Solicitar Cotización por WhatsApp
      </button>
    </form>
  );
}
```

### 5. API Routes para Tracking
```javascript
// app/api/track-lead/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const leadData = await request.json();
  
  // Guardar en base de datos o CRM
  // Por ahora, solo log
  console.log('Lead received:', leadData);
  
  // Opcional: Enviar a Google Sheets, CRM, etc.
  
  return NextResponse.json({ success: true });
}
```

```javascript
// app/api/create-conversation/route.js
export async function POST(request) {
  const data = await request.json();
  
  // Crear conversación en Chatwoot con custom attributes
  const chatwootResponse = await fetch('https://app.chatwoot.com/api/v1/accounts/1/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_access_token': process.env.CHATWOOT_API_TOKEN
    },
    body: JSON.stringify({
      source_id: data.whatsapp.replace(/\D/g, ''),
      custom_attributes: {
        ga4_client_id: data.client_id,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        landing_page: data.landing_page,
        product_id: data.product_id,
        product_name: data.product_name,
        product_price: data.product_price,
        lead_name: data.name,
        lead_email: data.email
      }
    })
  });
  
  const conversation = await chatwootResponse.json();
  
  return NextResponse.json({
    success: true,
    conversationId: conversation.id
  });
}
```

### 6. Webhook Handler para Conversiones
```javascript
// app/api/webhooks/chatwoot/route.js
import { NextResponse } from 'next/server';

const GA4_API_SECRET = process.env.GA4_API_SECRET;
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID;

export async function POST(request) {
  const data = await request.json();
  
  // Verificar evento de venta
  if (data.event === 'conversation_status_changed' && 
      data.status === 'resolved' &&
      data.custom_attributes?.sale_completed) {
    
    const clientId = data.custom_attributes.ga4_client_id || `chatwoot_${data.conversation.id}`;
    
    // Construir evento de compra
    const purchaseEvent = {
      client_id: clientId,
      events: [{
        name: 'purchase',
        params: {
          currency: 'USD',
          value: parseFloat(data.custom_attributes.sale_value || 0),
          transaction_id: `WA_${data.conversation.id}`,
          items: [{
            item_id: data.custom_attributes.product_id || 'tour',
            item_name: data.custom_attributes.product_name || 'Tour Package',
            price: parseFloat(data.custom_attributes.sale_value || 0),
            quantity: 1
          }],
          // Attribution
          source: data.custom_attributes.utm_source || 'direct',
          medium: data.custom_attributes.utm_medium || 'none',
          campaign: data.custom_attributes.utm_campaign || 'none'
        }
      }]
    };
    
    // Enviar a GA4 Measurement Protocol
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify(purchaseEvent)
      }
    );
    
    console.log('Purchase tracked:', { 
      conversationId: data.conversation.id,
      value: data.custom_attributes.sale_value,
      gaResponse: response.status 
    });
  }
  
  return NextResponse.json({ received: true });
}
```

## 📊 CONFIGURACIÓN EN GA4

### 1. Crear Eventos Personalizados
En GA4 > Configurar > Eventos > Crear evento:

```
1. form_start → Marcar como conversión
2. generate_lead → Marcar como conversión (valor: $100)
3. whatsapp_click → Marcar como conversión
4. purchase → Marcar como conversión (valor: dinámico)
```

### 2. Configurar Embudos
GA4 > Explorar > Análisis del embudo:
```
1. page_view (página producto)
2. form_start
3. generate_lead
4. whatsapp_click
5. purchase
```

### 3. Audiencias para Remarketing
```
- Iniciaron formulario pero no enviaron
- Enviaron formulario pero no compraron
- Compradores (para upsell)
```

## 📈 DASHBOARDS Y REPORTES

### Google Data Studio Dashboard
```
Métricas clave:
- Conversión por fuente/campaña
- Valor de conversión por fuente
- Tiempo promedio hasta compra
- Productos más vendidos
- ROI por campaña
```

## 🎯 RESULTADO FINAL

Con esta implementación podrás:
1. **Ver ROI real** de cada campaña
2. **Optimizar** para ventas, no solo leads
3. **Remarketing** inteligente por etapa
4. **Attribution** completa multi-canal
5. **Escalar** lo que funciona

---

¿Quieres que implemente esto primero en WordPress o preparamos todo para Next.js?