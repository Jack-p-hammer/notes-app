import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function makeIcon(size, outPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#a1a1aa'
  const pad = size * 0.2
  const w = size - pad * 2
  const h = size - pad * 2
  ctx.fillRect(pad, pad, w, h)
  ctx.fillStyle = '#18181b'
  const lx = pad + w * 0.15
  const lw = w * 0.7
  const ly = pad + h * 0.25
  const ls = h * 0.12
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(lx, ly + i * ls * 1.5, lw, ls * 0.6)
  }
  writeFileSync(outPath, canvas.toBuffer('image/png'))
}

makeIcon(192, 'public/pwa-192.png')
makeIcon(512, 'public/pwa-512.png')
console.log('Icons generated.')
