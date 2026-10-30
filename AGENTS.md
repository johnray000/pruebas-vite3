# Instrucciones para agentes de IA

Antes de hacer cualquier cosa en este repo, leé **[CONTEXTO.md](CONTEXTO.md)**. Ahí está qué
es el proyecto, la arquitectura (React + Vite en GitHub Pages, Supabase como base de
datos y un runner en GitHub Actions), lo que ya se hizo, lo pendiente y las convenciones.

Reglas mínimas:
- Responder y escribir código, comentarios y commits en español.
- Los datos viven en Supabase: nunca volver a guardarlos en archivos JSON del repo.
- Nunca exponer la clave secreta de Supabase (`sb_secret_…`).
- Si cambiás la arquitectura, actualizá `CONTEXTO.md` en el mismo cambio.
