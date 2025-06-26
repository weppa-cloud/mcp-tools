# 🚀 IMPLEMENTACIÓN TRACKING EN WORDPRESS - PASO A PASO

## 📋 CHECKLIST RÁPIDO
- [ ] Instalar Google Tag Manager
- [ ] Agregar código a functions.php
- [ ] Configurar eventos en GA4
- [ ] Probar formularios
- [ ] Configurar webhook Chatwoot

## 🔧 PASO 1: INSTALAR GOOGLE TAG MANAGER (15 minutos)

### Opción A: Con Plugin (Recomendado)
1. **Instalar plugin GTM4WP**
   ```
   WordPress Admin → Plugins → Add New
   Buscar: "GTM4WP" o "Google Tag Manager for WordPress"
   Instalar y Activar
   ```

2. **Configurar el plugin**
   ```
   Settings → Google Tag Manager
   - Container ID: GTM-XXXXXX (tu ID)
   - Container code placement: Footer
   - ✓ Track forms
   - ✓ Track outbound clicks
   ```

### Opción B: Manual en header.php
```php
// En wp-content/themes/tu-tema/header.php
// Antes de </head>
?>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
<?php

// Justo después de <body>
?>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

## 🔧 PASO 2: AGREGAR CÓDIGO DE TRACKING (20 minutos)

### En functions.php o Plugin personalizado

```php
// wp-content/themes/tu-tema/functions.php
// O crear plugin: wp-content/plugins/colombiatours-tracking/colombiatours-tracking.php

/**
 * Plugin Name: Colombia Tours Tracking
 * Description: Tracking completo de formularios y conversiones
 * Version: 1.0
 */

// 1. AGREGAR SCRIPTS DE TRACKING
add_action('wp_footer', 'colombiatours_tracking_scripts', 100);
function colombiatours_tracking_scripts() {
    // Solo en frontend, no en admin
    if (is_admin()) return;
    ?>
    <script>
    // Colombia Tours - Tracking de Conversiones
    (function() {
        'use strict';
        
        // Variables globales
        let clientId = null;
        let formStarted = {};
        let startTime = {};
        
        // Esperar a que GA4 esté listo
        function waitForGA4(callback) {
            if (typeof gtag !== 'undefined') {
                callback();
            } else {
                setTimeout(() => waitForGA4(callback), 100);
            }
        }
        
        // Inicializar tracking
        waitForGA4(function() {
            // Obtener Client ID
            gtag('get', 'G-XXXXXXXXXX', 'client_id', function(cid) {
                clientId = cid;
                localStorage.setItem('colombiatours_ga4_client_id', cid);
                console.log('✅ GA4 Client ID:', cid);
            });
            
            // Capturar parámetros UTM
            const urlParams = new URLSearchParams(window.location.search);
            const attribution = {
                utm_source: urlParams.get('utm_source') || localStorage.getItem('ct_utm_source') || 'direct',
                utm_medium: urlParams.get('utm_medium') || localStorage.getItem('ct_utm_medium') || 'none',
                utm_campaign: urlParams.get('utm_campaign') || localStorage.getItem('ct_utm_campaign') || 'none',
                landing_page: window.location.href,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            };
            
            // Guardar UTMs en localStorage para persistencia
            if (urlParams.get('utm_source')) {
                localStorage.setItem('ct_utm_source', urlParams.get('utm_source'));
                localStorage.setItem('ct_utm_medium', urlParams.get('utm_medium') || 'none');
                localStorage.setItem('ct_utm_campaign', urlParams.get('utm_campaign') || 'none');
                localStorage.setItem('ct_landing_page', window.location.href);
            }
            
            // TRACKING DE FORMULARIOS
            document.addEventListener('DOMContentLoaded', function() {
                
                // 1. TRACKEAR TODOS LOS FORMULARIOS
                const forms = document.querySelectorAll('form');
                console.log(`📝 Found ${forms.length} forms to track`);
                
                forms.forEach((form, index) => {
                    // Asignar ID si no tiene
                    if (!form.id) {
                        form.id = 'form_' + index + '_' + window.location.pathname.replace(/\//g, '_');
                    }
                    
                    const formId = form.id;
                    
                    // Detectar tipo de formulario
                    let formType = 'generic';
                    if (form.classList.contains('wpcf7-form')) {
                        formType = 'contact_form_7';
                    } else if (form.classList.contains('gform_wrapper')) {
                        formType = 'gravity_forms';
                    } else if (form.action && form.action.includes('wa.me')) {
                        formType = 'whatsapp_form';
                    }
                    
                    // A. Cuando hacen foco en cualquier campo
                    form.addEventListener('focusin', function(e) {
                        if (!formStarted[formId]) {
                            formStarted[formId] = true;
                            startTime[formId] = Date.now();
                            
                            console.log('📊 Form Start:', formId);
                            
                            gtag('event', 'form_start', {
                                form_id: formId,
                                form_type: formType,
                                form_location: window.location.pathname,
                                form_name: form.getAttribute('name') || formId,
                                first_field: e.target.name || e.target.id
                            });
                        }
                    });
                    
                    // B. Tracking de progreso
                    const fields = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
                    let fieldsWithValue = 0;
                    
                    fields.forEach(field => {
                        field.addEventListener('change', function() {
                            if (this.value && this.value.trim() !== '') {
                                fieldsWithValue++;
                                const progress = Math.round((fieldsWithValue / fields.length) * 100);
                                
                                // Track hitos importantes
                                if (progress === 25 || progress === 50 || progress === 75) {
                                    gtag('event', 'form_progress', {
                                        form_id: formId,
                                        progress_percentage: progress,
                                        fields_completed: fieldsWithValue,
                                        total_fields: fields.length
                                    });
                                }
                            }
                        });
                        
                        // Track abandono de campos requeridos
                        if (field.hasAttribute('required')) {
                            field.addEventListener('blur', function() {
                                if (!this.value || this.value.trim() === '') {
                                    gtag('event', 'form_field_abandoned', {
                                        form_id: formId,
                                        field_name: this.name || this.id,
                                        field_type: this.type,
                                        is_required: true
                                    });
                                }
                            });
                        }
                    });
                    
                    // C. Cuando envían el formulario
                    form.addEventListener('submit', function(e) {
                        const formData = new FormData(this);
                        const timeSpent = startTime[formId] ? (Date.now() - startTime[formId]) / 1000 : 0;
                        
                        // Recopilar datos (sin información sensible)
                        const safeData = {};
                        for (let [key, value] of formData.entries()) {
                            if (!key.includes('password') && !key.includes('card')) {
                                safeData[key] = value ? 'filled' : 'empty';
                            }
                        }
                        
                        console.log('📊 Form Submit:', formId, safeData);
                        
                        // EVENTO PRINCIPAL: Lead generado
                        gtag('event', 'generate_lead', {
                            currency: 'USD',
                            value: 100, // Valor estimado del lead
                            form_id: formId,
                            form_type: formType,
                            form_name: this.getAttribute('name') || formId,
                            form_location: window.location.pathname,
                            time_to_complete: timeSpent,
                            // Attribution
                            client_id: clientId,
                            source: attribution.utm_source,
                            medium: attribution.utm_medium,
                            campaign: attribution.utm_campaign
                        });
                        
                        // Guardar datos para WhatsApp
                        const leadData = {
                            form_id: formId,
                            client_id: clientId,
                            ...attribution,
                            form_data: Object.fromEntries(formData),
                            submitted_at: new Date().toISOString()
                        };
                        
                        sessionStorage.setItem('colombiatours_last_lead', JSON.stringify(leadData));
                        
                        // Si es formulario que redirige a WhatsApp
                        if (formType === 'whatsapp_form' || this.action.includes('wa.me')) {
                            e.preventDefault();
                            
                            // Enviar datos al servidor primero
                            fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: new URLSearchParams({
                                    action: 'colombiatours_save_lead',
                                    lead_data: JSON.stringify(leadData),
                                    nonce: '<?php echo wp_create_nonce('colombiatours_nonce'); ?>'
                                })
                            }).then(() => {
                                // Construir URL de WhatsApp
                                const name = formData.get('name') || formData.get('nombre') || '';
                                const destination = formData.get('destination') || formData.get('destino') || '';
                                const message = `Hola! Soy ${name}. Me interesa viajar a ${destination}. Mi código: ${clientId}`;
                                
                                // Redirigir a WhatsApp
                                setTimeout(() => {
                                    window.location.href = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`;
                                }, 500);
                            });
                        }
                    });
                });
                
                // 2. TRACKING DE CLICKS EN WHATSAPP
                const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
                console.log(`📱 Found ${whatsappLinks.length} WhatsApp links`);
                
                whatsappLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        const buttonText = this.innerText || this.getAttribute('aria-label') || 'WhatsApp';
                        const context = this.closest('section')?.className || 'general';
                        
                        gtag('event', 'whatsapp_click', {
                            button_text: buttonText,
                            click_context: context,
                            page_location: window.location.pathname,
                            destination_url: this.href,
                            client_id: clientId,
                            source: attribution.utm_source
                        });
                        
                        // No prevenir default, dejar que siga el link
                    });
                });
                
                // 3. TRACKING DE CTAs IMPORTANTES
                const ctaButtons = document.querySelectorAll('.cta, .btn-primary, [data-track]');
                ctaButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const action = this.getAttribute('data-track') || this.innerText;
                        gtag('event', 'cta_click', {
                            cta_text: action,
                            cta_location: window.location.pathname,
                            cta_class: this.className
                        });
                    });
                });
            });
        });
    })();
    </script>
    <?php
}

// 2. AJAX HANDLER PARA GUARDAR LEADS
add_action('wp_ajax_colombiatours_save_lead', 'colombiatours_save_lead');
add_action('wp_ajax_nopriv_colombiatours_save_lead', 'colombiatours_save_lead');

function colombiatours_save_lead() {
    // Verificar nonce
    if (!wp_verify_nonce($_POST['nonce'], 'colombiatours_nonce')) {
        wp_die('Security check failed');
    }
    
    $lead_data = json_decode(stripslashes($_POST['lead_data']), true);
    
    // Guardar en base de datos
    global $wpdb;
    $table_name = $wpdb->prefix . 'colombiatours_leads';
    
    $wpdb->insert($table_name, [
        'client_id' => $lead_data['client_id'],
        'form_id' => $lead_data['form_id'],
        'utm_source' => $lead_data['utm_source'],
        'utm_medium' => $lead_data['utm_medium'],
        'utm_campaign' => $lead_data['utm_campaign'],
        'form_data' => json_encode($lead_data['form_data']),
        'created_at' => current_time('mysql')
    ]);
    
    // Opcional: Enviar a Google Sheets o CRM
    // colombiatours_send_to_sheets($lead_data);
    
    wp_send_json_success(['lead_id' => $wpdb->insert_id]);
}

// 3. SHORTCODE PARA FORMULARIOS CON TRACKING
add_shortcode('colombiatours_form', 'colombiatours_tracked_form');

function colombiatours_tracked_form($atts) {
    $atts = shortcode_atts([
        'id' => 'contact_form',
        'destination' => '',
        'button_text' => 'Solicitar Cotización por WhatsApp'
    ], $atts);
    
    ob_start();
    ?>
    <form id="<?php echo esc_attr($atts['id']); ?>" class="colombiatours-form" data-track="true">
        <div class="form-group">
            <label for="ct_name">Nombre completo *</label>
            <input type="text" id="ct_name" name="name" required>
        </div>
        
        <div class="form-group">
            <label for="ct_whatsapp">WhatsApp *</label>
            <input type="tel" id="ct_whatsapp" name="whatsapp" required>
        </div>
        
        <div class="form-group">
            <label for="ct_email">Email *</label>
            <input type="email" id="ct_email" name="email" required>
        </div>
        
        <?php if (!$atts['destination']): ?>
        <div class="form-group">
            <label for="ct_destination">¿A dónde quieres viajar?</label>
            <select id="ct_destination" name="destination">
                <option value="">Selecciona destino</option>
                <option value="cartagena">Cartagena</option>
                <option value="medellin">Medellín</option>
                <option value="eje-cafetero">Eje Cafetero</option>
                <option value="san-andres">San Andrés</option>
            </select>
        </div>
        <?php else: ?>
        <input type="hidden" name="destination" value="<?php echo esc_attr($atts['destination']); ?>">
        <?php endif; ?>
        
        <button type="submit" class="btn-whatsapp">
            <?php echo esc_html($atts['button_text']); ?>
        </button>
    </form>
    <?php
    return ob_get_clean();
}

// 4. CREAR TABLA PARA LEADS
register_activation_hook(__FILE__, 'colombiatours_create_leads_table');

function colombiatours_create_leads_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'colombiatours_leads';
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        client_id varchar(255) NOT NULL,
        form_id varchar(255) NOT NULL,
        utm_source varchar(255),
        utm_medium varchar(255),
        utm_campaign varchar(255),
        form_data longtext,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY client_id (client_id),
        KEY created_at (created_at)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
```

## 🔧 PASO 3: CONFIGURAR GOOGLE TAG MANAGER (10 minutos)

1. **Entrar a GTM**
   ```
   https://tagmanager.google.com
   → Tu contenedor
   ```

2. **Crear Variables**
   ```
   Variables → Nueva → Variable de JavaScript personalizada
   Nombre: GA4 Client ID
   Código: function() { return localStorage.getItem('colombiatours_ga4_client_id'); }
   ```

3. **Crear Triggers**
   ```
   Triggers → Nuevo → Evento personalizado
   Nombre: Form Start
   Evento: form_start
   
   Triggers → Nuevo → Evento personalizado  
   Nombre: Lead Generated
   Evento: generate_lead
   ```

4. **Crear Tags**
   ```
   Tags → Nuevo → GA4 Event
   Nombre: Track Form Start
   Event Name: form_start
   Trigger: Form Start
   
   Tags → Nuevo → GA4 Event
   Nombre: Track Lead
   Event Name: generate_lead
   Event Parameters:
   - value: {{Event Value}}
   - currency: USD
   Trigger: Lead Generated
   ```

## 🔧 PASO 4: WEBHOOK PARA CHATWOOT (15 minutos)

```php
// Agregar a functions.php o plugin

// Endpoint para webhook de Chatwoot
add_action('rest_api_init', function () {
    register_rest_route('colombiatours/v1', '/chatwoot-webhook', [
        'methods' => 'POST',
        'callback' => 'handle_chatwoot_webhook',
        'permission_callback' => '__return_true'
    ]);
});

function handle_chatwoot_webhook($request) {
    $data = $request->get_json_params();
    
    // Log para debug
    error_log('Chatwoot webhook: ' . json_encode($data));
    
    // Verificar si es una venta
    if ($data['event'] === 'conversation_status_changed' && 
        $data['status'] === 'resolved' &&
        isset($data['custom_attributes']['sale_completed']) &&
        $data['custom_attributes']['sale_completed'] === true) {
        
        // Obtener client ID
        $client_id = $data['custom_attributes']['ga4_client_id'] ?? 'chatwoot_' . $data['conversation']['id'];
        
        // Enviar conversión a GA4
        $measurement_id = 'G-XXXXXXXXXX'; // Tu ID
        $api_secret = 'TU_API_SECRET'; // Crear en GA4
        
        $event_data = [
            'client_id' => $client_id,
            'events' => [[
                'name' => 'purchase',
                'params' => [
                    'currency' => 'USD',
                    'value' => floatval($data['custom_attributes']['sale_value'] ?? 0),
                    'transaction_id' => 'WA_' . $data['conversation']['id'],
                    'items' => [[
                        'item_id' => $data['custom_attributes']['product_id'] ?? 'tour',
                        'item_name' => $data['custom_attributes']['product_name'] ?? 'Tour Package',
                        'price' => floatval($data['custom_attributes']['sale_value'] ?? 0),
                        'quantity' => 1
                    ]]
                ]
            ]]
        ];
        
        // Enviar a GA4
        wp_remote_post(
            "https://www.google-analytics.com/mp/collect?measurement_id={$measurement_id}&api_secret={$api_secret}",
            [
                'body' => json_encode($event_data),
                'headers' => ['Content-Type' => 'application/json'],
                'timeout' => 30
            ]
        );
        
        // Guardar en base de datos
        global $wpdb;
        $wpdb->insert($wpdb->prefix . 'colombiatours_conversions', [
            'conversation_id' => $data['conversation']['id'],
            'client_id' => $client_id,
            'sale_value' => $data['custom_attributes']['sale_value'],
            'product_name' => $data['custom_attributes']['product_name'],
            'created_at' => current_time('mysql')
        ]);
    }
    
    return ['success' => true];
}
```

## 🔧 PASO 5: PROBAR TODO (10 minutos)

### 1. Verificar en Console
```javascript
// Abrir Chrome DevTools (F12) → Console
// Deberías ver:
"✅ GA4 Client ID: 1234567890.1234567890"
"📝 Found 3 forms to track"
"📱 Found 5 WhatsApp links"
```

### 2. Probar un formulario
1. Hacer click en cualquier campo
2. Ver en GA4 DebugView: `form_start`
3. Llenar y enviar
4. Ver en GA4 DebugView: `generate_lead`

### 3. Verificar webhook
```bash
# URL del webhook
https://tudominio.com/wp-json/colombiatours/v1/chatwoot-webhook

# Probar con curl
curl -X POST https://tudominio.com/wp-json/colombiatours/v1/chatwoot-webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"conversation_status_changed","status":"resolved","custom_attributes":{"sale_completed":true,"sale_value":500}}'
```

## 📊 RESULTADO FINAL

En GA4 verás:
1. **Eventos en tiempo real** cuando interactúan con formularios
2. **Embudos completos** desde vista → formulario → WhatsApp → venta
3. **ROI real** por campaña cuando cierran ventas

## 🆘 TROUBLESHOOTING

### Si no funciona:
1. **Verificar que GTM está instalado**: Ver página fuente, buscar "GTM-"
2. **Client ID no aparece**: Verificar ID de GA4 en el código
3. **Eventos no llegan**: Activar DebugView en GA4
4. **Webhook falla**: Ver logs en WP: `wp-content/debug.log`

---

¿Necesitas ayuda con algún paso específico?