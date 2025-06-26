# 🚀 FLUJO DE IMPLEMENTACIÓN PASO A PASO

## 📅 SEMANA 0: PREPARACIÓN (No tocamos nada en producción)

### Día 1-2: Setup Inicial
```bash
# 1. Clonar WordPress actual
mysqldump -u root -p colombiatours > backup_completo.sql
tar -czf wordpress_files.tar.gz /var/www/wordpress/

# 2. Crear ambiente de desarrollo
git clone https://github.com/colombiatours/nextjs-app
cd nextjs-app
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Agregar:
# - WORDPRESS_API_URL
# - CRM_API_KEY
# - GA_MEASUREMENT_ID
```

### Día 3-4: Desarrollo Homepage Next.js
```jsx
// pages/index.js - Homepage nueva
import { HeroSearch } from '@/components/HeroSearch'
import { PopularDestinations } from '@/components/PopularDestinations'
import { TrustBadges } from '@/components/TrustBadges'

export default function Home({ destinations }) {
  return (
    <>
      <HeroSearch />
      <PopularDestinations items={destinations} />
      <TrustBadges />
    </>
  )
}

// Conectar con CRM
export async function getStaticProps() {
  const destinations = await fetch(process.env.CRM_API_URL + '/destinations/popular')
  return { props: { destinations }, revalidate: 3600 }
}
```

### Día 5: Configurar NGINX local
```nginx
# /etc/nginx/sites-available/colombiatours.local
server {
    listen 80;
    server_name colombiatours.local;
    
    # Por defecto todo va a WordPress
    location / {
        proxy_pass http://localhost:8080;
    }
    
    # Homepage nueva a Next.js (para testing)
    location /nueva-home {
        proxy_pass http://localhost:3000/;
    }
}
```

## 📅 SEMANA 1: PRIMERA RUTA EN PRODUCCIÓN

### Día 1: Deploy Next.js a servidor
```bash
# 1. Servidor de producción
ssh colombia@servidor.com
cd /var/www/
git clone https://github.com/colombiatours/nextjs-app
cd nextjs-app
npm install --production
npm run build

# 2. PM2 para mantener Next.js corriendo
npm install -g pm2
pm2 start npm --name "nextjs-colombiatours" -- start
pm2 save
pm2 startup
```

### Día 2: Configurar NGINX producción
```nginx
# Agregar a configuración existente
server {
    listen 80;
    server_name colombiatours.travel;
    
    # NUEVO: Homepage con A/B testing (10% tráfico)
    location = / {
        # Variable random para A/B test
        set $test_group "wordpress";
        if ($remote_addr ~* "[0]$") {
            set $test_group "nextjs";
        }
        
        # 10% va a Next.js
        if ($test_group = "nextjs") {
            proxy_pass http://localhost:3000;
            add_header X-Served-By "NextJS-Test";
        }
        
        # 90% sigue en WordPress
        if ($test_group = "wordpress") {
            proxy_pass http://localhost:8080;
            add_header X-Served-By "WordPress";
        }
    }
    
    # Todo lo demás sigue igual
    location / {
        proxy_pass http://localhost:8080;
    }
}

# Recargar NGINX
nginx -t
systemctl reload nginx
```

### Día 3-5: Monitorear métricas
```javascript
// Script de monitoreo
const checkMetrics = async () => {
  // Verificar en GA4
  const metrics = await analytics.runReport({
    dimensions: ['customEvent:servedBy'],
    metrics: ['sessions', 'bounceRate', 'conversions']
  });
  
  console.log('WordPress:', metrics.wordpress);
  console.log('Next.js:', metrics.nextjs);
  
  // Si Next.js performa mejor, aumentar tráfico
  if (metrics.nextjs.bounceRate < metrics.wordpress.bounceRate) {
    console.log('✅ Next.js performing better!');
  }
};
```

## 📅 SEMANA 2: EXPANDIR A MÁS RUTAS

### Día 1: Migrar buscador
```jsx
// pages/buscar.js
import { SearchResults } from '@/components/SearchResults'
import { useRouter } from 'next/router'

export default function Buscar() {
  const router = useRouter()
  const { destino, fechas, personas } = router.query
  
  return <SearchResults filters={{ destino, fechas, personas }} />
}
```

### Día 2: Actualizar NGINX
```nginx
location = / {
    # Aumentar a 50% si métricas son buenas
    if ($remote_addr ~* "[0-4]$") {
        proxy_pass http://localhost:3000;
    }
    if ($remote_addr ~* "[5-9]$") {
        proxy_pass http://localhost:8080;
    }
}

# NUEVO: Buscador
location /buscar {
    proxy_pass http://localhost:3000;
}

# NUEVO: API para búsquedas
location /api/search {
    proxy_pass http://localhost:3000;
}
```

### Día 3: Migrar páginas de productos
```jsx
// pages/paquetes/[destino]/[slug].js
export default function PaqueteDetalle({ paquete }) {
  return (
    <div>
      <ImageGallery images={paquete.images} />
      <h1>{paquete.title}</h1>
      <PriceCalculator basePrice={paquete.price} />
      <Itinerary days={paquete.itinerary} />
      <LeadForm productId={paquete.id} />
    </div>
  )
}

// Generar páginas estáticas de productos populares
export async function getStaticPaths() {
  const products = await getPopularProducts()
  return {
    paths: products.map(p => ({
      params: { destino: p.destination, slug: p.slug }
    })),
    fallback: 'blocking'
  }
}
```

### Día 4-5: Configurar tracking
```javascript
// components/Analytics.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function Analytics() {
  const router = useRouter()
  
  useEffect(() => {
    // Track page views
    gtag('event', 'page_view', {
      page_path: router.pathname,
      served_by: 'nextjs',
      migration_phase: 'week2'
    })
  }, [router.pathname])
  
  return null
}
```

## 📅 SEMANA 3: MIGRACIÓN MASIVA

### Día 1: Mover todas las rutas principales
```nginx
server {
    # Homepage 100% a Next.js
    location = / {
        proxy_pass http://localhost:3000;
    }
    
    # Todas las búsquedas
    location /buscar {
        proxy_pass http://localhost:3000;
    }
    
    # Todos los paquetes
    location /paquetes {
        proxy_pass http://localhost:3000;
    }
    
    # Cotizador
    location /cotizar {
        proxy_pass http://localhost:3000;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3000;
    }
    
    # Assets Next.js
    location /_next {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # === WORDPRESS MANTIENE ===
    
    # Blog
    location /blog {
        proxy_pass http://localhost:8080;
    }
    
    # Páginas SEO específicas
    location /los-10-mejores-lugares-turisticos-de-colombia {
        proxy_pass http://localhost:8080;
    }
    
    # Admin
    location /wp-admin {
        proxy_pass http://localhost:8080;
    }
    
    # Uploads
    location /wp-content/uploads {
        proxy_pass http://localhost:8080;
        expires 30d;
    }
}
```

### Día 2-3: Testing exhaustivo
```bash
# Script de validación
#!/bin/bash

# Test todas las rutas críticas
URLS=(
    "/"
    "/buscar?destino=cartagena"
    "/paquetes/cartagena/tour-islas"
    "/blog/consejos-viaje"
    "/los-10-mejores-lugares-turisticos-de-colombia"
)

for url in "${URLS[@]}"; do
    echo "Testing: $url"
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://colombiatours.travel$url")
    if [ $response -eq 200 ]; then
        echo "✅ OK"
    else
        echo "❌ Error: $response"
    fi
done
```

### Día 4-5: Optimizaciones
```javascript
// next.config.js - Optimizaciones finales
module.exports = {
  images: {
    domains: ['colombiatours.travel', 'crm.colombiatours.com'],
  },
  
  // Comprimir assets
  compress: true,
  
  // Generar sitemap
  sitemap: {
    generateRobotsTxt: true,
  },
  
  // Redirecciones 301
  async redirects() {
    return [
      {
        source: '/l/:path*',
        destination: '/paquetes/:path*',
        permanent: true,
      }
    ]
  }
}
```

## 📅 SEMANA 4: ESTABILIZACIÓN

### Checklist Final
- [ ] Todas las redirecciones 301 funcionando
- [ ] Sitemap.xml actualizado
- [ ] Robots.txt correcto
- [ ] Analytics tracking 100%
- [ ] Performance >90 Lighthouse
- [ ] Formularios probados
- [ ] WhatsApp attribution funcionando
- [ ] Backup completo realizado

### Monitoreo Post-Migración
```javascript
// dashboard-monitoreo.js
setInterval(async () => {
  // Verificar uptime
  const nextjsHealth = await fetch('https://colombiatours.travel/api/health')
  const wordpressHealth = await fetch('https://colombiatours.travel/wp-admin/admin-ajax.php')
  
  // Verificar 404s
  const errors = await analytics.getErrorRate()
  
  // Alertas
  if (!nextjsHealth.ok || !wordpressHealth.ok || errors > 1) {
    sendAlert('⚠️ Problema detectado en migración')
  }
}, 60000) // Cada minuto
```

## 🎯 RESULTADO FINAL

```
colombiatours.travel/
├── Next.js maneja:
│   ├── / (Homepage)
│   ├── /buscar
│   ├── /paquetes/*
│   ├── /cotizar
│   └── /api/*
│
└── WordPress mantiene:
    ├── /blog/*
    ├── /wp-admin/*
    ├── /wp-content/uploads/*
    └── Páginas SEO legacy
```

## ✅ VENTAJAS DE ESTE FLUJO

1. **Riesgo mínimo**: Empezamos con 10% de tráfico
2. **Rollback fácil**: Solo cambiar NGINX
3. **Métricas claras**: Comparamos A/B
4. **Sin downtime**: Todo gradual
5. **SEO protegido**: WordPress sigue vivo

---

¿Quieres que detalle alguna semana específica o tienes dudas sobre algún paso?