import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'build')
fs.mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createPng(size, rgbaFn) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1)
    raw[row] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = rgbaFn(x, y, size)
      const i = row + 1 + x * 4
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
      raw[i + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function tealDisc(x, y, size) {
  const cx = (size - 1) / 2
  const cy = (size - 1) / 2
  const dx = x - cx
  const dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const r = size * 0.42
  if (dist > r) return [0, 0, 0, 0]
  const edge = Math.max(0, Math.min(1, r - dist))
  const a = Math.round(255 * Math.min(1, edge * 2 + 0.2))
  return [15, 118, 110, a]
}

const png16 = createPng(16, tealDisc)
const png256 = createPng(256, tealDisc)
fs.writeFileSync(path.join(outDir, 'icon.png'), png256)
fs.writeFileSync(path.join(outDir, 'tray.png'), png16)

// Minimal ICO with one 256 PNG (Vista+)
const ico = Buffer.concat([
  Buffer.from([0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 32, 0]),
  (() => {
    const b = Buffer.alloc(4)
    b.writeUInt32LE(png256.length)
    return b
  })(),
  (() => {
    const b = Buffer.alloc(4)
    b.writeUInt32LE(22)
    return b
  })(),
  png256,
])
fs.writeFileSync(path.join(outDir, 'icon.ico'), ico)
console.log('Generated build/icon.png, build/tray.png, build/icon.ico')
