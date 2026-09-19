# Checklist — Proyecto de Distribución en Planta

Sitio estático para GitHub Pages conectado a Supabase.

## Configuración

1. Abre `app.js`.
2. Sustituye:
   - `PEGA_AQUI_TU_SUPABASE_URL`
   - `PEGA_AQUI_TU_SUPABASE_PUBLISHABLE_KEY`
3. Usa únicamente la **Project URL** y la **Publishable/anon key**. Nunca uses `service_role`.
4. Sube `index.html`, `style.css` y `app.js` a la raíz de tu repositorio de GitHub.
5. En GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

## Tablas esperadas

### `public.secciones`
- `id`
- `nombre`
- `orden`

### `public.actividades`
- `id`
- `orden`
- `actividad`
- `estado`
- `updated_at`
- `seccion_id`

La web es de solo lectura y depende de las políticas RLS configuradas en Supabase.
