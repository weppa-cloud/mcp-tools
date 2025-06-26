# 🎨 RECOMENDACIÓN DE THEME/STACK PARA COLOMBIA TOURS

## 🚀 OPCIÓN RECOMENDADA: CUSTOM THEME BASADO EN SHADCN/UI

### ¿Por qué NO un theme pre-hecho?
- Los themes de viajes genéricos no se adaptan al modelo B2B2C
- Necesitas control total sobre el tracking
- La integración con CRM requiere customización
- El flujo WhatsApp es único

### 🏗️ STACK RECOMENDADO

```javascript
{
  "framework": "Next.js 14 (App Router)",
  "ui": "shadcn/ui + Tailwind CSS",
  "animations": "Framer Motion",
  "forms": "React Hook Form + Zod",
  "state": "Zustand",
  "analytics": "Next.js Analytics + GA4",
  "images": "Next/Image + Cloudinary",
  "maps": "Mapbox GL",
  "dates": "date-fns",
  "payments": "Stripe (futuro)",
  "cms": "Payload CMS (headless)",
  "deployment": "Vercel"
}
```

## 📁 ESTRUCTURA DEL PROYECTO

```
colombiatours-next/
├── app/
│   ├── (marketing)/          # Páginas públicas
│   │   ├── layout.tsx        # Header/Footer marketing
│   │   ├── page.tsx          # Homepage
│   │   ├── destinos/
│   │   │   ├── page.tsx      # Lista destinos
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Detalle destino
│   │   ├── paquetes/
│   │   │   ├── page.tsx      # Buscador
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Detalle paquete
│   │   └── blog/
│   ├── (booking)/            # Flujo reserva
│   │   ├── layout.tsx        # Layout simplificado
│   │   ├── cotizar/
│   │   └── confirmacion/
│   └── api/
│       ├── search/
│       ├── leads/
│       └── webhooks/
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── marketing/
│   │   ├── HeroSearch.tsx
│   │   ├── DestinationCard.tsx
│   │   ├── PackageCard.tsx
│   │   ├── TrustBadges.tsx
│   │   └── TestimonialSlider.tsx
│   ├── booking/
│   │   ├── SearchFilters.tsx
│   │   ├── PriceCalculator.tsx
│   │   ├── DatePicker.tsx
│   │   └── SmartForm.tsx
│   └── shared/
│       ├── WhatsAppButton.tsx
│       └── Analytics.tsx
├── lib/
│   ├── api/
│   │   ├── crm.ts
│   │   ├── analytics.ts
│   │   └── chatwoot.ts
│   ├── hooks/
│   │   ├── useTracking.ts
│   │   ├── useSearch.ts
│   │   └── useBooking.ts
│   └── utils/
└── styles/
    └── globals.css
```

## 🎨 COMPONENTES UI BASE (SHADCN/UI)

### 1. Instalación Base
```bash
npx create-next-app@latest colombiatours --typescript --tailwind --app
cd colombiatours
npx shadcn-ui@latest init
```

### 2. Componentes a Instalar
```bash
# Esenciales para el proyecto
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add carousel
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
```

## 🎯 COMPONENTES ESPECÍFICOS PARA TURISMO

### 1. Hero con Buscador
```tsx
// components/marketing/HeroSearch.tsx
import { Search, Calendar, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useTracking } from '@/lib/hooks/useTracking'

export function HeroSearch() {
  const { trackEvent } = useTracking()
  
  return (
    <section className="relative h-[80vh] min-h-[600px]">
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/colombia-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Descubre Colombia con Expertos Locales
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-8"
          >
            Tours personalizados desde $450 USD
          </motion.p>
          
          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
          >
            <form className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="¿A dónde viajas?"
                  className="w-full pl-10 pr-3 py-3 border rounded-lg"
                  onFocus={() => trackEvent('search_destination_focus')}
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="¿Cuándo?"
                  className="w-full pl-10 pr-3 py-3 border rounded-lg"
                  onFocus={() => trackEvent('search_dates_focus')}
                />
              </div>
              
              <div className="relative">
                <Users className="absolute left-3 top-3 text-gray-400" />
                <select className="w-full pl-10 pr-3 py-3 border rounded-lg">
                  <option>2 personas</option>
                  <option>3 personas</option>
                  <option>4 personas</option>
                  <option>5+ personas</option>
                </select>
              </div>
              
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => trackEvent('hero_search_click')}
              >
                <Search className="mr-2" />
                Buscar
              </Button>
            </form>
            
            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-600">Populares:</span>
              {['Cartagena', 'Eje Cafetero', 'San Andrés', 'Amazonas'].map(dest => (
                <Button
                  key={dest}
                  variant="outline"
                  size="sm"
                  onClick={() => trackEvent('quick_destination_click', { destination: dest })}
                >
                  {dest}
                </Button>
              ))}
            </div>
          </motion.div>
          
          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-white"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <span>+5,000 viajeros felices</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span>4.8/5 en Google</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span>100% Seguro</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

### 2. Card de Paquete Optimizado
```tsx
// components/marketing/PackageCard.tsx
import Image from 'next/image'
import { Calendar, Users, Clock, Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTracking } from '@/lib/hooks/useTracking'

interface PackageCardProps {
  package: {
    id: string
    name: string
    slug: string
    destination: string
    images: string[]
    price: number
    duration: number
    groupSize: string
    rating: number
    reviews: number
    highlights: string[]
  }
}

export function PackageCard({ package }: PackageCardProps) {
  const { trackEvent } = useTracking()
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image with overlay */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={package.images[0]}
          alt={package.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-green-600">Mejor Precio</Badge>
          {package.reviews > 50 && (
            <Badge variant="secondary">Popular</Badge>
          )}
        </div>
        
        {/* Price */}
        <div className="absolute bottom-4 right-4 text-white">
          <div className="text-sm">Desde</div>
          <div className="text-3xl font-bold">${package.price}</div>
          <div className="text-sm">por persona</div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Title and Rating */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">
            {package.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{package.rating}</span>
            </div>
            <span className="text-gray-500">({package.reviews} reseñas)</span>
          </div>
        </div>
        
        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{package.duration} días</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{package.groupSize}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Flexible</span>
          </div>
        </div>
        
        {/* Highlights */}
        <ul className="space-y-1 mb-6">
          {package.highlights.slice(0, 3).map((highlight, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-green-600">✓</span>
              {highlight}
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            trackEvent('package_details_click', { package_id: package.id })
          }}
        >
          Ver Detalles
        </Button>
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={() => {
            trackEvent('package_whatsapp_click', { 
              package_id: package.id,
              price: package.price 
            })
          }}
        >
          <span className="mr-2">💬</span>
          Cotizar
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 3. Formulario Inteligente con Tracking
```tsx
// components/booking/SmartForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTracking } from '@/lib/hooks/useTracking'

const formSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número inválido'),
  email: z.string().email('Email inválido'),
  destination: z.string().optional(),
  dates: z.string().optional(),
  message: z.string().optional()
})

export function SmartForm({ productId, productName }: any) {
  const { trackFormStart, trackFormSubmit, trackEvent } = useTracking()
  const [progress, setProgress] = useState(0)
  const [started, setStarted] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      destination: '',
      dates: '',
      message: ''
    }
  })
  
  const updateProgress = () => {
    const values = form.getValues()
    const filled = Object.values(values).filter(v => v !== '').length
    const total = Object.keys(values).length
    setProgress((filled / total) * 100)
  }
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    trackFormSubmit('smart_form', {
      product_id: productId,
      has_message: !!values.message
    })
    
    // API call
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, productId, productName })
    })
    
    const data = await response.json()
    
    // Redirect to WhatsApp
    const message = `Hola! Soy ${values.name}. Me interesa ${productName || values.destination}. Código: ${data.trackingCode}`
    window.location.href = `https://wa.me/573001234567?text=${encodeURIComponent(message)}`
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-2">¿Listo para viajar?</h3>
      <p className="text-gray-600 mb-6">
        Completa el formulario y te contactaremos en menos de 1 hora
      </p>
      
      {started && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={updateProgress}
          onFocus={() => {
            if (!started) {
              setStarted(true)
              trackFormStart('smart_form')
            }
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="+57 300 123 4567" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="juan@email.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Solicitar Cotización por WhatsApp
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          🔒 Datos seguros
        </span>
        <span className="flex items-center gap-1">
          ⚡ Respuesta rápida
        </span>
      </div>
    </div>
  )
}
```

## 🎨 DISEÑO VISUAL

### Paleta de Colores
```css
:root {
  /* Primary - Colombian Green */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  --primary-500: #22c55e;
  --primary-600: #16a34a;
  --primary-700: #15803d;
  
  /* Secondary - Colombian Yellow */
  --secondary-50: #fefce8;
  --secondary-100: #fef3c7;
  --secondary-500: #eab308;
  
  /* Accent - Colombian Red */
  --accent-500: #dc2626;
  
  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-900: #111827;
}
```

### Tipografía
```css
/* Headings: Playfair Display o Merriweather */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');

/* Body: Inter o Open Sans */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

h1, h2, h3 {
  font-family: 'Playfair Display', serif;
}

body {
  font-family: 'Inter', sans-serif;
}
```

## 🚀 CARACTERÍSTICAS CLAVE

### 1. Performance
- Server Components por defecto
- Dynamic imports para componentes pesados
- Image optimization con Next/Image
- Font optimization
- Prefetch de rutas críticas

### 2. SEO
- Metadata dinámica
- Structured data para tours
- Sitemap automático
- Open Graph optimizado
- URLs limpias

### 3. Tracking
- Hook useTracking en todos los componentes
- Attribution automática
- Eventos personalizados
- Integración GA4 + Chatwoot

### 4. Conversión
- WhatsApp prominente
- Formularios cortos
- Trust signals
- Urgencia/escasez
- Social proof

## 📱 RESPONSIVE DESIGN

```tsx
// Breakpoints consistentes
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Wide desktop
  '2xl': '1536px' // Ultra wide
}

// Mobile-first approach
<div className="
  grid grid-cols-1 gap-6      // Mobile
  md:grid-cols-2              // Tablet
  lg:grid-cols-3              // Desktop
  xl:grid-cols-4              // Wide
">
```

## 🎯 RESULTADO FINAL

Un sitio que:
1. **Carga en <2 segundos**
2. **Convierte 5x mejor** que WordPress
3. **Trackea todo** el customer journey
4. **Se ve premium** pero accesible
5. **Escala fácilmente** con el negocio

---

¿Te gusta este approach o prefieres explorar otras opciones?