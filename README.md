# Tipo de Cambio Global

Conversor de monedas multi-destino con soporte offline. Permite convertir un monto desde una moneda origen hacia varias monedas destino al mismo tiempo, y funciona sin conexión a internet usando los últimos tipos de cambio guardados.

## Funcionalidades

- **Conversión multi-destino** — seleccionás una moneda y ves el resultado en todas las que quieras simultáneamente
- **Más de 40 monedas** — con énfasis en América Latina (CRC, BRL, MXN, COP, ARS, CLP…) y monedas globales
- **Funciona offline** — guarda los tipos de cambio en el dispositivo; si no hay internet usa los últimos datos disponibles
- **Instalable como app** — se puede agregar a la pantalla de inicio en Android e iPhone (PWA)
- **Guarda tu selección** — recuerda la moneda origen y las monedas destino entre sesiones
- **Actualización diaria** — los tipos de cambio se actualizan una vez al día automáticamente

## Tecnologías

| Tecnología | Uso |
|---|---|
| Vue 3 | Framework UI (Composition API) |
| Vite | Bundler y servidor de desarrollo |
| Bootstrap 5 | Componentes y estilos |
| vite-plugin-pwa | Service worker y manifest PWA |
| Workbox | Estrategias de caché offline |
| sharp | Generación de íconos PNG en build |
| Open Exchange Rate API | Tipos de cambio (gratuita, sin API key) |

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Previsualizar el build
npm run preview
```

El comando `build` genera automáticamente los íconos PNG y luego compila la app con el service worker incluido.

## Estructura del proyecto

```
src/
├── App.vue                      # Layout y banner de instalación PWA
├── main.js                      # Punto de entrada
├── style.css                    # Estilos globales
├── components/
│   └── CurrencyConverter.vue    # Componente principal
├── composables/
│   ├── useExchangeRate.js       # Lógica de API y caché de tipos de cambio
│   └── useInstallPrompt.js      # Prompt de instalación PWA
└── data/
    └── currencies.js            # Definición de monedas
```

## Cómo funciona offline

El app usa dos capas de persistencia:

1. **Service Worker (Workbox)** — precachea todos los archivos de la app (HTML, CSS, JS, íconos). La app carga aunque no haya internet.
2. **localStorage** — guarda los tipos de cambio después de cada fetch. Si el dispositivo está offline, usa el último dato guardado y muestra cuándo fue la última actualización.

Los tipos de cambio se consideran válidos hasta la fecha que indica la API (`time_next_update_unix`). Cuando vencen y hay conexión, se actualizan automáticamente al abrir la app.

## Deploy en Netlify

El proyecto incluye `netlify.toml` con toda la configuración necesaria. Solo hay que conectar el repositorio en Netlify:

- **Comando de build:** `npm run build`
- **Carpeta publicada:** `dist/`
- **Variables de entorno:** ninguna requerida

La API de tipos de cambio es pública y gratuita, no requiere API key.

## Instalar como app en el celular

**Android (Chrome):**
Al abrir el sitio, aparece un banner con el botón "Instalar". También se puede instalar desde el menú del navegador → "Agregar a pantalla de inicio".

**iPhone (Safari):**
1. Abrir el sitio en Safari
2. Tocar el botón de compartir (⎋)
3. Seleccionar "Agregar a inicio"

Una vez instalada, la app se abre sin barra del navegador y funciona completamente offline.
