'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileImage, ArrowRight, CheckCircle, AlertCircle, X, Zap } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface ConvertedImage {
  name: string
  originalName: string
  originalSize: number
  convertedSize: number
  compressionRatio: number
  downloadUrl: string
  preview: string
}

export default function WebPConverterPage() {
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [quality, setQuality] = useState([85])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && !file.type.includes('webp')
    )
    if (imageFiles.length !== acceptedFiles.length) {
      setError('Only non-WebP image files are allowed')
      return
    }
    setFiles(prev => [...prev, ...imageFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const convertImages = async () => {
    if (files.length === 0) return

    setConverting(true)
    setProgress(0)
    setError(null)
    setConvertedImages([])

    try {
      // Simulate conversion process
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Simulate conversion delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Create preview URL
        const preview = URL.createObjectURL(file)
        
        // Simulate WebP conversion results
        const originalSize = file.size
        const qualityFactor = quality[0] / 100
        // WebP typically achieves 25-50% better compression than JPEG
        const webpCompressionRatio = 0.3 + (qualityFactor * 0.4) // 30-70% of original size
        const convertedSize = Math.floor(originalSize * webpCompressionRatio)
        
        const convertedImage: ConvertedImage = {
          name: file.name.replace(/\.[^/.]+$/, '.webp'),
          originalName: file.name,
          originalSize,
          convertedSize,
          compressionRatio: Math.round((1 - webpCompressionRatio) * 100),
          downloadUrl: preview, // In real app, this would be the converted WebP file
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
            WebP Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert images to modern WebP format for faster loading and smaller file sizes.
          </p>
        </div>

        {/* Benefits Banner */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">25-50%</div>
                <div className="text-sm text-gray-600">Smaller file size</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">Better</div>
                <div className="text-sm text-gray-600">Image quality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">Faster</div>
                <div className="text-sm text-gray-600">Website loading</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Conversion Settings
            </CardTitle>
            <CardDescription>
              Adjust the quality level for your WebP images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">WebP Quality</label>
                  <span className="text-sm text-gray-500">{quality[0]}%</span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
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
                  isDragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-4 mb-4">
                  <FileImage className="h-12 w-12 text-gray-400" />
                  <ArrowRight className="h-8 w-8 text-gray-400" />
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileImage className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop images here' : 'Choose images or drag them here'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, GIF, BMP, TIFF • Maximum file size: 10MB
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Selected Images ({files.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file, index) => {
                      const preview = URL.createObjectURL(file)
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
                            <p className="text-xs text-green-600">→ {file.name.replace(/\.[^/.]+$/, '.webp')}</p>
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
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {converting ? 'Converting...' : 'Convert to WebP'}
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
                <h3 className="font-medium text-gray-900 mb-2">Converting to WebP...</h3>
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
                Your images have been successfully converted to WebP format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {convertedImages.map((image, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
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
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">
                        {image.compressionRatio}% smaller
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

        {/* WebP Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Choose WebP?</CardTitle>
            <CardDescription>
              WebP is a modern image format that provides superior compression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Faster Loading</h4>
                    <p className="text-sm text-gray-600">Smaller file sizes mean faster website loading times</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Better Quality</h4>
                    <p className="text-sm text-gray-600">Superior compression with minimal quality loss</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileImage className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Modern Format</h4>
                    <p className="text-sm text-gray-600">Supported by all modern browsers and devices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <ArrowRight className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">SEO Benefits</h4>
                    <p className="text-sm text-gray-600">Faster loading improves search engine rankings</p>
                  </div>
                </div>
              </div>
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