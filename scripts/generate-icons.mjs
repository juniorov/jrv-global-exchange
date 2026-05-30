import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('./public/icons', { recursive: true })

// Source SVG — inline so it renders consistently with sharp/resvg
const svgSrc = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <!-- Two-arrow exchange symbol -->
  <g stroke="white" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Arrow right (top) -->
    <line x1="106" y1="186" x2="360" y2="186"/>
    <polyline points="306,134 366,186 306,238"/>
    <!-- Arrow left (bottom) -->
    <line x1="406" y1="326" x2="152" y2="326"/>
    <polyline points="206,274 146,326 206,378"/>
  </g>
</svg>
`

const buf = Buffer.from(svgSrc)

const sizes = [
  { size: 512, file: 'public/icons/icon-512.png' },
  { size: 192, file: 'public/icons/icon-192.png' },
  { size: 180, file: 'public/icons/apple-touch-icon.png' },
  { size: 48,  file: 'public/icons/favicon-48.png' },
]

for (const { size, file } of sizes) {
  await sharp(buf).resize(size, size).png().toFile(file)
  console.log(`✓ ${file}`)
}

// Maskable icon: same but with more padding (safe area = 10%)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g stroke="white" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" fill="none"
     transform="translate(56,56) scale(0.78)">
    <line x1="106" y1="186" x2="360" y2="186"/>
    <polyline points="306,134 366,186 306,238"/>
    <line x1="406" y1="326" x2="152" y2="326"/>
    <polyline points="206,274 146,326 206,378"/>
  </g>
</svg>
`

await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile('public/icons/icon-maskable-512.png')
console.log('✓ public/icons/icon-maskable-512.png')

console.log('\nDone! All icons generated.')
