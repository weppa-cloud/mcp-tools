# Guía de Configuración de Tracking de Eventos para Funnel de Conversión

## 1. Eventos del Funnel a Configurar

### Paso 1: Homepage Visit
- **Evento**: `page_view`
- **Parámetros**: 
  - `page_location`: URL completa
  - `page_path`: `/`
  - `page_title`: Título de la página

### Paso 2: Product/Service Page View
- **Evento**: `view_item`
- **Parámetros**:
  - `item_id`: ID del producto/servicio
  - `item_name`: Nombre del producto
  - `item_category`: Categoría
  - `value`: Precio del producto

### Paso 3: Form Submission
- **Evento**: `form_submit`
- **Parámetros**:
  - `form_name`: Nombre del formulario
  - `form_destination`: URL de destino
  - `form_submit_text`: Texto del botón

### Paso 4: Purchase/Conversion Final
- **Evento**: `purchase`
- **Parámetros**:
  - `transaction_id`: ID única de transacción
  - `value`: Valor total
  - `currency`: Moneda (ej: USD)
  - `items`: Array de productos

## 2. Implementación con Google Tag Manager (GTM)

### A. Configuración Inicial

1. **Instalar GTM en tu sitio**:
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### B. Configurar Variables en GTM

1. **Variable de GA4 Configuration**:
   - Tipo: Google Analytics: GA4 Configuration
   - Measurement ID: G-XXXXXXXXX
   - Enviar evento de página vista: No

### C. Crear Triggers (Activadores)

1. **Homepage View Trigger**:
   - Tipo: Page View
   - Condición: Page Path equals `/`

2. **Product View Trigger**:
   - Tipo: Page View
   - Condición: Page Path contains `/product/` o `/service/`

3. **Form Submit Trigger**:
   - Tipo: Form Submission
   - Condición: Form ID equals `contact-form` (ajustar según tu formulario)

4. **Purchase Trigger**:
   - Tipo: Custom Event
   - Nombre del evento: `purchase_complete`

### D. Crear Tags para cada evento

1. **Tag: Homepage View**:
   - Tipo: Google Analytics: GA4 Event
   - Configuration Tag: {{GA4 Configuration}}
   - Event Name: `page_view`
   - Event Parameters:
     - `page_path`: `/`
     - `page_title`: {{Page Title}}

2. **Tag: Product View**:
   - Tipo: Google Analytics: GA4 Event
   - Event Name: `view_item`
   - Event Parameters:
     - `item_name`: {{Product Name}}
     - `item_category`: {{Product Category}}
     - `value`: {{Product Price}}

3. **Tag: Form Submit**:
   - Tipo: Google Analytics: GA4 Event
   - Event Name: `form_submit`
   - Event Parameters:
     - `form_name`: {{Form Name}}
     - `form_destination`: {{Form URL}}

4. **Tag: Purchase**:
   - Tipo: Google Analytics: GA4 Event
   - Event Name: `purchase`
   - Event Parameters:
     - `transaction_id`: {{Transaction ID}}
     - `value`: {{Purchase Value}}
     - `currency`: `USD`

## 3. Implementación Directa con gtag.js

Si prefieres implementar directamente sin GTM:

### A. Instalar gtag.js
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXX');
</script>
```

### B. Código para cada evento

```javascript
// 1. Homepage Visit (se trackea automáticamente con page_view)

// 2. Product/Service View
gtag('event', 'view_item', {
  currency: 'USD',
  value: 29.99,
  items: [{
    item_id: 'SKU123',
    item_name: 'Product Name',
    item_category: 'Category',
    price: 29.99,
    quantity: 1
  }]
});

// 3. Form Submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
  gtag('event', 'form_submit', {
    form_name: 'contact_form',
    form_destination: window.location.href,
    form_submit_text: e.target.querySelector('[type="submit"]').textContent
  });
});

// 4. Purchase/Conversion
gtag('event', 'purchase', {
  transaction_id: '12345',
  value: 99.99,
  currency: 'USD',
  tax: 8.99,
  shipping: 5.00,
  items: [{
    item_id: 'SKU123',
    item_name: 'Product Name',
    item_category: 'Category',
    price: 99.99,
    quantity: 1
  }]
});
```

## 4. Configurar Conversiones en GA4

1. Ve a tu propiedad de GA4
2. Navega a Admin > Events
3. Marca como conversión:
   - `form_submit`
   - `purchase`
   - Cualquier otro evento importante

## 5. Crear el Funnel en GA4

1. Ve a Reports > Engagement > Funnel exploration
2. Crea un nuevo funnel con estos pasos:
   - Step 1: `page_view` donde `page_path = /`
   - Step 2: `view_item`
   - Step 3: `form_submit`
   - Step 4: `purchase`

## 6. Testing y Validación

### A. Usar GA4 DebugView
1. Instala Google Analytics Debugger extension
2. Ve a Admin > DebugView en GA4
3. Navega por tu sitio y verifica que los eventos se disparan

### B. Usar GTM Preview Mode
1. En GTM, click en "Preview"
2. Navega por tu sitio
3. Verifica que los tags se disparan correctamente

## 7. Código de Ejemplo para tu Sitio

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXX', {
        send_page_view: true
      });
    </script>
</head>
<body>
    <!-- Tu contenido -->
    
    <script>
    // Tracking helper functions
    function trackProductView(productData) {
        gtag('event', 'view_item', {
            currency: 'USD',
            value: productData.price,
            items: [{
                item_id: productData.id,
                item_name: productData.name,
                item_category: productData.category,
                price: productData.price,
                quantity: 1
            }]
        });
    }
    
    function trackFormSubmit(formName) {
        gtag('event', 'form_submit', {
            form_name: formName,
            form_destination: window.location.href,
            value: 1
        });
    }
    
    function trackPurchase(orderData) {
        gtag('event', 'purchase', {
            transaction_id: orderData.id,
            value: orderData.total,
            currency: 'USD',
            items: orderData.items
        });
    }
    </script>
</body>
</html>
```

## 8. Monitoreo Post-Implementación

### Métricas a revisar después de 24-48 horas:
1. **Eventos por usuario**: ¿Se están disparando correctamente?
2. **Tasa de conversión del funnel**: ¿Dónde hay mayor drop-off?
3. **Eventos duplicados**: Verificar que no haya disparos múltiples

### Dashboard recomendado:
- Crear una exploración de embudo personalizada
- Añadir segmentos por fuente de tráfico
- Comparar comportamiento móvil vs desktop

## 9. Troubleshooting Común

### Problema: Eventos no aparecen en GA4
- Verificar que el Measurement ID es correcto
- Esperar 24 horas para data processing
- Usar DebugView para verificación en tiempo real

### Problema: Eventos duplicados
- Revisar que no haya múltiples instalaciones de GA4
- Verificar triggers en GTM
- Usar `once: true` en event listeners

### Problema: Valores incorrectos
- Asegurar que los valores numéricos no sean strings
- Verificar currency format
- Validar que transaction_id sea único

## 10. Próximos Pasos

1. Implementar el código en tu sitio
2. Probar cada evento individualmente
3. Esperar 24-48 horas para recolectar datos
4. Volver a ejecutar el análisis de funnel con datos reales
5. Optimizar basándose en los puntos de fricción identificados