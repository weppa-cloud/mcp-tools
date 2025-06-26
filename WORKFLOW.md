# 🔄 Flujo de Actualización MCP Tools

## 📝 Para Desarrolladores

### 1. Hacer cambios
```bash
# Clonar si no lo tienes
git clone https://github.com/weppa-cloud/mcp-tools.git
cd mcp-tools

# Crear branch para tu feature
git checkout -b feature/nueva-herramienta

# Hacer cambios en el código
cd packages/google-analytics
# ... editar archivos ...
```

### 2. Probar localmente
```bash
# Instalar dependencias
npm install

# Construir
npm run build

# Probar con Claude local (opcional)
# Apuntar claude_desktop_config.json a tu build local
```

### 3. Actualizar versión
```bash
# En packages/google-analytics/package.json
# Cambiar version según semver:
# - PATCH (1.0.1): Bug fixes
# - MINOR (1.1.0): Nueva feature compatible
# - MAJOR (2.0.0): Breaking changes

cd packages/google-analytics
npm version patch  # o minor/major
```

### 4. Commit y Push
```bash
git add .
git commit -m "feat: Agregar nueva herramienta X"
git push origin feature/nueva-herramienta

# Crear Pull Request en GitHub
gh pr create --title "feat: Nueva herramienta X" --body "Descripción..."
```

### 5. Merge y Publicar
```bash
# Después del review y merge a main
git checkout main
git pull

# Publicar a NPM
cd packages/google-analytics
npm publish

# O publicar todos los paquetes
npm run publish-all
```

## 👥 Para el Equipo (Usuarios)

### Actualización Automática ✨

**¡No necesitas hacer nada!** npx siempre descarga la última versión:

```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["@weppa-cloud/mcp-google-analytics"],
      // npx automáticamente usa la última versión
    }
  }
}
```

### Forzar Actualización (si hay cache)

```bash
# Opción 1: Limpiar cache de npx
npx clear-npx-cache

# Opción 2: Especificar versión
"args": ["@weppa-cloud/mcp-google-analytics@latest"]

# Opción 3: Reinstalar Claude Desktop
# (solo en casos extremos)
```

## 📊 Versionado Semántico

### PATCH (1.0.X)
- Bug fixes
- Mejoras de performance
- Typos en documentación

**Ejemplo**: `1.0.0` → `1.0.1`

### MINOR (1.X.0)
- Nuevas herramientas
- Nuevas features
- Mejoras retrocompatibles

**Ejemplo**: `1.0.1` → `1.1.0`

### MAJOR (X.0.0)
- Breaking changes
- Cambios en API
- Reorganización mayor

**Ejemplo**: `1.1.0` → `2.0.0`

## 🚀 Flujo Rápido (para cambios pequeños)

```bash
# 1. Hacer cambio
cd mcp-tools
git pull
# ... editar ...

# 2. Test rápido
npm run build

# 3. Bump version
cd packages/google-analytics
npm version patch

# 4. Commit, push y publish
git add .
git commit -m "fix: Corregir cálculo de CAC"
git push
npm publish

# 5. ¡Listo! El equipo ya tiene la actualización
```

## 📱 Notificar al Equipo

### Cambios Menores
```slack
📦 Update: MCP Google Analytics v1.0.2
- Fix: Corregido cálculo de retención
- Ya disponible con npx
```

### Cambios Mayores
```slack
🚀 Nueva Feature: MCP Google Analytics v1.1.0
- ✨ Nueva herramienta: predict_revenue
- 📊 Mejorado growth_pulse con alertas
- 🐛 Fixes varios

Docs: https://github.com/weppa-cloud/mcp-tools
```

## 🔍 Verificar Versión Actual

### En NPM
```bash
npm view @weppa-cloud/mcp-google-analytics version
```

### En GitHub
- Ver tags: https://github.com/weppa-cloud/mcp-tools/tags
- Ver releases: https://github.com/weppa-cloud/mcp-tools/releases

### En Claude
```
# Preguntar a Claude
"¿Qué versión del MCP de Google Analytics estoy usando?"
```

## ⚡ Tips para Updates Rápidos

1. **Automatizar con GitHub Actions**
   ```yaml
   # .github/workflows/publish.yml
   on:
     push:
       tags:
         - 'v*'
   # Auto-publish al crear tag
   ```

2. **Changelog Automático**
   - Usar conventional commits
   - Generar CHANGELOG.md automático

3. **Testing en CI**
   - Tests antes de publish
   - Validación de build

4. **Notificaciones**
   - Webhook a Slack/Discord
   - Email al equipo

## 🚨 Troubleshooting Updates

### NPX no actualiza
```bash
# Limpiar cache
rm -rf ~/.npm/_npx
npx clear-npx-cache

# O especificar versión
npx @weppa-cloud/mcp-google-analytics@1.1.0
```

### Claude no ve cambios
- Reiniciar Claude Desktop
- Verificar que NPM publicó: `npm view @weppa-cloud/mcp-google-analytics`

### Error de permisos en NPM
```bash
# Verificar login
npm whoami

# Re-autenticar
npm login
```

---

💡 **Pro tip**: Usa `npm version` para automatizar el bump de versión y el tag de git.