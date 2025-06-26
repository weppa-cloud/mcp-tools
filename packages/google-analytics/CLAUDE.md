# Google Analytics MCP - Growth Hacking Tools

## 🚀 Overview

Herramienta MCP que convierte Google Analytics en un motor de growth hacking para Claude. Diseñada para tomar decisiones rápidas basadas en datos.

## 🎯 Filosofía: Speed > Reports

No más reportes largos. Solo insights accionables en segundos.

## 🛠️ Herramientas Disponibles

### 📊 Análisis Básico

#### `get_realtime_data`
```
"¿Cuántos usuarios activos tengo ahora?"
"Muéstrame el tráfico en tiempo real por país"
```

#### `get_report_data`
```
"Dame el tráfico de los últimos 7 días"
"¿Cuántas conversiones tuve ayer?"
"Compara revenue esta semana vs la anterior"
```

### 🚀 Growth Hacking Tools

#### `growth_pulse` ⭐
```
"Dame el growth pulse de hoy"
```
Retorna en 3 segundos:
- ✅ Tráfico: +15% 🟢
- ⚠️ Conversiones: -5% 🟡  
- ✅ Revenue: +$2,340 🟢
- 🚨 Alerta: "Mobile checkout roto"

#### `find_growth_levers` 💎
```
"¿Dónde está mi mayor oportunidad?"
```
Encuentra:
- Quick wins para implementar hoy
- Experimentos con alto ROI
- Canales para duplicar inversión

#### `analyze_funnel` 🔍
```
"Analiza mi funnel de conversión"
```
Pasos ejemplo:
1. Homepage → Product: 45% (-$34K perdidos)
2. Product → Cart: 23% (-$128K perdidos)
3. Cart → Purchase: 68% (-$45K perdidos)

#### `track_experiment` 🧪
```
"Inicia test de precio $29 vs $39"
"¿Cómo va mi test del CTA verde?"
"¿Cuándo tendré significancia?"
```

#### `analyze_cohorts` 📈
```
"Muestra retención por cohortes semanales"
"¿Qué cohorte tiene mejor LTV?"
```

#### `identify_power_users` 👑
```
"¿Quiénes son mis power users?"
"Compara power users vs promedio"
```

#### `predict_churn` 🔮
```
"¿Qué usuarios van a cancelar?"
```
Retorna:
- 234 usuarios en riesgo
- 68% probabilidad de churn
- Acción: "Email con 20% descuento"
- Salvarías: $12,450

#### `viral_coefficient` 🦠
```
"¿Cuál es mi coeficiente viral?"
```
- Coeficiente: 0.7 (no viral aún)
- Necesitas: 0.3 referrals más/usuario
- Top referrers identificados

## 💡 Casos de Uso por Día

### Lunes - Health Check
```
"Growth pulse de la semana"
"¿Qué canal performó mejor?"
"¿Alguna alerta crítica?"
```

### Martes - Experimentación  
```
"Lanza test nuevo onboarding"
"Status de experimentos activos"
"¿Qué test ganó la semana pasada?"
```

### Miércoles - Optimización
```
"¿Dónde está el mayor leak del funnel?"
"¿Qué landing convierte mejor?"
"Top 5 páginas que matan conversión"
```

### Jueves - Adquisición
```
"CAC por canal últimos 30 días"
"¿Dónde duplico presupuesto?"
"ROI de cada fuente de tráfico"
```

### Viernes - Retención
```
"Usuarios en riesgo de churn"
"¿Qué feature tiene mejor retención?"
"Segmentos con mejor LTV"
```

## 🏃 Quick Wins Checklist

- [ ] Identificar mayor leak del funnel
- [ ] Encontrar canal con mejor ROI
- [ ] Lanzar test en página top
- [ ] Segmentar power users
- [ ] Activar campaña anti-churn
- [ ] Optimizar para móvil
- [ ] Duplicar en canal ganador

## 📐 Métricas que Importan

✅ **Mide esto:**
- Weekly Active Users
- Revenue per User  
- Conversion Rate por step
- LTV:CAC ratio
- Viral coefficient
- Churn rate

❌ **Ignora esto:**
- Page views totales
- Bounce rate general
- Time on site sin contexto
- Downloads sin activación

## 🎮 Comandos Rápidos

```bash
# Morning coffee check
"growth pulse + top issue"

# Before meeting
"funnel leaks + revenue impact"

# Investment decision
"LTV por canal + CAC"

# Friday wins
"best performing experiment this week"

# Emergency
"qué pasó con las conversiones hoy?"
```

## 🔧 Configuración Avanzada

### Custom Events
```json
{
  "conversion_events": ["purchase", "trial_start", "upgrade"],
  "value_event": "purchase",
  "churn_signal": "subscription_cancelled"
}
```

### Alertas Automáticas
```
- Conversion drop > 10%
- Traffic spike > 50%
- New high-value segment
- Experiment reaches significance
```

## 🚨 Troubleshooting Rápido

**No data?**
- Check date range
- Verify events are firing
- Confirm property ID

**Slow response?**
- Use shorter date ranges
- Limit dimensions
- Cache common queries

**Wrong metrics?**
- Check timezone
- Verify event names
- Confirm currency

---

💡 **Pro tip**: Empieza cada día con `growth pulse` y termina con `find growth levers` para el día siguiente.

🎯 **Remember**: If you can't take action on it, don't measure it.