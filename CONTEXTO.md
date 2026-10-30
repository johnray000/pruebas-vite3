# Contexto del proyecto: bexo.com.ve

> **Para cualquier IA o agente que lea esto:** este archivo es la fuente de verdad sobre
> qué es el proyecto, cómo está armado, qué se hizo y qué falta. Leelo completo antes de
> proponer cambios. Si cambiás la arquitectura, actualizá este archivo en el mismo commit.
>
> Última actualización: 30 oct 2026.

---

## 1. Qué es

**bexo.com.ve** es un sitio web de una sola página que muestra **la cotización del dólar
paralelo en Venezuela (VES) y en Argentina (ARS)**: el precio de hoy en una tarjeta y un
gráfico histórico por días, semanas o meses de cada país.

- Público: venezolanos (en Venezuela y Argentina) que siguen el precio del dólar.
- Acompaña al blog **blog.bexo.com.ve** y a las redes (WhatsApp, Instagram, Facebook).
- Proyecto personal de un solo dueño (`johnray000`), sin backend propio.
- El repo se llama `pruebas-vite3` por razones históricas: **es el sitio en producción**, no un repo de pruebas.

---

## 2. Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 4, JavaScript (sin TypeScript) |
| Estilos y gráficos | Tailwind CSS 3 + Tremor 3 (`@tremor/react`), íconos Remix Icon |
| Base de datos | **Supabase** (Postgres administrado, plan gratis) |
| Cliente de BD | `@supabase/supabase-js` v2 (en el navegador y en los scripts) |
| Tareas programadas | GitHub Actions (cron) |
| Hosting | GitHub Pages con dominio propio `bexo.com.ve` (archivo `CNAME`) |
| Analítica | Google Analytics (`G-Q6X37RNKGM`, en `index.html`) |
| Node | 22 en los workflows |

---

## 3. Arquitectura

```
                   ┌──────────────────────────────┐
  APIs externas    │ yadio.io  (VES)              │
                   │ criptoya.com (ARS)           │
                   └──────────────┬───────────────┘
                                  │ 3 veces por día hábil
                                  ▼
            ┌───────────────────────────────────────────┐
            │ GitHub Actions: "Actualizar cotizaciones" │
            │ node scripts/update-data.js               │
            │ (usa SUPABASE_SECRET_KEY → puede escribir)│
            └──────────────────────┬────────────────────┘
                                   │ INSERT
                                   ▼
            ┌───────────────────────────────────────────┐
            │ Supabase (Postgres)                        │
            │  tabla  cotizaciones                       │
            │  vista  cotizaciones_diarias (1 fila/día)  │
            │  RLS: lectura pública, escritura bloqueada │
            └──────────────────────┬────────────────────┘
                                   │ SELECT en vivo (clave publishable)
                                   ▼
            ┌───────────────────────────────────────────┐
            │ Navegador: React en GitHub Pages           │
            │ bexo.com.ve                                │
            └───────────────────────────────────────────┘

  El deploy (build + publicar en Pages) SOLO corre cuando cambia el código (push a main).
  Un precio nuevo NO requiere deploy: la web lo lee directo de la BD.
```

### Principios

1. **Los datos viven en la BD, no en el repo.** Nada de escribir JSON ni hacer commits desde el runner.
2. **El runner solo escribe y la web solo lee.** La web usa la clave pública; la seguridad la da Row Level Security.
3. **Se guarda el dato crudo** (`moneda`, `fuente`, `valor`, `fecha`). Todo lo derivado (semana, "29 oct", agrupaciones) se calcula al mostrar.
4. **No se guardan errores como datos.** Si una API falla o devuelve un valor absurdo, no se inserta nada y el job queda en rojo (GitHub avisa por mail).

---

## 4. Base de datos (Supabase)

Definición completa en [`supabase/schema.sql`](supabase/schema.sql). Ese archivo se pegó a mano en *Supabase → SQL Editor*. **Si cambiás el esquema, actualizá ese archivo y corré el cambio en el SQL Editor**: no hay migraciones automáticas.

### Tabla `public.cotizaciones`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint identity | PK |
| `moneda` | text | `CHECK (moneda IN ('VES','ARS'))` |
| `fuente` | text | `'yadio'` (VES), `'criptoya_ccb'` (ARS) |
| `valor` | numeric(14,2) | `CHECK (valor > 0)`: bolívares o pesos por 1 USD |
| `fecha` | timestamptz | momento de la consulta, en UTC |
| | | `UNIQUE (moneda, fecha)` |

### Vista `public.cotizaciones_diarias`

Devuelve el **último valor de cada día (UTC) por moneda**, con las columnas `moneda`, `valor`, `fecha` y `dia`. Es lo que consume el frontend. Tiene `security_invoker = true`.

### Seguridad

- RLS activado. Única política: `SELECT` para `anon` y `authenticated`.
- **Clave publishable** (`sb_publishable_…`): va al navegador y es pública a propósito. Solo puede leer.
- **Clave secreta** (`sb_secret_…`): saltea RLS. **Solo** va en GitHub Secrets y en `.env.local`. Nunca en el frontend, el código ni el chat.

### Volumen

- ~4.550 filas al migrar (oct 2026) y crece ~1.500 por año. ARS desde nov 2022 y VES desde oct 2023.
- El plan gratis de Supabase **pausa el proyecto tras 7 días sin actividad**. El runner de lunes a viernes alcanza para mantenerlo activo.

---

## 5. Estructura del repo

```
.
├── CONTEXTO.md                 ← este archivo
├── AGENTS.md / CLAUDE.md       ← apuntan a este archivo (los leen los agentes de IA)
├── README.md                   ← lista informal de tareas del dueño (PENDIENTE / READY)
├── supabase/schema.sql         ← esquema de la BD (tabla, vista, RLS)
├── scripts/                    ← corren en Node (GitHub Actions o local), NO en el navegador
│   ├── update-data.js          ← RUNNER: consulta APIs → inserta en Supabase
│   ├── migrar-json.js          ← migración única de los JSON viejos (se puede repetir sin duplicar)
│   ├── verificar-lectura.js    ← chequea que la clave pública lea y no escriba
│   └── log.js                  ← errores como anotaciones ::error:: + validación de variables
├── src/
│   ├── main.jsx, App.jsx       ← layout: logo, redes, 2 gráficos + 2 tarjetas
│   ├── lib/supabase.js         ← cliente Supabase del navegador
│   ├── lib/supabaseUrl.js      ← normaliza la URL del proyecto (acepta varios formatos)
│   ├── hooks/useCotizaciones.js← lee cotizaciones_diarias paginando de a 1000 y con caché por moneda
│   ├── components/
│   │   ├── ChartCotizacion.jsx ← gráfico genérico (props: moneda, titulo, serie, color)
│   │   ├── CardCotizacion.jsx  ← tarjeta "precio de hoy" genérica
│   │   ├── Redes-Menu-Icons.jsx← íconos de WhatsApp, Instagram, Facebook y Blog
│   │   ├── ChartAreaPrueba.jsx, CardPrueba.jsx, GraficoARSwithCustomTooltip.jsx
│   │   │                         ← SIN USO: experimentos con datos de ejemplo
│   ├── data/                   ← LEGACY: JSON del sistema viejo (ver sección 9)
│   └── assets/                 ← logo y banderas
├── public/                     ← favicon (bexo2.png), CNAME
└── .github/workflows/
    ├── update-data.yml         ← "Actualizar cotizaciones" (cron)
    ├── jekyll-gh-pages.yml     ← "Deploy static content to Pages" (push a main)
    └── migrar-datos.yml        ← "Migrar histórico a Supabase" (temporal, ver pendientes)
```

---

## 6. Workflows (GitHub Actions)

| Workflow | Cuándo corre | Qué hace |
|---|---|---|
| **Actualizar cotizaciones** (`update-data.yml`) | cron `0 8,13,18 * * 1-5` (UTC, lun a vie), aprox. 05, 10 y 15 h de Uruguay; también a mano | `node scripts/update-data.js`. Sin commit ni deploy. GitHub puede atrasar el cron hasta ~1 h. |
| **Deploy static content to Pages** (`jekyll-gh-pages.yml`) | push a `main` o a mano | `npm ci` → `npm run build` (con las variables `VITE_*`) → publica `dist/` en Pages. El nombre "jekyll" es histórico: no usa Jekyll. |
| **Migrar histórico a Supabase** (`migrar-datos.yml`) | push a la rama `base-de-datos` o a mano | Carga los JSON de `main` con upsert, prueba el runner, verifica la lectura pública y compila. |

### Reglas del runner (`scripts/update-data.js`)

- Las fuentes están en el array `FUENTES`: VES = `1 / yadio.VES.USD` (2 decimales) y ARS = `criptoya.cripto.ccb.bid` (0 decimales).
- Rechaza valores no numéricos o ≤ 0.
- **Rechaza saltos absurdos:** si el valor nuevo es más del triple o menos de un tercio del último guardado, no lo inserta. Se agregó después de que un valor corrupto (2732 en vez de 110) generara un pico falso.
- Si una fuente falla, las demás igual se guardan y el job termina en rojo.

---

## 7. Configuración

En GitHub, en *Settings → Secrets and variables → Actions*:

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `SUPABASE_URL` | URL del proyecto |
| Secret | `SUPABASE_SECRET_KEY` | `sb_secret_…` |
| Variable | `VITE_SUPABASE_URL` | URL del proyecto |
| Variable | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| Secret (obsoleto) | `TOKEN_DOS` | lo usaba el runner viejo para hacer push. Ya no se usa: se puede borrar. |

La URL va como `https://<ref>.supabase.co`, aunque el código también acepta `/rest/v1`, el link del panel o el ID suelto (`src/lib/supabaseUrl.js`).

Para trabajar en local: copiar `.env.example` a `.env.local` (ignorado por git) y completar los 4 valores.

### Comandos npm

| Comando | Qué hace |
|---|---|
| `npm run dev` | sitio local (lee la BD real con la clave pública) |
| `npm run build` | compila a `dist/` |
| `npm run actualizar` | corre el runner en local (**escribe en la BD real**) |
| `npm run migrar` | re-carga los JSON de `src/data` en la BD (upsert) |

---

## 8. Historial: qué se hizo

**2023 a 2024: sistema original**
- Se creó el sitio con Vite + React y se migró el layout a Tailwind + Tremor.
- Gráficos con pestañas Días/Semanas/Meses y tarjetas con el precio del día.
- Se agregó Argentina (histórico ARS cargado a mano desde Excel con los scripts de `src/data/tool/`).
- Dominio propio con GitHub Pages ("NO FUE FÁCIL, SEMANAS").
- El runner guardaba cada cotización en JSON dentro del repo, hacía commit y redeploy completo 3 veces por día.

**30 oct 2026: migración a base de datos (PRs #22 y #23)**
- Se creó Supabase con la tabla `cotizaciones`, la vista `cotizaciones_diarias` y RLS.
- El runner pasó a escribir en la BD y ya no hace commit ni deploy.
- La web pasó a leer en vivo. Los 4 componentes duplicados (`ChartVES_withTab`, `ChartARS_withTab`, `CardSimple`, `CardSimple_ARS`) se reemplazaron por `ChartCotizacion` y `CardCotizacion`.
- Se migró el histórico: `data*.json` + `updates*.json`, con prioridad a `data*.json` y descartando 8 registros con error.
- Se corrigió un valor corrupto que venía de `updates.json` (VES 06/05/2025 = 2732,24, real 110,24).
- Se sacó `axios` (ahora se usa `fetch` nativo).
- Se arregló de paso que el gráfico ARS no ordenaba los datos.

---

## 9. Pendiente y plan

### Limpieza post-migración (próximo paso)
- [ ] Borrar `src/data/` (JSON viejos y `tool/`): ya están en la BD y no los importa nada.
- [ ] Borrar `.github/workflows/migrar-datos.yml` y `scripts/migrar-json.js` (opcional: se pueden dejar como respaldo).
- [ ] Borrar el secret `TOKEN_DOS`.
- [ ] Borrar los componentes sin uso: `ChartAreaPrueba.jsx`, `CardPrueba.jsx`, `GraficoARSwithCustomTooltip.jsx` y `src/assets/react.svg`.
- [ ] Borrar la rama `base-de-datos` si ya no se usa.

### Mantenimiento técnico
- [ ] Actualizar las actions a versiones que corran en Node 24 (`actions/checkout`, `actions/setup-node`, `configure-pages`). Hoy GitHub muestra un aviso de deprecación de Node 20.
- [ ] El bundle JS pesa ~1,15 MB (sobre todo Tremor y Recharts): evaluar code splitting.
- [ ] `semanaDelAnio` en `ChartCotizacion.jsx` no es la semana ISO (cuenta desde el 1 de enero). Funciona, pero se puede cambiar por ISO.
- [ ] Las etiquetas de fecha del gráfico usan el idioma del navegador (`toLocaleString("default")`): fijar `es`.

### Ideas y funcionalidades del dueño (de `README.md`)
- [ ] **Dólar oficial** (BCV para Venezuela, oficial para Argentina), en gráfico dual con el paralelo. `ChartAreaPrueba` sirvió de prueba. **Ver la advertencia de abajo.**
- [ ] Decidir qué mostrar en el espacio del "precio del día" (por ejemplo, el último post del blog con el precio destacado).
- [ ] Agregar los colores de la marca a la paleta de Tailwind.
- [ ] Mejorar qué tan rápido carga y se adapta el layout ("conseguir la forma eficiente de que adapte rápido").
- [ ] Hotspot o "nuevo" llamativo en el blog (parcialmente hecho en `Redes-Menu-Icons.jsx`).

### ⚠️ Antes de agregar otra fuente para la misma moneda (por ejemplo, el dólar oficial)
Hoy el modelo asume **una fuente por moneda**:
- `UNIQUE (moneda, fecha)`: el runner usa el mismo `fecha` para todas las fuentes, así que dos fuentes VES en la misma corrida chocarían.
- La vista `cotizaciones_diarias` agrupa por `(moneda, día)` y mezclaría paralelo con oficial.
- `useCotizaciones(moneda)` filtra solo por moneda.

Opción recomendada: cambiar el unique a `(moneda, fuente, fecha)`, agregar `fuente` al `DISTINCT ON` y al `SELECT` de la vista, y hacer que el hook y los componentes reciban `moneda` y `fuente`. Para agregar una moneda nueva (por ejemplo, COP), hay que ampliar el `CHECK` de `moneda`.

---

## 10. Detalles y trampas conocidas

- **ARS "Dólar Blue"** en realidad es el **CCB cripto (bid) de CriptoYa**, no el blue informal. Se eligió así a propósito y se mantiene por consistencia histórica.
- Supabase devuelve **máx. 1000 filas por pedido**: el hook pagina con `.range()`. No lo quites (ARS ya supera los 1000 días).
- Los tooltips muestran `38,51` en vez de `38.51` porque Tremor formatea según el idioma del navegador.
- El gráfico usa `curveType="natural"`, así que un valor atípico genera "rebotes" visuales por debajo de 0. Si vuelve a pasar, revisá los datos antes de tocar el gráfico.
- Los errores de configuración en los workflows aparecen como **anotaciones** en el resumen del run (gracias a `scripts/log.js`), sin necesidad de abrir el log.
- GitHub manda un mail por cada run fallido, y a veces llega tarde. Hay que mirar la fecha del run antes de asumir que algo está roto.

---

## 11. Convenciones para trabajar en este repo

- **Idioma:** código, comentarios, commits y UI en **español** (rioplatense o venezolano informal está bien).
- **Flujo de git:** cambios en una rama, después PR a `main`. El push a `main` dispara el deploy.
- **Nunca** subir claves secretas, ni volver a guardar datos en archivos del repo.
- Cambios de esquema: editar `supabase/schema.sql` y explicar qué correr en el SQL Editor.
- **Preferencia del dueño para instrucciones de terminal:** cada comando en su propio bloque de código, numerado y con una línea que diga qué hace. Nunca juntar varios comandos en un bloque ni encadenarlos con `&&` o `;`.
- El dueño trabaja mayormente **desde GitHub (web), sin clon local**: preferí soluciones que se puedan ejecutar con GitHub Actions o desde el panel de Supabase.
