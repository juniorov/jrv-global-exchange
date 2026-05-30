# CLAUDE.md — Tipo de Cambio Global

Contexto del proyecto para Claude Code.

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 8** como bundler
- **Bootstrap 5** + **Bootstrap Icons** para UI
- **vite-plugin-pwa** + Workbox para service worker y manifest PWA
- **sharp** (devDependency) para generar íconos PNG en build time

## Comandos

```bash
npm run dev      # servidor local en http://localhost:5173
npm run build    # genera íconos PNG → compila → genera SW + manifest en dist/
npm run preview  # sirve la carpeta dist/ localmente
```

El script de build corre `scripts/generate-icons.mjs` antes de Vite. Si se cambia el diseño del ícono, el cambio se aplica automáticamente en el próximo build.

## Estructura

```
src/
├── App.vue                          # Layout principal + banner de instalación PWA
├── main.js                          # Bootstrap 5/Icons, monta Vue
├── style.css                        # Estilos globales (mobile-first)
├── components/
│   └── CurrencyConverter.vue        # Componente principal: resultados arriba, controles abajo
├── composables/
│   ├── useExchangeRate.js           # Fetch + caché localStorage de tipos de cambio
│   └── useInstallPrompt.js          # Evento beforeinstallprompt para instalar PWA
└── data/
    └── currencies.js                # Lista de ~40 monedas con código, nombre, bandera y región

public/
└── icons/                           # Íconos PNG generados por scripts/generate-icons.mjs
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    ├── apple-touch-icon.png
    └── favicon-48.png

scripts/
└── generate-icons.mjs               # Genera todos los PNG desde un SVG embebido usando sharp
```

## Datos y caché

### Tipos de cambio (`useExchangeRate.js`)
- API gratuita: `https://open.er-api.com/v6/latest/USD`
- Se actualiza una vez por día (la API lo indica en `time_next_update_unix`)
- Se guarda en `localStorage` con la clave `er_cache_v2`
- Estructura guardada: `{ rates, timestamp, nextUpdate }`
- Conversión entre monedas usa USD como pivote: `amount / fromRate * toRate`
- Singleton: un solo fetch aunque haya múltiples componentes montados

### Preferencias del usuario (`CurrencyConverter.vue`)
- Clave `localStorage`: `converter_prefs_v1`
- Guarda: `{ fromCurrency, targetCurrencies[] }`
- Se persiste con `watch` en cada cambio
- "Limpiar todo" borra el localStorage y resetea a defaults (USD → EUR, BRL, CRC)

### Service Worker (Workbox)
- Precachea todos los assets del build (JS, CSS, HTML, PNG, fuentes)
- `NetworkFirst` para la API de tipos de cambio (timeout 5s → fallback a cache)
- `CacheFirst` para fuentes woff/woff2 (1 año)

## Comportamiento offline

1. Si hay caché válido (antes del `nextUpdate`) → usa el caché, no hace fetch
2. Si hay caché vencido y hay red → fetch nuevo, actualiza caché
3. Si hay caché vencido y no hay red → usa el caché vencido con aviso
4. Si no hay caché y no hay red → muestra estado vacío con mensaje

## Instalación PWA

- **Android**: el evento `beforeinstallprompt` muestra un banner en la app con botón "Instalar". Solo aparece si el navegador determina que cumple los criterios (HTTPS, SW activo, manifest válido).
- **iOS**: banner manual con instrucción "toca ⎋ → Agregar a inicio".
- El toast "App instalada correctamente" solo aparece cuando el evento `appinstalled` se dispara en la sesión actual (no al abrir la app ya instalada).
- En modo standalone (`display-mode: standalone`) no se muestran ninguno de los banners.

## Monedas soportadas

Definidas en `src/data/currencies.js`. Cada entrada tiene:
```js
{ code: 'CRC', name: 'Colón Costarricense', flag: '🇨🇷', region: 'latam' }
```

Regiones: `latam`, `americas`, `europe`, `asia`, `oceania`, `mideast`, `africa`.

Solo se muestran en el selector las monedas que existen en la respuesta de la API (filtro en `availableCurrencies`).

## Deploy en Netlify

El archivo `netlify.toml` configura:
- Comando de build: `npm run build`
- Carpeta publicada: `dist/`
- Headers de caché: assets inmutables (1 año), HTML y SW sin caché
- Header `Content-Type` correcto para el manifest PWA

No se necesitan variables de entorno. La API de tipos de cambio es pública y gratuita.
