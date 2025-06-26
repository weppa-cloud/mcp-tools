# 🔄 CONVIVENCIA WORDPRESS + NEXT.JS

## 📐 ARQUITECTURA DE RUTEO

### Opción 1: NGINX como Proxy Reverso (Recomendado)

```nginx
# /etc/nginx/sites-available/colombiatours.travel

server {
    listen 80;
    listen 443 ssl http2;
    server_name colombiatours.travel www.colombiatours.travel;
    
    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # === RUTAS DE NEXT.JS ===
    
    # Homepage nueva
    location = / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Todas las páginas de productos nuevas
    location /paquetes {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Buscador
    location /buscar {
        proxy_pass http://localhost:3000;
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:3000;
    }
    
    # Assets de Next.js
    location /_next {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
    
    # === RUTAS DE WORDPRESS ===
    
    # Blog completo
    location /blog {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Páginas SEO específicas que queremos mantener
    location /los-10-mejores-lugares-turisticos-de-colombia {
        proxy_pass http://localhost:8080;
    }
    
    location /que-hacer-en-cartagena-de-indias-20-act {
        proxy_pass http://localhost:8080;
    }
    
    # Admin de WordPress
    location /wp-admin {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Archivos de WordPress
    location /wp-content {
        proxy_pass http://localhost:8080;
        proxy_cache_valid 1d;
    }
    
    location /wp-includes {
        proxy_pass http://localhost:8080;
        proxy_cache_valid 1d;
    }
    
    # Todo lo demás va a WordPress (por ahora)
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Opción 2: Vercel/Netlify Rewrites

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return {
      // Reglas que se ejecutan ANTES de verificar páginas de Next.js
      beforeFiles: [
        // APIs siempre van a Next.js
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
      
      // Reglas que se ejecutan DESPUÉS de verificar páginas de Next.js
      afterFiles: [
        // Si Next.js no tiene la página, va a WordPress
        {
          source: '/blog/:path*',
          destination: 'https://wp.colombiatours.travel/blog/:path*',
        },
        {
          source: '/wp-admin/:path*',
          destination: 'https://wp.colombiatours.travel/wp-admin/:path*',
        },
      ],
      
      // Fallback: todo lo que no existe va a WordPress
      fallback: [
        {
          source: '/:path*',
          destination: 'https://wp.colombiatours.travel/:path*',
        },
      ],
    }
  },
}
```

### Opción 3: Cloudflare Workers (Edge)

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Mapa de rutas
  const routeMap = {
    // Next.js routes
    nextjs: [
      '/',
      '/paquetes',
      '/buscar', 
      '/api',
      '/_next',
      '/cotizar'
    ],
    // WordPress routes
    wordpress: [
      '/blog',
      '/wp-admin',
      '/wp-content',
      '/los-10-mejores-lugares-turisticos-de-colombia',
      '/que-hacer-en-cartagena-de-indias-20-act'
    ]
  }
  
  // Verificar a dónde enviar
  const pathname = url.pathname
  
  // Rutas de Next.js
  if (routeMap.nextjs.some(route => pathname.startsWith(route))) {
    return fetch(`https://nextjs.colombiatours.travel${pathname}`, request)
  }
  
  // Rutas de WordPress
  if (routeMap.wordpress.some(route => pathname.startsWith(route))) {
    return fetch(`https://wp.colombiatours.travel${pathname}`, request)
  }
  
  // Default: WordPress (por ahora)
  return fetch(`https://wp.colombiatours.travel${pathname}`, request)
}
```

## 🎯 CASOS DE USO ESPECÍFICOS

### 1. Migración Gradual de Homepage

```nginx
# Semana 1: 20% del tráfico a Next.js
location = / {
    # A/B testing con split_clients
    split_clients "${remote_addr}${http_user_agent}" $homepage_backend {
        20% "nextjs";
        *   "wordpress";
    }
    
    if ($homepage_backend = "nextjs") {
        proxy_pass http://localhost:3000;
    }
    if ($homepage_backend = "wordpress") {
        proxy_pass http://localhost:8080;
    }
}

# Semana 2: 50% del tráfico
# Semana 3: 100% del tráfico
```

### 2. Rutas Dinámicas Compartidas

```nginx
# Productos nuevos en Next.js
location ~ ^/destinos/(cartagena|medellin|bogota) {
    proxy_pass http://localhost:3000;
}

# Productos viejos en WordPress  
location ~ ^/destinos/ {
    proxy_pass http://localhost:8080;
}
```

### 3. Manejo de Assets y Media

```nginx
# Imágenes subidas a WordPress siguen funcionando
location /wp-content/uploads {
    # Opción 1: Proxy a WordPress
    proxy_pass http://localhost:8080;
    
    # Opción 2: Servir directo desde disco
    # root /var/www/wordpress;
    # try_files $uri =404;
    
    # Cache agresivo
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Assets de Next.js optimizados
location /_next/image {
    proxy_pass http://localhost:3000;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

## 🔧 CONFIGURACIÓN PRÁCTICA

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - nextjs
      - wordpress
    networks:
      - web

  nextjs:
    build: ./nextjs-app
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - WORDPRESS_URL=http://wordpress:80
    networks:
      - web

  wordpress:
    image: wordpress:latest
    expose:
      - "80"
    environment:
      - WORDPRESS_DB_HOST=mysql
      - WORDPRESS_DB_NAME=colombiatours
    volumes:
      - wordpress_data:/var/www/html
    networks:
      - web
      - backend

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=colombiatours
      - MYSQL_ROOT_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - backend

volumes:
  wordpress_data:
  mysql_data:

networks:
  web:
  backend:
```

### Verificación de Rutas

```bash
# Script para verificar qué app maneja cada ruta
#!/bin/bash

ROUTES=(
  "/"
  "/paquetes/cartagena"
  "/blog/consejos-viaje"
  "/los-10-mejores-lugares-turisticos-de-colombia"
  "/api/search"
  "/wp-admin"
)

for route in "${ROUTES[@]}"; do
  echo "Testing: $route"
  response=$(curl -s -I https://colombiatours.travel$route | grep -E "X-Powered-By|Server")
  echo "$response"
  echo "---"
done
```

## 📊 MONITOREO DE CONVIVENCIA

### Headers para Debugging

```nginx
# Agregar headers para identificar origen
location /paquetes {
    proxy_pass http://localhost:3000;
    add_header X-Served-By "NextJS";
}

location /blog {
    proxy_pass http://localhost:8080;
    add_header X-Served-By "WordPress";
}
```

### Logs Separados

```nginx
# Logs por aplicación
access_log /var/log/nginx/nextjs.access.log combined if=$is_nextjs;
access_log /var/log/nginx/wordpress.access.log combined if=$is_wordpress;

map $request_uri $is_nextjs {
    ~^/(paquetes|api|_next) 1;
    default 0;
}

map $request_uri $is_wordpress {
    ~^/(blog|wp-) 1;
    default 0;
}
```

## 🚀 VENTAJAS DE ESTA ARQUITECTURA

1. **Control Total**: Decides exactamente qué app maneja cada ruta
2. **Migración Gradual**: Puedes mover rutas una por una
3. **Rollback Instantáneo**: Solo cambias la configuración
4. **A/B Testing**: Puedes probar con % de tráfico
5. **Sin Downtime**: Todo sigue funcionando durante la migración

## ⚡ TIPS DE RENDIMIENTO

```nginx
# Cache diferenciado por app
location /paquetes {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 10m;  # Cache corto para contenido dinámico
}

location /blog {
    proxy_pass http://localhost:8080;
    proxy_cache_valid 200 1h;   # Cache largo para blog
}

# Compresión
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

## 🎯 EJEMPLO REAL DE MIGRACIÓN

```bash
# Semana 1
/ → Next.js ✅
/paquetes/* → Next.js ✅
Todo lo demás → WordPress

# Semana 2
/buscar → Next.js ✅
/cotizar → Next.js ✅
/api/* → Next.js ✅

# Semana 3
/destinos/* → Next.js ✅
Páginas SEO top → WordPress (mantener)

# Semana 4
/blog → WordPress (permanente)
/wp-admin → WordPress (permanente)
Todo lo demás → Next.js ✅
```

---

¿Necesitas que detalle alguna configuración específica o tienes dudas sobre algún escenario?