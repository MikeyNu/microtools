'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileImage, ArrowRight, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface ConvertedImage {
  name: string
  originalName: string
  originalFormat: string
  targetFormat: string
  originalSize: number
  convertedSize: number
  downloadUrl: string
  preview: string
}

const imageFormats = [
  { value: 'jpeg', label: 'JPEG', extension: '.jpg' },
  { value: 'png', label: 'PNG', extension: '.png' },
  { value: 'webp', label: 'WebP', extension: '.webp' },
  { value: 'gif', label: 'GIF', extension: '.gif' },
  { value: 'bmp', label: 'BMP', extension: '.bmp' },
  { value: 'tiff', label: 'TIFF', extension: '.tiff' }
]

export default function FormatConverterPage() {
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState('webp')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== acceptedFiles.length) {
      setError('Only image files are allowed')
      return
    }
    setFiles(prev => [...prev, ...imageFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileFormat = (file: File): string => {
    const type = file.type.toLowerCase()
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg'
    if (type.includes('png')) return 'png'
    if (type.includes('webp')) return 'webp'
    if (type.includes('gif')) return 'gif'
    if (type.includes('bmp')) return 'bmp'
    if (type.includes('tiff')) return 'tiff'
    return 'unknown'
  }

  const convertImages = async () => {
    if (files.length === 0) return

    setConverting(true)
    setProgress(0)
    setError(null)
    setConvertedImages([])

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const originalFormat = getFileFormat(file)
        
        // Skip if already in target format
        if (originalFormat === targetFormat) {
          setError(`${file.name} is already in ${targetFormat.toUpperCase()} format`)
          continue
        }
        
        // Simulate conversion delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Create preview URL
        const preview = URL.createObjectURL(file)
        
        // Simulate format conversion results
        const originalSize = file.size
        let convertedSize = originalSize
        
        // Simulate size changes based on format conversion
        if (targetFormat === 'webp') {
          convertedSize = Math.floor(originalSize * 0.7) // WebP is typically smaller
        } else if (targetFormat === 'jpeg' && originalFormat === 'png') {
          convertedSize = Math.floor(originalSize * 0.6) // JPEG smaller than PNG
        } else if (targetFormat === 'png' && originalFormat === 'jpeg') {
          convertedSize = Math.floor(originalSize * 1.4) // PNG larger than JPEG
        } else if (targetFormat === 'bmp') {
          convertedSize = Math.floor(originalSize * 3) // BMP is much larger
        }
        
        const targetFormatInfo = imageFormats.find(f => f.value === targetFormat)
        const newFileName = file.name.replace(/\.[^/.]+$/, targetFormatInfo?.extension || '.jpg')
        
        const convertedImage: ConvertedImage = {
          name: newFileName,
          originalName: file.name,
          originalFormat: originalFormat.toUpperCase(),
          targetFormat: targetFormat.toUpperCase(),
          originalSize,
          convertedSize,
          downloadUrl: preview, // In real app, this would be the converted file
          preview
        }
        
        setConvertedImages(prev => [...prev, convertedImage])
        setProgress(((i + 1) / files.length) * 100)
      }
    } catch (err) {
      setError('Failed to convert images. Please try again.')
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
    convertedImages.forEach(image => {
      const link = document.createElement('a')
      link.href = image.downloadUrl
      link.download = image.name
      link.click()
    })
  }

  const reset = () => {
    setFiles([])
    setConvertedImages([])
    setProgress(0)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Image Format Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert images between different formats: JPEG, PNG, WebP, GIF, BMP, and TIFF.
          </p>
        </div>

        {/* Format Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Conversion Settings
            </CardTitle>
            <CardDescription>
              Choose the target format for your images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Convert to:
                </label>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target format" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageFormats.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          {format.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Format Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">JPEG</h4>
                  <p className="text-xs text-blue-700">Best for photos, smaller files</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">PNG</h4>
                  <p className="text-xs text-green-700">Supports transparency, lossless</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">WebP</h4>
                  <p className="text-xs text-purple-700">Modern format, best compression</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        {convertedImages.length === 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Drag and drop your images here or click to browse
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
                  <FileImage className="h-12 w-12 text-gray-400" />
                  <ArrowRight className="h-8 w-8 text-gray-400" />
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileImage className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop images here' : 'Choose images or drag them here'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports all image formats • Maximum file size: 10MB
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Selected Images ({files.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file, index) => {
                      const preview = URL.createObjectURL(file)
                      const originalFormat = getFileFormat(file)
                      const targetFormatInfo = imageFormats.find(f => f.value === targetFormat)
                      const newFileName = file.name.replace(/\.[^/.]+$/, targetFormatInfo?.extension || '.jpg')
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img 
                            src={preview} 
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                            onLoad={() => URL.revokeObjectURL(preview)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            <p className="text-xs text-blue-600">
                              {originalFormat.toUpperCase()} → {targetFormat.toUpperCase()}
                            </p>
                            <p className="text-xs text-green-600 truncate">→ {newFileName}</p>
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
                      )
                    })}
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button onClick={convertImages} disabled={converting} className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {converting ? 'Converting...' : `Convert to ${targetFormat.toUpperCase()}`}
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
                <h3 className="font-medium text-gray-900 mb-2">Converting Images...</h3>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {convertedImages.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Conversion Complete
              </CardTitle>
              <CardDescription>
                Your images have been successfully converted to {targetFormat.toUpperCase()} format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {convertedImages.map((image, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={image.preview} 
                        alt={image.originalName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{image.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(image.originalSize)} → {formatFileSize(image.convertedSize)}
                        </p>
                        <p className="text-xs text-blue-600">
                          {image.originalFormat} → {image.targetFormat}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        Format: {image.targetFormat}
                      </span>
                      <Button size="sm" asChild>
                        <a href={image.downloadUrl} download={image.name}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={downloadAll} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
                <Button variant="outline" onClick={reset}>
                  Convert More Images
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

        {/* Format Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Image Format Comparison</CardTitle>
            <CardDescription>
              Choose the right format for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Format</th>
                    <th className="text-left p-2">Best For</th>
                    <th className="text-left p-2">Transparency</th>
                    <th className="text-left p-2">File Size</th>
                    <th className="text-left p-2">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">JPEG</td>
                    <td className="p-2">Photos, web images</td>
                    <td className="p-2">❌ No</td>
                    <td className="p-2">🟢 Small</td>
                    <td className="p-2">🟡 Good</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">PNG</td>
                    <td className="p-2">Graphics, logos</td>
                    <td className="p-2">✅ Yes</td>
                    <td className="p-2">🟡 Medium</td>
                    <td className="p-2">🟢 Excellent</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">WebP</td>
                    <td className="p-2">Web, modern apps</td>
                    <td className="p-2">✅ Yes</td>
                    <td className="p-2">🟢 Very Small</td>
                    <td className="p-2">🟢 Excellent</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">GIF</td>
                    <td className="p-2">Animations</td>
                    <td className="p-2">✅ Yes</td>
                    <td className="p-2">🟡 Medium</td>
                    <td className="p-2">🔴 Limited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">BMP</td>
                    <td className="p-2">Raw images</td>
                    <td className="p-2">❌ No</td>
                    <td className="p-2">🔴 Very Large</td>
                    <td className="p-2">🟢 Perfect</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">TIFF</td>
                    <td className="p-2">Professional print</td>
                    <td className="p-2">✅ Yes</td>
                    <td className="p-2">🔴 Large</td>
                    <td className="p-2">🟢 Perfect</td>
                  </tr>
                </tbody>
              </table>
            </div>
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