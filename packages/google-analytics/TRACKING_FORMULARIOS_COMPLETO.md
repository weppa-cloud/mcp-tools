# 📝 TRACKING COMPLETO DE FORMULARIOS

## 🎯 FORMULARIOS EN WORDPRESS (ACTUAL)

### 1. TRACKING AUTOMÁTICO PARA TODOS LOS FORMULARIOS
```javascript
// Este código trackea CUALQUIER formulario en WordPress
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let clientId = null;
    let formStarted = {};
    
    // Obtener Client ID
    gtag('get', 'G-XXXXXXXXXX', 'client_id', (cid) => {
        clientId = cid;
        localStorage.setItem('ga4_client_id', cid);
    });
    
    // TRACKEAR TODOS LOS FORMULARIOS
    document.querySelectorAll('form').forEach((form, index) => {
        // Asignar ID si no tiene
        if (!form.id) {
            form.id = `form_${index}`;
        }
        
        // 1. CUANDO HACEN CLICK EN CUALQUIER CAMPO
        form.addEventListener('focusin', function(e) {
            const formId = this.id;
            
            // Solo trackear una vez por formulario
            if (!formStarted[formId]) {
                formStarted[formId] = true;
                
                console.log('📊 Form Started:', formId);
                
                gtag('event', 'form_start', {
                    form_id: formId,
                    form_location: window.location.pathname,
                    form_name: this.getAttribute('name') || formId,
                    field_interacted: e.target.name || e.target.id
                });
            }
        });
        
        // 2. TRACKEAR ABANDONO DE CAMPOS
        form.addEventListener('blur', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                const fieldName = e.target.name || e.target.id;
                const fieldValue = e.target.value;
                
                // Si abandonan un campo obligatorio vacío
                if (e.target.required && !fieldValue) {
                    gtag('event', 'form_abandonment', {
                        form_id: this.id,
                        field_abandoned: fieldName,
                        form_location: window.location.pathname
                    });
                }
            }
        }, true);
        
        // 3. CUANDO ENVÍAN EL FORMULARIO
        form.addEventListener('submit', function(e) {
            const formId = this.id;
            const formData = new FormData(this);
            
            // Recopilar datos del formulario
            const formValues = {};
            for (let [key, value] of formData.entries()) {
                // No enviar datos sensibles
                if (!key.includes('password') && !key.includes('card')) {
                    formValues[key] = value;
                }
            }
            
            console.log('📊 Form Submitted:', formId, formValues);
            
            // EVENTO PRINCIPAL: LEAD GENERADO
            gtag('event', 'generate_lead', {
                currency: 'USD',
                value: 100, // Valor estimado del lead
                form_id: formId,
                form_name: this.getAttribute('name') || formId,
                form_destination: this.action,
                lead_source: 'website_form',
                // Datos del lead (sin PII)
                has_name: !!formValues.name,
                has_email: !!formValues.email,
                has_phone: !!formValues.phone || !!formValues.whatsapp,
                // Attribution
                client_id: clientId,
                page_location: window.location.href
            });
            
            // Guardar attribution para WhatsApp
            const attributionData = {
                form_submitted_at: new Date().toISOString(),
                form_id: formId,
                client_id: clientId,
                utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
                utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
                utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
                landing_page: window.location.href,
                referrer: document.referrer,
                form_data: formValues
            };
            
            localStorage.setItem('colombiatours_last_form', JSON.stringify(attributionData));
            
            // Si el formulario redirige a WhatsApp
            if (this.action.includes('wa.me') || formValues.action === 'whatsapp') {
                e.preventDefault();
                
                // Esperar a que se envíe el evento
                setTimeout(() => {
                    // Construir mensaje de WhatsApp con tracking
                    const phone = '573001234567';
                    const message = `Hola, acabo de llenar el formulario. Mi nombre es ${formValues.name || 'Usuario'}. Código: ${clientId}`;
                    window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                }, 500);
            }
        });
        
        // 4. TRACKEAR PROGRESO DEL FORMULARIO
        const inputs = form.querySelectorAll('input, textarea, select');
        let fieldsCompleted = 0;
        
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                if (this.value) {
                    fieldsCompleted++;
                    const progress = Math.round((fieldsCompleted / inputs.length) * 100);
                    
                    // Trackear hitos de progreso
                    if (progress === 25 || progress === 50 || progress === 75) {
                        gtag('event', 'form_progress', {
                            form_id: form.id,
                            progress_percentage: progress,
                            fields_completed: fieldsCompleted,
                            total_fields: inputs.length
                        });
                    }
                }
            });
        });
    });
});
```

### 2. TRACKING ESPECÍFICO PARA CONTACT FORM 7
```javascript
// Para Contact Form 7
document.addEventListener('wpcf7mailsent', function(event) {
    const formId = event.detail.contactFormId;
    const inputs = event.detail.inputs;
    
    // Extraer datos del formulario
    const formData = {};
    inputs.forEach(input => {
        formData[input.name] = input.value;
    });
    
    gtag('event', 'generate_lead', {
        currency: 'USD',
        value: 100,
        form_id: `cf7_${formId}`,
        form_type: 'contact_form_7',
        lead_source: 'cf7_form',
        // Datos sin PII
        has_name: !!formData.nombre,
        has_email: !!formData.email,
        has_phone: !!formData.telefono,
        message_topic: formData.asunto || 'general'
    });
    
    // Guardar para attribution
    localStorage.setItem('cf7_form_data', JSON.stringify({
        ...formData,
        client_id: localStorage.getItem('ga4_client_id'),
        submitted_at: new Date().toISOString()
    }));
});

// Track errores en envío
document.addEventListener('wpcf7invalid', function(event) {
    gtag('event', 'form_error', {
        form_id: `cf7_${event.detail.contactFormId}`,
        error_type: 'validation_failed'
    });
});
```

### 3. TRACKING PARA GRAVITY FORMS
```javascript
// Para Gravity Forms
jQuery(document).on('gform_confirmation_loaded', function(event, formId) {
    gtag('event', 'generate_lead', {
        currency: 'USD',
        value: 100,
        form_id: `gform_${formId}`,
        form_type: 'gravity_forms',
        lead_source: 'gravity_form'
    });
});

// Track progreso en forms multipágina
jQuery(document).on('gform_page_loaded', function(event, formId, currentPage) {
    gtag('event', 'form_progress', {
        form_id: `gform_${formId}`,
        current_page: currentPage,
        form_type: 'multi_page_form'
    });
});
```

## 🚀 FORMULARIOS EN NEXT.JS (NUEVO SITIO)

### 1. COMPONENTE DE FORMULARIO INTELIGENTE
```jsx
// components/SmartForm.jsx
import { useState, useRef } from 'react';
import { useTracking } from '@/hooks/useTracking';

export function SmartForm({ 
  formId = 'contact',
  productId = null,
  productName = null,
  redirectToWhatsApp = true 
}) {
  const { trackFormStart, trackFormSubmit, trackEvent, clientId, attribution } = useTracking();
  const [formStarted, setFormStarted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    destination: '',
    dates: '',
    passengers: '2',
    message: ''
  });
  const [fieldsCompleted, setFieldsCompleted] = useState(0);
  const formRef = useRef();
  
  // Track cuando empiezan a llenar
  const handleFormFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart(formId);
    }
  };
  
  // Track progreso del formulario
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Calcular progreso
    const filledFields = Object.values({...formData, [fieldName]: value})
      .filter(val => val !== '').length;
    const totalFields = Object.keys(formData).length;
    const progress = Math.round((filledFields / totalFields) * 100);
    
    // Track hitos de progreso
    if (progress === 25 || progress === 50 || progress === 75) {
      trackEvent('form_progress', {
        form_id: formId,
        progress_percentage: progress,
        fields_completed: filledFields,
        total_fields: totalFields
      });
    }
    
    setFieldsCompleted(filledFields);
  };
  
  // Track abandono
  const handleFieldBlur = (fieldName, value, isRequired) => {
    if (isRequired && !value) {
      trackEvent('form_field_abandoned', {
        form_id: formId,
        field_name: fieldName,
        is_required: true
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track envío con todos los datos
    trackFormSubmit(formId, {
      product_id: productId,
      product_name: productName,
      has_name: !!formData.name,
      has_email: !!formData.email,
      has_whatsapp: !!formData.whatsapp,
      destination: formData.destination,
      passenger_count: formData.passengers,
      has_dates: !!formData.dates
    });
    
    try {
      // Crear conversación en Chatwoot con attribution
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formId,
          productId,
          productName,
          attribution: {
            ...attribution,
            client_id: clientId,
            form_submitted_at: new Date().toISOString()
          }
        })
      });
      
      const result = await response.json();
      
      if (redirectToWhatsApp) {
        // Construir mensaje con código de tracking
        const message = `Hola! Soy ${formData.name}. Me interesa viajar a ${formData.destination || productName}. Mi código es: ${result.trackingCode}`;
        const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`;
        
        // Track click a WhatsApp
        trackEvent('whatsapp_redirect', {
          form_id: formId,
          tracking_code: result.trackingCode,
          destination: formData.destination || productName
        });
        
        // Pequeño delay para asegurar tracking
        setTimeout(() => {
          window.location.href = whatsappUrl;
        }, 100);
      } else {
        // Mostrar confirmación
        alert('¡Gracias! Te contactaremos pronto.');
      }
      
    } catch (error) {
      console.error('Error:', error);
      trackEvent('form_error', {
        form_id: formId,
        error_type: 'submission_failed'
      });
    }
  };
  
  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      onFocus={handleFormFocus}
      className="smart-form"
      data-form-id={formId}
    >
      {/* Campo Nombre */}
      <div className="form-group">
        <label htmlFor="name">Nombre completo *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={(e) => handleFieldBlur('name', e.target.value, true)}
          required
          placeholder="Juan Pérez"
        />
      </div>
      
      {/* Campo WhatsApp */}
      <div className="form-group">
        <label htmlFor="whatsapp">WhatsApp *</label>
        <input
          type="tel"
          id="whatsapp"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
          onBlur={(e) => handleFieldBlur('whatsapp', e.target.value, true)}
          required
          placeholder="+57 300 123 4567"
        />
      </div>
      
      {/* Campo Email */}
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={(e) => handleFieldBlur('email', e.target.value, true)}
          required
          placeholder="juan@email.com"
        />
      </div>
      
      {/* Campo Destino (si no es para un producto específico) */}
      {!productId && (
        <div className="form-group">
          <label htmlFor="destination">¿A dónde quieres viajar?</label>
          <select
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={(e) => handleFieldChange('destination', e.target.value)}
          >
            <option value="">Selecciona un destino</option>
            <option value="cartagena">Cartagena</option>
            <option value="medellin">Medellín</option>
            <option value="eje-cafetero">Eje Cafetero</option>
            <option value="san-andres">San Andrés</option>
            <option value="amazonas">Amazonas</option>
          </select>
        </div>
      )}
      
      {/* Campo Fechas */}
      <div className="form-group">
        <label htmlFor="dates">Fechas aproximadas</label>
        <input
          type="text"
          id="dates"
          name="dates"
          value={formData.dates}
          onChange={(e) => handleFieldChange('dates', e.target.value)}
          placeholder="Ej: 15-20 de Julio"
        />
      </div>
      
      {/* Campo Pasajeros */}
      <div className="form-group">
        <label htmlFor="passengers">Número de viajeros</label>
        <select
          id="passengers"
          name="passengers"
          value={formData.passengers}
          onChange={(e) => handleFieldChange('passengers', e.target.value)}
        >
          <option value="1">1 persona</option>
          <option value="2">2 personas</option>
          <option value="3">3 personas</option>
          <option value="4">4 personas</option>
          <option value="5+">5 o más</option>
        </select>
      </div>
      
      {/* Campo Mensaje */}
      <div className="form-group">
        <label htmlFor="message">Mensaje adicional (opcional)</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={(e) => handleFieldChange('message', e.target.value)}
          rows="3"
          placeholder="Cuéntanos más sobre tu viaje ideal..."
        />
      </div>
      
      {/* Barra de progreso */}
      {formStarted && (
        <div className="form-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(fieldsCompleted / 6) * 100}%` }}
          />
          <span className="progress-text">
            {fieldsCompleted} de 6 campos completados
          </span>
        </div>
      )}
      
      {/* Botón Submit */}
      <button 
        type="submit" 
        className="submit-button"
        disabled={fieldsCompleted < 3} // Mínimo nombre, email y whatsapp
      >
        <span>Solicitar Cotización por WhatsApp</span>
        <svg className="whatsapp-icon" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </button>
      
      {/* Trust signals */}
      <div className="form-trust">
        <p>🔒 Tus datos están seguros</p>
        <p>📱 Respuesta en menos de 1 hora</p>
      </div>
    </form>
  );
}
```

### 2. USO EN PÁGINAS
```jsx
// pages/index.js - Homepage
import { SmartForm } from '@/components/SmartForm';

export default function Home() {
  return (
    <div>
      <h1>Viaja por Colombia</h1>
      <SmartForm 
        formId="homepage_general_form"
        redirectToWhatsApp={true}
      />
    </div>
  );
}

// pages/paquetes/[slug].js - Página de producto
export default function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <SmartForm 
        formId={`product_form_${product.slug}`}
        productId={product.id}
        productName={product.name}
        redirectToWhatsApp={true}
      />
    </div>
  );
}
```

### 3. API PARA GUARDAR LEADS
```javascript
// app/api/leads/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const data = await request.json();
  
  // Generar código único de tracking
  const trackingCode = `CT${Date.now().toString(36).toUpperCase()}`;
  
  // Guardar en base de datos con attribution
  const lead = {
    id: trackingCode,
    ...data,
    created_at: new Date().toISOString(),
    source: {
      client_id: data.attribution.client_id,
      utm_source: data.attribution.utm_source,
      utm_medium: data.attribution.utm_medium,
      utm_campaign: data.attribution.utm_campaign,
      landing_page: data.attribution.landing_page
    }
  };
  
  // Crear conversación en Chatwoot
  if (process.env.CHATWOOT_API_TOKEN) {
    await createChatwootConversation(lead);
  }
  
  // Opcional: Enviar a Google Sheets
  if (process.env.GOOGLE_SHEETS_ID) {
    await appendToGoogleSheet(lead);
  }
  
  return NextResponse.json({ 
    success: true, 
    trackingCode,
    message: 'Lead guardado correctamente'
  });
}
```

## 📊 RESULTADO FINAL

Con este tracking podrás ver:

1. **Formularios iniciados vs completados**
2. **En qué campo abandonan más**
3. **Tiempo promedio para completar**
4. **Tasa de conversión por tipo de formulario**
5. **ROI real cuando cierran la venta**

¿Necesitas ayuda para implementar algún tipo específico de formulario?