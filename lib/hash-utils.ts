import { bytesToArrayBuffer } from './blob-utils'

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'CRC32'

function toUint8Array(data: string | ArrayBuffer | Uint8Array): Uint8Array {
  if (typeof data === 'string') return new TextEncoder().encode(data)
  if (data instanceof Uint8Array) return data
  return new Uint8Array(data)
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function wordsToHexLE(words: number[]): string {
  const bytes = new Uint8Array(words.length * 4)
  const view = new DataView(bytes.buffer)
  words.forEach((word, index) => view.setUint32(index * 4, word >>> 0, true))
  return bytesToHex(bytes)
}

function rotateLeft(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0
}

export function md5Hex(data: string | ArrayBuffer | Uint8Array): string {
  const input = toUint8Array(data)
  const bitLength = input.length * 8
  const paddedLength = (((input.length + 8) >>> 6) + 1) << 6
  const buffer = new Uint8Array(paddedLength)
  buffer.set(input)
  buffer[input.length] = 0x80

  const view = new DataView(buffer.buffer)
  view.setUint32(paddedLength - 8, bitLength >>> 0, true)
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true)

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]
  const constants = Array.from({ length: 64 }, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0
  )

  for (let offset = 0; offset < buffer.length; offset += 64) {
    const chunk = Array.from({ length: 16 }, (_, index) => view.getUint32(offset + index * 4, true))
    let aa = a
    let bb = b
    let cc = c
    let dd = d

    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number

      if (i < 16) {
        f = (bb & cc) | (~bb & dd)
        g = i
      } else if (i < 32) {
        f = (dd & bb) | (~dd & cc)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = bb ^ cc ^ dd
        g = (3 * i + 5) % 16
      } else {
        f = cc ^ (bb | ~dd)
        g = (7 * i) % 16
      }

      const temp = dd
      dd = cc
      cc = bb
      bb = (bb + rotateLeft((aa + f + constants[i] + chunk[g]) >>> 0, shifts[i])) >>> 0
      aa = temp
    }

    a = (a + aa) >>> 0
    b = (b + bb) >>> 0
    c = (c + cc) >>> 0
    d = (d + dd) >>> 0
  }

  return wordsToHexLE([a, b, c, d])
}

export function crc32Hex(data: string | ArrayBuffer | Uint8Array): string {
  const bytes = toUint8Array(data)
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }

  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0')
}

export async function generateHashHex(
  data: string | ArrayBuffer | Uint8Array,
  algorithm: HashAlgorithm
): Promise<string> {
  if (algorithm === 'MD5') return md5Hex(data)
  if (algorithm === 'CRC32') return crc32Hex(data)

  const bytes = toUint8Array(data)
  const digest = await crypto.subtle.digest(algorithm, bytesToArrayBuffer(bytes))
  return bytesToHex(new Uint8Array(digest))
}

export const HASH_OUTPUT_BITS: Record<HashAlgorithm, number> = {
  MD5: 128,
  'SHA-1': 160,
  'SHA-256': 256,
  'SHA-384': 384,
  'SHA-512': 512,
  CRC32: 32,
}
