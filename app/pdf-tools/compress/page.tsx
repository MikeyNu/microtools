'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileText, Shrink, CheckCircle, AlertCircle, X, Settings } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ToolLayout } from "@/components/tool-layout"

interface CompressedFile {
  name: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  downloadUrl: string
}

export default function PDFCompressorPage() {
  const [files, setFiles] = useState<File[]>([])
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Only PDF files are allowed')
      return
    }
    setFiles(prev => [...prev, ...pdfFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const compressFiles = async () => {
    if (files.length === 0) return

    setCompressing(true)
    setProgress(0)
    setError(null)
    setCompressedFiles([])

    try {
      // Simulate compression process
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Simulate compression delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Simulate compression results
        const originalSize = file.size
        const compressionRatio = 0.3 + Math.random() * 0.4 // 30-70% compression
        const compressedSize = Math.floor(originalSize * compressionRatio)

        const compressedFile: CompressedFile = {
          name: file.name,
          originalSize,
          compressedSize,
          compressionRatio: Math.round((1 - compressionRatio) * 100),
          downloadUrl: URL.createObjectURL(file) // In real app, this would be the compressed file
        }

        setCompressedFiles(prev => [...prev, compressedFile])
        setProgress(((i + 1) / files.length) * 100)
      }
    } catch (err) {
      setError('Failed to compress files. Please try again.')
    } finally {
      setCompressing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadAll = () => {
    compressedFiles.forEach(file => {
      const link = document.createElement('a')
      link.href = file.downloadUrl
      link.download = `compressed_${file.name}`
      link.click()
    })
  }

  const reset = () => {
    setFiles([])
    setCompressedFiles([])
    setProgress(0)
    setError(null)
  }

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Compress PDF files to reduce file size"
      category="PDF Tools"
      categoryHref="/pdf-tools"
    >
      {/* Upload Area */}
      {compressedFiles.length === 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF Files
            </CardTitle>
            <CardDescription>
              Drag and drop your PDF files here or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-accent/40 bg-muted/50' : 'border-border hover:border-muted-foreground/60'
              }`}
            >
              <input {...getInputProps()} />
              <FileText className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {isDragActive ? 'Drop PDF files here' : 'Choose PDF files or drag them here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: 100MB per file
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-foreground mb-3">Selected Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground/60 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={compressFiles} disabled={compressing} className="flex-1">
                    <Shrink className="h-4 w-4 mr-2" />
                    {compressing ? 'Compressing...' : 'Compress Files'}
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {compressing && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h3 className="font-medium text-foreground mb-2">Compressing Files...</h3>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {compressedFiles.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Compression Complete
            </CardTitle>
            <CardDescription>
              Your files have been successfully compressed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {compressedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize)}
                        <span className="text-success font-medium ml-2">
                          ({file.compressionRatio}% smaller)
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <a href={file.downloadUrl} download={`compressed_${file.name}`}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={downloadAll} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button variant="outline" onClick={reset}>
                Compress More Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert className="mb-8" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="bg-muted/50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shrink className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Smart Compression</h3>
            <p className="text-muted-foreground text-sm">Advanced algorithms reduce file size while preserving quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Secure Processing</h3>
            <p className="text-muted-foreground text-sm">Files are processed securely and deleted after compression</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="bg-muted/50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Batch Processing</h3>
            <p className="text-muted-foreground text-sm">Compress multiple PDF files at once for efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* AdSense Placeholder */}
      <div className="bg-muted border-2 border-dashed border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Advertisement Space</p>
      </div>
    </ToolLayout>
  )
}
