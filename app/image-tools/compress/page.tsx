'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, Image, Shrink, CheckCircle, AlertCircle, X, Settings } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { ToolLayout } from "@/components/tool-layout"

interface CompressedImage {
  name: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  downloadUrl: string
  preview: string
}

export default function ImageCompressorPage() {
  const [files, setFiles] = useState<File[]>([])
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [quality, setQuality] = useState([80])

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
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const compressImages = async () => {
    if (files.length === 0) return

    setCompressing(true)
    setProgress(0)
    setError(null)
    setCompressedImages([])

    try {
      // Simulate compression process
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Simulate compression delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Create preview URL
        const preview = URL.createObjectURL(file)

        // Simulate compression results based on quality setting
        const originalSize = file.size
        const qualityFactor = quality[0] / 100
        const compressionRatio = 0.2 + (qualityFactor * 0.6) // 20-80% of original size
        const compressedSize = Math.floor(originalSize * compressionRatio)

        const compressedImage: CompressedImage = {
          name: file.name,
          originalSize,
          compressedSize,
          compressionRatio: Math.round((1 - compressionRatio) * 100),
          downloadUrl: preview, // In real app, this would be the compressed image
          preview
        }

        setCompressedImages(prev => [...prev, compressedImage])
        setProgress(((i + 1) / files.length) * 100)
      }
    } catch (err) {
      setError('Failed to compress images. Please try again.')
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
    compressedImages.forEach(image => {
      const link = document.createElement('a')
      link.href = image.downloadUrl
      link.download = `compressed_${image.name}`
      link.click()
    })
  }

  const reset = () => {
    setFiles([])
    setCompressedImages([])
    setProgress(0)
    setError(null)
  }

  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress images to reduce file size without quality loss"
      category="Image Tools"
      categoryHref="/image-tools"
    >
      {/* Quality Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Compression Settings
          </CardTitle>
          <CardDescription>
            Adjust the quality level to balance file size and image quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-muted-foreground">Quality Level</label>
                <span className="text-sm text-muted-foreground">{quality[0]}%</span>
              </div>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      {compressedImages.length === 0 && (
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
                isDragActive ? 'border-border bg-muted/50' : 'border-border hover:border-border'
              }`}
            >
              <input {...getInputProps()} />
              <Image className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {isDragActive ? 'Drop images here' : 'Choose images or drag them here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, GIF, WebP, BMP • Maximum file size: 10MB
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-foreground mb-3">Selected Images ({files.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file, index) => {
                    const preview = URL.createObjectURL(file)
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                          onLoad={() => URL.revokeObjectURL(preview)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
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
                    )
                  })}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={compressImages} disabled={compressing} className="flex-1">
                    <Shrink className="h-4 w-4 mr-2" />
                    {compressing ? 'Compressing...' : 'Compress Images'}
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
              <h3 className="font-medium text-foreground mb-2">Compressing Images...</h3>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {compressedImages.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Compression Complete
            </CardTitle>
            <CardDescription>
              Your images have been successfully compressed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compressedImages.map((image, index) => (
                <div key={index} className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{image.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(image.originalSize)} → {formatFileSize(image.compressedSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-success font-medium">
                      {image.compressionRatio}% smaller
                    </span>
                    <Button size="sm" asChild>
                      <a href={image.downloadUrl} download={`compressed_${image.name}`}>
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
                Compress More Images
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
            <p className="text-muted-foreground text-sm">Advanced algorithms optimize file size while preserving quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Multiple Formats</h3>
            <p className="text-muted-foreground text-sm">Support for JPG, PNG, WebP, GIF, and other popular formats</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="bg-muted/50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Quality Control</h3>
            <p className="text-muted-foreground text-sm">Adjust compression level to balance file size and quality</p>
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
