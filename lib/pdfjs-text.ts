export interface ExtractedPdfPage {
  pageNumber: number
  lines: string[]
  text: string
}

interface PdfTextItem {
  str: string
  transform: number[]
  width: number
  height: number
  dir: string
  fontName: string
  hasEOL: boolean
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return Boolean(item && typeof (item as PdfTextItem).str === 'string' && Array.isArray((item as PdfTextItem).transform))
}

function groupTextItemsIntoLines(items: PdfTextItem[]): string[] {
  const positioned = items
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform[4] ?? 0,
      y: item.transform[5] ?? 0,
      width: item.width ?? 0,
    }))
    .filter((item) => item.text.length > 0)
    .sort((a, b) => (Math.abs(b.y - a.y) > 2 ? b.y - a.y : a.x - b.x))

  const rows: { y: number; items: typeof positioned }[] = []

  for (const item of positioned) {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= 2)
    if (row) {
      row.items.push(item)
      row.y = (row.y + item.y) / 2
    } else {
      rows.push({ y: item.y, items: [item] })
    }
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => {
      const sorted = row.items.sort((a, b) => a.x - b.x)
      const parts: string[] = []
      let lastEnd = Number.NEGATIVE_INFINITY

      for (const item of sorted) {
        const gap = item.x - lastEnd
        if (parts.length > 0 && gap > 10) parts.push(' ')
        parts.push(item.text)
        lastEnd = item.x + item.width
      }

      return parts.join('').replace(/\s{2,}/g, ' ').trim()
    })
    .filter(Boolean)
}

export async function extractPdfTextPages(file: File): Promise<ExtractedPdfPage[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }

  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = pdfjs.getDocument({ data })
  const pdf = await loadingTask.promise
  const pages: ExtractedPdfPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const textItems = textContent.items.filter((item): item is PdfTextItem => isPdfTextItem(item))
    const lines = groupTextItemsIntoLines(textItems)
    pages.push({
      pageNumber,
      lines,
      text: lines.join('\n'),
    })
  }

  await loadingTask.destroy()
  return pages
}
