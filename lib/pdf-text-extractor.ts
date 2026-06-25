function cleanPdfString(value: string): string {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
    .trim()
}

export function extractTextFromPDFBytes(bytes: Uint8Array): string {
  const decoder = new TextDecoder('latin1')
  const raw = decoder.decode(bytes)
  const lines: string[] = []

  const btEtRe = /BT([\s\S]*?)ET/g
  let btMatch: RegExpExecArray | null

  while ((btMatch = btEtRe.exec(raw)) !== null) {
    const block = btMatch[1]

    const tjRe = /\(([^)]*)\)\s*Tj/g
    let tjMatch: RegExpExecArray | null
    while ((tjMatch = tjRe.exec(block)) !== null) {
      const text = cleanPdfString(tjMatch[1])
      if (text) lines.push(text)
    }

    const tjArrayRe = /\[([^\]]*)\]\s*TJ/g
    let tjArrMatch: RegExpExecArray | null
    while ((tjArrMatch = tjArrayRe.exec(block)) !== null) {
      const strRe = /\(([^)]*)\)/g
      let strMatch: RegExpExecArray | null
      const parts: string[] = []
      while ((strMatch = strRe.exec(tjArrMatch[1])) !== null) {
        const text = cleanPdfString(strMatch[1])
        if (text) parts.push(text)
      }
      if (parts.length) lines.push(parts.join(' '))
    }
  }

  const looseTjRe = /\(([^)]{1,200})\)\s*Tj/g
  let looseMatch: RegExpExecArray | null
  while ((looseMatch = looseTjRe.exec(raw)) !== null) {
    const text = cleanPdfString(looseMatch[1])
    if (text && text.length > 2 && !lines.includes(text)) lines.push(text)
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
