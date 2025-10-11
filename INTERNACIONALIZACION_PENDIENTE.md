# Prompt para continuar la internacionalización del CMS

## Contexto del proyecto

Estás continuando la implementación de internacionalización (i18n) en un CMS construido con Vue 3. El sistema de i18n ya está completamente configurado y funcionando:

### Sistema i18n implementado:
- **Librería**: vue-i18n@9 (Composition API mode)
- **Idiomas soportados**: Español (es) - por defecto, Inglés (en)
- **Archivos de traducción**:
  - `/Users/carlosvidal/www/taita/cms/src/locales/es.json`
  - `/Users/carlosvidal/www/taita/cms/src/locales/en.json`
- **Plugin configurado**: `/Users/carlosvidal/www/taita/cms/src/plugins/i18n.js`
- **Persistencia**: localStorage con clave 'locale'
- **Selector de idioma**: Implementado en SettingsView (separado del idioma del contenido del blog)

### Vistas ya traducidas (completadas):
1. ✅ **CmsLayout.vue** - Navegación principal
2. ✅ **SettingsView.vue** - Configuración del CMS
3. ✅ **DashboardView.vue** - Panel de control
4. ✅ **UserFormView.vue** - Formulario de usuario/perfil
5. ✅ **PostFormView.vue** - Formulario de creación/edición de posts
6. ✅ **PostsView.vue** - Lista de posts (verificada y función handleDelete agregada)
7. ✅ **PageFormView.vue** - Formulario de páginas (verificada)
8. ✅ **PagesView.vue** - Lista de páginas (verificada)

### Patrón de implementación usado:

```vue
<template>
  <!-- En templates usar $t() -->
  <h1>{{ $t('posts.title') }}</h1>
  <button :title="$t('common.save')">{{ $t('common.save') }}</button>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// En script usar t()
const message = t('posts.saveSuccess')

// Para computed properties que usan traducciones
const actions = computed(() => [
  { name: t('common.edit'), action: edit },
  { name: t('common.delete'), action: remove }
])
</script>
```

## Vistas pendientes de traducir (en orden de prioridad):

### Prioridad ALTA (vistas principales del CMS):
1. ~~**PostFormView.vue**~~ - ✅ Completada
2. ~~**PostsView.vue**~~ - ✅ Completada
3. ~~**PageFormView.vue**~~ - ✅ Completada
4. ~~**PagesView.vue**~~ - ✅ Completada
5. **MediaView.vue** - Biblioteca de medios

### Prioridad MEDIA (gestión de contenido):
6. **CategoriesView.vue** - Gestión de categorías
7. **TagsView.vue** - Gestión de tags
8. **SeriesView.vue** - Gestión de series
9. **SeriesFormView.vue** - Formulario de series
10. **CommentsView.vue** - Gestión de comentarios
11. **MenuView.vue** - Gestión de menú de navegación

### Prioridad BAJA (gestión de usuarios y blogs):
12. **UsersView.vue** - Lista de usuarios
13. **BlogsView.vue** - Gestión de blogs
14. **LoginView.vue** - Página de login
15. **SignupView.vue** - Página de registro

### Vistas especiales (revisar si necesitan traducción):
16. **LandingView.vue** - Página de aterrizaje
17. **HomeView.vue** - Página de inicio
18. **AboutView.vue** - Página acerca de
19. **ProfilePictureTestView.vue** - Vista de prueba (probablemente no necesita traducción)

## Tareas a realizar:

Para cada vista pendiente:

1. **Leer el archivo** completo para identificar todos los textos hardcodeados
2. **Identificar textos** en:
   - Títulos y subtítulos
   - Labels de formularios
   - Placeholders
   - Botones
   - Mensajes de error/éxito
   - Validaciones
   - Tooltips y títulos
   - Textos de ayuda
3. **Reemplazar textos** con:
   - `$t('namespace.key')` en templates
   - `t('namespace.key')` en script (después de importar `useI18n`)
4. **Agregar traducciones faltantes** a `es.json` y `en.json`
5. **Probar** que las traducciones se vean correctamente al cambiar el idioma
6. **Commit y push** después de completar cada vista

## Claves de traducción ya disponibles:

### common (uso general):
- save, cancel, delete, edit, create, update, close, back, next, previous
- search, filter, loading, saving, deleting
- yes, no, confirm, actions, status, date, author, title, description
- name, email, password, optional, required
- error, success, warning, info

### Namespaces disponibles:
- **common** - Acciones y textos generales
- **nav** - Navegación principal
- **dashboard** - Panel de control
- **posts** - Posts y artículos
- **pages** - Páginas estáticas
- **media** - Biblioteca de medios
- **categories** - Categorías
- **tags** - Etiquetas
- **series** - Series de posts
- **comments** - Comentarios
- **menu** - Menú de navegación
- **users** - Usuarios
- **settings** - Configuración
- **blogs** - Blogs
- **login** - Inicio de sesión
- **errors** - Mensajes de error
- **validation** - Validaciones

## Ejemplo de flujo de trabajo:

```bash
# 1. Leer la vista
Read /Users/carlosvidal/www/taita/cms/src/views/PostFormView.vue

# 2. Identificar textos como:
# - "Nuevo Post" → $t('posts.newPost')
# - "Guardar" → $t('common.save')
# - "El título es requerido" → t('validation.required')

# 3. Editar vista reemplazando textos

# 4. Agregar claves faltantes a JSON si es necesario

# 5. Commit y push
git add -A
git commit -m "feat: complete internationalization for PostFormView"
git push
```

## Notas importantes:

- **No traducir**: URLs, rutas, nombres de variables, clases CSS
- **Traducir**: Todo texto visible al usuario
- **Reusar claves**: Usar claves de `common` cuando sea posible (save, cancel, delete, etc.)
- **Crear nuevas claves**: Solo cuando el texto es específico del módulo
- **Mantener consistencia**: Seguir la estructura jerárquica de los JSON existentes
- **Plurales**: vue-i18n soporta plurales con pipe `|` (ej: "1 día | {count} días")
- **Interpolación**: Usar `{variable}` para valores dinámicos

## Comando para iniciar:

```
Continúa con la internacionalización del CMS. Comienza con PostFormView.vue siguiendo el mismo patrón usado en SettingsView, DashboardView y UserFormView. Lee el archivo completo, identifica todos los textos hardcodeados, reemplázalos con traducciones, agrega las claves faltantes a es.json y en.json, y haz commit cuando termines.
```

## Progreso actual:

- ✅ Infraestructura i18n configurada
- ✅ 8 vistas principales completadas
- ⏳ 15 vistas pendientes de traducir
- 📊 Progreso aproximado: 35% completado (8 de 23 vistas)

---

**Última actualización**: 2025-10-11
**Estado**: PagesView.vue verificada y completada. Próxima vista: MediaView.vue
