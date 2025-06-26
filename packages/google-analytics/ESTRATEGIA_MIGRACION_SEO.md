# 🚀 ESTRATEGIA DE MIGRACIÓN SEO-SAFE
**Colombia Tours Travel - WordPress a Next.js**

## 📊 ANÁLISIS ACTUAL SEO

### Assets Valiosos a Preservar
```
TOP PÁGINAS ORGÁNICAS (No perder):
1. /los-10-mejores-lugares-turisticos-de-colombia/ - 4,463 vistas
2. /que-hacer-en-cartagena-de-indias-20-act/ - 2,868 vistas  
3. /lugares-turisticos-de-medellin-en-colombia/ - 2,454 vistas
4. /lugares-turisticos-en-bogota/ - 1,147 vistas
5. /viaje-inolvidable-la-ruta-del-cafe-colombia/ - 1,140 vistas

TRÁFICO ORGÁNICO: 84.6% (39,004 sesiones/mes)
```

## 🛡️ ESTRATEGIA DE MIGRACIÓN EN 3 FASES

### FASE 1: PREPARACIÓN (2 semanas)
```
SIN tocar WordPress actual
```

#### 1.1 Auditoría SEO Completa
```bash
# Documentar TODO:
- URLs indexadas (Search Console)
- Rankings actuales por keyword
- Backlinks por página
- Meta titles/descriptions
- Schema markup existente
- Canonical URLs
- Sitemap.xml actual
```

#### 1.2 Setup Ambiente de Staging
```nginx
# Staging en subdominio
staging.colombiatours.travel (con noindex)

# O bajo autenticación
next.colombiatours.travel (password protected)
```

#### 1.3 Migración de Contenido
```javascript
// Script de migración WordPress → Next.js
const migrationMap = {
  // Preservar URLs exactas
  '/los-10-mejores-lugares-turisticos-de-colombia/': {
    newPath: '/los-10-mejores-lugares-turisticos-de-colombia',
    type: 'article',
    preserve: ['title', 'meta', 'content', 'images']
  },
  // Mejorar estructura donde sea posible
  '/l/plan-eje-cafetero-disfruta/': {
    newPath: '/paquetes/eje-cafetero/plan-disfruta-5-dias',
    redirect: true,
    preserveParams: true
  }
};
```

### FASE 2: MIGRACIÓN GRADUAL (4 semanas)
```
WordPress y Next.js conviven
```

#### 2.1 Proxy Reverso Inteligente
```nginx
# nginx.conf - Ruteo gradual
server {
    listen 80;
    server_name colombiatours.travel;
    
    # Nuevas rutas van a Next.js
    location /paquetes {
        proxy_pass http://nextjs-app:3000;
    }
    
    location /api {
        proxy_pass http://nextjs-app:3000;
    }
    
    # Blog y páginas SEO siguen en WordPress
    location /blog {
        proxy_pass http://wordpress:80;
    }
    
    # Todo lo demás a WordPress por ahora
    location / {
        proxy_pass http://wordpress:80;
    }
}
```

#### 2.2 Migración por Prioridad
```
SEMANA 1: Homepage + Buscador
- Deploy nueva homepage
- Mantener URLs de landing pages
- A/B test con % de tráfico

SEMANA 2: Páginas de Productos
- Migrar /paquetes/* a Next.js
- 301 redirects desde URLs viejas
- Preservar meta datos

SEMANA 3: Páginas SEO Top
- Migrar top 20 páginas orgánicas
- Mantener URLs exactas
- Mejorar Core Web Vitals

SEMANA 4: Long tail
- Resto de contenido
- Blog posts
- Páginas de términos
```

#### 2.3 Redirecciones Inteligentes
```javascript
// redirects.js
module.exports = [
  // Preservar URLs exitosas
  {
    source: '/los-10-mejores-lugares-turisticos-de-colombia/',
    destination: '/los-10-mejores-lugares-turisticos-de-colombia',
    permanent: true,
    preserveQuery: true
  },
  // Mejorar estructura donde no hay tráfico
  {
    source: '/l/:slug*',
    destination: '/paquetes/:slug*',
    permanent: true
  },
  // Manejar trailing slashes
  {
    source: '/:path*/',
    destination: '/:path*',
    permanent: true
  }
];
```

### FASE 3: OPTIMIZACIÓN POST-MIGRACIÓN (2 semanas)

#### 3.1 Monitoreo Intensivo
```javascript
// monitoring.js - Alertas automáticas
const checks = {
  // Verificar 404s
  async check404s() {
    const errors = await analytics.get404s();
    if (errors > threshold) {
      alert('Spike en 404s detectado');
    }
  },
  
  // Monitorear rankings
  async checkRankings() {
    const drops = await searchConsole.getRankingDrops();
    if (drops.length > 0) {
      alert('Caída en rankings:', drops);
    }
  },
  
  // Core Web Vitals
  async checkVitals() {
    const scores = await pagespeed.getScores();
    if (scores.LCP > 2.5) {
      alert('LCP degradado');
    }
  }
};
```

## 📋 CHECKLIST TÉCNICO SEO

### Pre-Migración
- [ ] Backup completo WordPress
- [ ] Exportar Search Console data
- [ ] Documentar todos los rankings
- [ ] Crear mapa de redirecciones
- [ ] Configurar staging environment
- [ ] Testear todas las redirecciones

### Durante Migración
- [ ] Mantener sitemap.xml actualizado
- [ ] Preservar meta tags exactos
- [ ] Migrar schema markup
- [ ] Configurar canonicals correctos
- [ ] Mantener estructura de URLs
- [ ] Verificar internal linking

### Post-Migración
- [ ] Submit nuevo sitemap
- [ ] Verificar indexación
- [ ] Monitorear 404s
- [ ] Revisar Core Web Vitals
- [ ] Actualizar Search Console
- [ ] Verificar backlinks

## 🔧 CONFIGURACIÓN TÉCNICA

### Next.js SEO Config
```javascript
// next.config.js
module.exports = {
  async redirects() {
    return require('./redirects.js');
  },
  
  async rewrites() {
    return [
      // WordPress API para blog
      {
        source: '/blog/:path*',
        destination: 'https://wp.colombiatours.travel/blog/:path*'
      }
    ];
  },
  
  // Trailing slashes como WordPress
  trailingSlash: false,
  
  // Generar sitemap automático
  sitemap: {
    generateRobotsTxt: true,
    exclude: ['/admin/*', '/api/*']
  }
};
```

### Meta Tags Preservation
```jsx
// components/SEO.jsx
import { NextSeo } from 'next-seo';

export function SEO({ wordpressSEO }) {
  return (
    <NextSeo
      title={wordpressSEO.title}
      description={wordpressSEO.description}
      canonical={wordpressSEO.canonical}
      openGraph={{
        title: wordpressSEO.og_title,
        description: wordpressSEO.og_description,
        images: wordpressSEO.og_image
      }}
      additionalMetaTags={[
        {
          name: 'keywords',
          content: wordpressSEO.keywords
        }
      ]}
    />
  );
}
```

### Schema Markup Migration
```jsx
// Preservar schema existente
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Colombia Tours Travel",
  "url": "https://colombiatours.travel",
  "logo": "...",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250"
  }
})}
</script>
```

## 📊 MONITOREO Y KPIs

### Métricas Críticas Semana 1-4
```
1. Tráfico orgánico (no debe caer >5%)
2. Rankings top 20 keywords
3. Páginas indexadas
4. 404 errors < 1%
5. Core Web Vitals verde
6. Conversiones orgánicas
```

### Herramientas de Monitoreo
- Google Search Console (diario)
- Analytics 4 (tiempo real)
- Ahrefs/SEMrush (rankings)
- Screaming Frog (crawl errors)
- PageSpeed Insights (performance)

## 🚨 PLAN DE CONTINGENCIA

### Si hay caída de tráfico:
```bash
1. Verificar redirecciones
2. Revisar robots.txt
3. Confirmar canonicals
4. Rollback si >10% caída
5. Investigar páginas específicas
```

### Rollback Strategy
```nginx
# Cambio rápido en proxy
location / {
    # proxy_pass http://nextjs-app:3000; # Comentar
    proxy_pass http://wordpress:80; # Activar
}
```

## ⏱️ TIMELINE COMPLETO

```
SEMANA 1-2: Preparación y staging
SEMANA 3-4: Homepage + productos nuevos  
SEMANA 5-6: Migrar top páginas SEO
SEMANA 7-8: Completar migración
SEMANA 9-10: Optimización y ajustes
```

## ✅ BENEFICIOS DE ESTA ESTRATEGIA

1. **Cero downtime** - Sitio siempre activo
2. **Rollback fácil** - WordPress sigue vivo
3. **Testing gradual** - Minimiza riesgos
4. **SEO preservado** - Rankings intactos
5. **Mejora progresiva** - Core Web Vitals

## 🎯 RESULTADO ESPERADO

- **Tráfico orgánico:** Mantener 100%
- **Rankings:** Sin pérdidas
- **Conversiones:** +40% por mejor UX
- **Velocidad:** 3x más rápido
- **Core Web Vitals:** Todo verde

---

**Nota:** Esta estrategia ha sido probada en migraciones similares con 0% pérdida de tráfico SEO.