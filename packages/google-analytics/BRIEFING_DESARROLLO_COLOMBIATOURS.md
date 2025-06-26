# 📋 BRIEFING DE DESARROLLO - COLOMBIA TOURS TRAVEL

**Cliente:** Colombia Tours Travel  
**Proyecto:** Rediseño completo con integración CRM  
**Stack:** Next.js + API CRM  
**Fecha:** Junio 2024

## 🎯 OBJETIVO DEL PROYECTO

Crear una plataforma moderna que conecte el catálogo real de productos del CRM con una experiencia de usuario optimizada para conversión, manteniendo el flujo actual WordPress → WhatsApp pero agregando trazabilidad completa.

## 📊 CONTEXTO DEL NEGOCIO

### Modelo Actual
- **B2B2C:** Conectan agentes de viajes con viajeros
- **Conversión:** Formulario → WhatsApp → Cotización → Venta
- **Problema:** Sin tracking después del formulario
- **Ticket promedio:** $800-2,500 USD por paquete

### Métricas Actuales
- 46,000 sesiones/mes
- 95% conversión en páginas de planes específicos
- 1% conversión en homepage
- 70% tráfico móvil
- México (20%), Colombia (9%), España (5%)

## 🏗️ ARQUITECTURA TÉCNICA

### Frontend (Next.js 14+)
```
/
├── app/
│   ├── (marketing)/          # Páginas SEO
│   │   ├── page.tsx          # Homepage
│   │   ├── destinos/         # Catálogo dinámico
│   │   └── blog/             # Contenido SEO
│   ├── (booking)/            # Flujo de reserva
│   │   ├── buscar/           # Buscador
│   │   ├── paquete/[id]/     # Detalle producto
│   │   └── cotizar/          # Pre-cotización
│   └── api/                  # API routes
├── components/
│   ├── search/               # Buscador inteligente
│   ├── products/             # Cards de productos
│   ├── forms/                # Formularios
│   └── tracking/             # Analytics
└── lib/
    ├── crm/                  # Integración CRM
    ├── analytics/            # GA4 + Attribution
    └── whatsapp/             # Chatwoot
```

### Integraciones Requeridas
1. **CRM API** (productos, precios, disponibilidad)
2. **Chatwoot** (WhatsApp + attribution)
3. **Google Analytics 4** (tracking completo)
4. **Facebook Pixel** (remarketing)
5. **Google Tag Manager**

## 🎨 DISEÑO Y UX

### Principios de Diseño
1. **Mobile First** (70% del tráfico)
2. **Conversión sobre estética**
3. **Velocidad < 3 segundos**
4. **Accesibilidad AA**
5. **Trust signals prominentes**

### Componentes Críticos

#### 1. Homepage Hero
```jsx
<HeroSection>
  - Buscador inteligente (destino, fechas, personas)
  - Destinos populares (México, Cartagena, Eje Cafetero)
  - Trust badges (# clientes, certificaciones)
  - CTA principal: "Diseña tu viaje"
</HeroSection>
```

#### 2. Buscador Inteligente
```jsx
<SearchWidget>
  - Autocompletado con destinos del CRM
  - Filtros: presupuesto, duración, tipo viaje
  - Sugerencias basadas en búsquedas
  - Vista previa de resultados
</SearchWidget>
```

#### 3. Cards de Productos
```jsx
<ProductCard>
  - Imagen hero + galería
  - Precio "desde" del CRM
  - Duración y highlights
  - Disponibilidad en tiempo real
  - Reviews/ratings
  - CTA: "Ver detalles" y "WhatsApp directo"
</ProductCard>
```

#### 4. Página de Producto
```jsx
<ProductDetail>
  - Galería inmersiva
  - Itinerario día por día
  - Incluye/No incluye
  - Precios por temporada
  - Calculadora de precio (# personas)
  - Reviews verificados
  - FAQ específica del tour
  - Formulario de contacto contextual
  - Urgencia: "3 personas viendo"
</ProductDetail>
```

#### 5. Formularios Optimizados
```jsx
<SmartForm>
  PASO 1 (en página):
  - Nombre
  - WhatsApp
  - Email
  
  PASO 2 (en WhatsApp):
  - Fechas específicas
  - Número de personas
  - Presupuesto
  - Necesidades especiales
</SmartForm>
```

## 🔄 FLUJOS DE CONVERSIÓN

### Flujo Principal
```mermaid
Usuario → Busca destino → Ve opciones → 
Selecciona tour → Lee detalles → 
Llena formulario → WhatsApp → 
Recibe cotización → Compra
```

### Flujos Alternativos
1. **Directo:** Landing → WhatsApp button
2. **Research:** Blog → Productos relacionados → Formulario
3. **Remarketing:** Email → Oferta especial → WhatsApp

## 📱 TRACKING Y ANALYTICS

### Eventos Críticos a Implementar
```javascript
// 1. Búsqueda
gtag('event', 'search', {
  search_term: 'Cartagena',
  results_count: 15
});

// 2. Vista de producto
gtag('event', 'view_item', {
  item_id: 'eje-cafetero-5d',
  item_name: 'Eje Cafetero 5 días',
  price: 450,
  currency: 'USD'
});

// 3. Inicio de formulario
gtag('event', 'form_start', {
  form_id: 'contact_whatsapp',
  product_id: 'eje-cafetero-5d'
});

// 4. Formulario enviado con attribution
gtag('event', 'generate_lead', {
  value: 450,
  currency: 'USD',
  lead_source: 'product_page',
  attribution_data: {
    client_id: GA_CLIENT_ID,
    utm_source: utm_source,
    utm_medium: utm_medium,
    landing_page: window.location.href
  }
});

// 5. Conversión WhatsApp (via webhook)
gtag('event', 'purchase', {
  transaction_id: 'WA_12345',
  value: 450,
  currency: 'USD',
  original_client_id: stored_client_id
});
```

## 🚀 FEATURES PRIORITARIAS

### MVP (Mes 1)
1. ✅ Homepage con buscador
2. ✅ Catálogo dinámico del CRM
3. ✅ Páginas de producto
4. ✅ Formularios con tracking
5. ✅ Integración WhatsApp
6. ✅ Analytics básico

### Fase 2 (Mes 2)
7. 🔄 Cotizador online
8. 🔄 Sistema de reviews
9. 🔄 Blog integrado
10. 🔄 Multi-idioma (ES/EN)

### Fase 3 (Mes 3)
11. 📅 Calendario de disponibilidad
12. 📅 Portal de agentes B2B
13. 📅 Pagos online parciales
14. 📅 App móvil PWA

## 💻 ESPECIFICACIONES TÉCNICAS

### Performance
- Lighthouse Score > 90
- Core Web Vitals: Verde
- TTI < 3 segundos
- Imágenes: WebP con lazy loading

### SEO
- URLs limpias: `/destinos/cartagena/tour-islas-4-dias`
- Schema markup para tours
- Meta tags dinámicos
- Sitemap automático
- Blog con markdown

### Seguridad
- HTTPS obligatorio
- Rate limiting en formularios
- Validación de inputs
- CORS configurado
- Environment variables seguros

### CRM API Requirements
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  destination: string;
  duration: number;
  price: {
    from: number;
    currency: string;
    season: 'high' | 'low';
  };
  availability: Date[];
  images: string[];
  itinerary: Day[];
  includes: string[];
  excludes: string[];
}

interface Quote {
  productId: string;
  startDate: Date;
  people: number;
  totalPrice: number;
  breakdown: PriceBreakdown;
}
```

## 📐 COMPONENTES DE CONVERSIÓN

### Trust Elements
- Testimonios con foto
- Certificaciones (MinTurismo)
- Contador de viajeros
- Garantías (mejor precio, cancelación)
- Chat en vivo
- Reviews de Google

### Urgencia y Escasez
- "3 personas viendo este tour"
- "Últimos 2 cupos para fecha X"
- "Precio especial termina en 48h"
- "Tour más vendido del mes"

### Social Proof
- Instagram feed integration
- Video testimoniales
- Fotos de viajeros reales
- Mentions en medios

## 🎯 MÉTRICAS DE ÉXITO

### KPIs Principales
1. **Conversión Homepage:** 1% → 5%
2. **Conversión Productos:** 95% → 97%
3. **Duración sesión FB:** 8s → 60s+
4. **Form completion:** +40%
5. **WhatsApp response rate:** +30%

### Tracking Success
- Dashboard en tiempo real
- Alertas de conversión
- Reportes semanales
- A/B testing continuo

## 📦 ENTREGABLES

### Mes 1
1. Diseño completo en Figma
2. Prototipo funcional
3. Integración CRM básica
4. Homepage + 10 productos
5. Tracking implementado

### Mes 2
6. Catálogo completo
7. Blog migrado
8. Formularios A/B tested
9. Performance optimizado
10. Multi-device tested

### Mes 3
11. Features adicionales
12. Documentación completa
13. Capacitación equipo
14. Handoff técnico
15. Monitoreo 30 días

## 🤝 COLABORACIÓN

### Necesitamos del cliente
1. Acceso API del CRM
2. Contenido (fotos HD, textos)
3. Acceso a Analytics/Tag Manager
4. Brand guidelines
5. Feedback semanal

### Equipo requerido
- 1 Product Designer UI/UX
- 1 Frontend Dev (Next.js senior)
- 1 Backend Dev (integraciones)
- 1 QA Tester
- 1 Project Manager

## 💡 RECOMENDACIONES ADICIONALES

1. **Implementar desde día 1:** Sistema de cache para API del CRM
2. **Considerar:** CDN para imágenes (Cloudinary)
3. **Preparar:** Estructura para multiidioma
4. **Documentar:** Todos los eventos de tracking
5. **Testear:** Con usuarios reales cada sprint

---

**Próximo paso:** Validar acceso a API del CRM y comenzar diseño de wireframes.

**Contacto técnico:** [Agregar contacto del CRM]  
**Documentación API:** [Agregar link a docs]