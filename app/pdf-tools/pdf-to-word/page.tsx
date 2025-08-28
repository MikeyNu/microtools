'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileText, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface ConvertedFile {
  name: string
  originalName: string
  downloadUrl: string
  pages: number
}

export default function PDFToWordPage() {
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
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
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const convertFiles = async () => {
    if (files.length === 0) return

    setConverting(true)
    setProgress(0)
    setError(null)
    setConvertedFiles([])

    try {
      // Simulate conversion process
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Simulate conversion delay
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Simulate conversion results
        const convertedFile: ConvertedFile = {
          name: file.name.replace('.pdf', '.docx'),
          originalName: file.name,
          downloadUrl: URL.createObjectURL(file), // In real app, this would be the converted file
          pages: Math.floor(Math.random() * 20) + 1
        }
        
        setConvertedFiles(prev => [...prev, convertedFile])
        setProgress(((i + 1) / files.length) * 100)
      }
    } catch (err) {
      setError('Failed to convert files. Please try again.')
    } finally {
      setConverting(false)
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
    convertedFiles.forEach(file => {
      const link = document.createElement('a')
      link.href = file.downloadUrl
      link.download = file.name
      link.click()
    })
  }

  const reset = () => {
    setFiles([])
    setConvertedFiles([])
    setProgress(0)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PDF to Word Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert PDF files to editable Word documents. Maintain formatting and layout.
          </p>
        </div>

        {/* Upload Area */}
        {convertedFiles.length === 0 && (
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
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-4 mb-4">
                  <FileText className="h-12 w-12 text-red-500" />
                  <ArrowRight className="h-8 w-8 text-gray-400" />
                  <FileText className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop PDF files here' : 'Choose PDF files or drag them here'}
                </p>
                <p className="text-sm text-gray-500">
                  Maximum file size: 50MB per file
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Selected Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button onClick={convertFiles} disabled={converting} className="flex-1">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {converting ? 'Converting...' : 'Convert to Word'}
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
        {converting && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Converting Files...</h3>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {convertedFiles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Conversion Complete
              </CardTitle>
              <CardDescription>
                Your PDF files have been successfully converted to Word documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {convertedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          Converted from {file.originalName} • {file.pages} pages
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <a href={file.downloadUrl} download={file.name}>
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
                  Convert More Files
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
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Preserve Formatting</h3>
              <p className="text-gray-600 text-sm">Maintains original layout, fonts, and formatting</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">OCR Support</h3>
              <p className="text-gray-600 text-sm">Converts scanned PDFs to editable text</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Conversion</h3>
              <p className="text-gray-600 text-sm">Quick and accurate PDF to Word conversion</p>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversion Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Text-based PDFs convert with higher accuracy than scanned documents
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Complex layouts may require manual adjustment after conversion
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Images and tables are preserved in the converted document
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Password-protected PDFs need to be unlocked before conversion
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* AdSense Placeholder */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Advertisement Space</p>
        </div>
      </div>
    </div>
  )
}