export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('Invalid random range')
  }

  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
  const buffer = new Uint32Array(1)

  do {
    crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)

  return buffer[0] % maxExclusive
}

export function secureRandomString(length: number, alphabet: string): string {
  if (!Number.isSafeInteger(length) || length < 0) throw new Error('Invalid random string length')
  if (!alphabet.length) throw new Error('Alphabet cannot be empty')

  let result = ''
  for (let i = 0; i < length; i++) {
    result += alphabet[secureRandomInt(alphabet.length)]
  }
  return result
}

export function secureRandomId(bytes = 12): string {
  const buffer = new Uint8Array(bytes)
  crypto.getRandomValues(buffer)
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
