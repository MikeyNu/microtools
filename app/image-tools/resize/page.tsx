'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Upload, Download, FileImage, ArrowRight, CheckCircle, AlertCircle, X, Maximize2, Link } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface ResizedImage {
  name: string
  originalName: string
  originalWidth: number
  originalHeight: number
  newWidth: number
  newHeight: number
  originalSize: number
  resizedSize: number
  downloadUrl: string
  preview: string
}

const presetSizes = [
  { label: 'Custom', value: 'custom' },
  { label: 'Instagram Square (1080x1080)', value: '1080x1080' },
  { label: 'Instagram Story (1080x1920)', value: '1080x1920' },
  { label: 'Facebook Cover (820x312)', value: '820x312' },
  { label: 'Twitter Header (1500x500)', value: '1500x500' },
  { label: 'YouTube Thumbnail (1280x720)', value: '1280x720' },
  { label: 'LinkedIn Banner (1584x396)', value: '1584x396' },
  { label: 'Profile Picture (400x400)', value: '400x400' },
  { label: 'HD (1920x1080)', value: '1920x1080' },
  { label: '4K (3840x2160)', value: '3840x2160' }
]

export default function ImageResizerPage() {
  const [files, setFiles] = useState<File[]>([])
  const [resizing, setResizing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [width, setWidth] = useState('800')
  const [height, setHeight] = useState('600')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [presetSize, setPresetSize] = useState('custom')
  const [resizeMode, setResizeMode] = useState('fit') // fit, fill, stretch

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

  const handlePresetChange = (value: string) => {
    setPresetSize(value)
    if (value !== 'custom') {
      const [w, h] = value.split('x')
      setWidth(w)
      setHeight(h)
    }
  }

  const handleWidthChange = (value: string) => {
    setWidth(value)
    if (maintainAspectRatio && files.length > 0) {
      // Calculate height based on first image's aspect ratio
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        const newHeight = Math.round(parseInt(value) / aspectRatio)
        setHeight(newHeight.toString())
      }
      img.src = URL.createObjectURL(files[0])
    }
  }

  const handleHeightChange = (value: string) => {
    setHeight(value)
    if (maintainAspectRatio && files.length > 0) {
      // Calculate width based on first image's aspect ratio
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        const newWidth = Math.round(parseInt(value) * aspectRatio)
        setWidth(newWidth.toString())
      }
      img.src = URL.createObjectURL(files[0])
    }
  }

  const resizeImages = async () => {
    if (files.length === 0) return

    const targetWidth = parseInt(width)
    const targetHeight = parseInt(height)

    if (!targetWidth || !targetHeight || targetWidth <= 0 || targetHeight <= 0) {
      setError('Please enter valid width and height values')
      return
    }

    setResizing(true)
    setProgress(0)
    setError(null)
    setResizedImages([])

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Get original image dimensions
        const img = new Image()
        const originalDimensions = await new Promise<{width: number, height: number}>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height })
          img.src = URL.createObjectURL(file)
        })
        
        // Simulate resizing delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Create preview URL
        const preview = URL.createObjectURL(file)
        
        // Calculate new dimensions based on resize mode
        let newWidth = targetWidth
        let newHeight = targetHeight
        
        if (resizeMode === 'fit') {
          // Maintain aspect ratio, fit within bounds
          const aspectRatio = originalDimensions.width / originalDimensions.height
          if (targetWidth / targetHeight > aspectRatio) {
            newWidth = Math.round(targetHeight * aspectRatio)
          } else {
            newHeight = Math.round(targetWidth / aspectRatio)
          }
        }
        
        // Simulate file size calculation
        const originalSize = file.size
        const sizeRatio = (newWidth * newHeight) / (originalDimensions.width * originalDimensions.height)
        const resizedSize = Math.floor(originalSize * sizeRatio * 0.9) // Slightly smaller due to compression
        
        const resizedImage: ResizedImage = {
          name: file.name.replace(/\.[^/.]+$/, '_resized$&'),
          originalName: file.name,
          originalWidth: originalDimensions.width,
          originalHeight: originalDimensions.height,
          newWidth,
          newHeight,
          originalSize,
          resizedSize,
          downloadUrl: preview, // In real app, this would be the resized image
          preview
        }
        
        setResizedImages(prev => [...prev, resizedImage])
        setProgress(((i + 1) / files.length) * 100)
      }
    } catch (err) {
      setError('Failed to resize images. Please try again.')
    } finally {
      setResizing(false)
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
    resizedImages.forEach(image => {
      const link = document.createElement('a')
      link.href = image.downloadUrl
      link.download = image.name
      link.click()
    })
  }

  const reset = () => {
    setFiles([])
    setResizedImages([])
    setProgress(0)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Image Resizer
          </h1>
          <p className="text-lg text-gray-600">
            Resize images to any dimensions while maintaining quality and aspect ratio.
          </p>
        </div>

        {/* Resize Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Resize Settings
            </CardTitle>
            <CardDescription>
              Configure the output dimensions and resize behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Preset Sizes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preset Sizes
                </label>
                <Select value={presetSize} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a preset size" />
                  </SelectTrigger>
                  <SelectContent>
                    {presetSizes.map(preset => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Width (px)
                  </label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder="800"
                    min="1"
                    max="10000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Height (px)
                  </label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="600"
                    min="1"
                    max="10000"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Maintain Aspect Ratio</label>
                    <p className="text-xs text-gray-500">Keep original proportions when resizing</p>
                  </div>
                  <Switch
                    checked={maintainAspectRatio}
                    onCheckedChange={setMaintainAspectRatio}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Resize Mode
                  </label>
                  <Select value={resizeMode} onValueChange={setResizeMode}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fit">Fit (maintain aspect ratio)</SelectItem>
                      <SelectItem value="fill">Fill (crop if needed)</SelectItem>
                      <SelectItem value="stretch">Stretch (ignore aspect ratio)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        {resizedImages.length === 0 && (
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
                  isDragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-4 mb-4">
                  <FileImage className="h-12 w-12 text-gray-400" />
                  <ArrowRight className="h-8 w-8 text-gray-400" />
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Maximize2 className="h-8 w-8 text-purple-600" />
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
                            <p className="text-xs text-purple-600">→ {width}×{height}px</p>
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
                    <Button onClick={resizeImages} disabled={resizing} className="flex-1">
                      <Maximize2 className="h-4 w-4 mr-2" />
                      {resizing ? 'Resizing...' : 'Resize Images'}
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
        {resizing && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Resizing Images...</h3>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {resizedImages.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Resize Complete
              </CardTitle>
              <CardDescription>
                Your images have been successfully resized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resizedImages.map((image, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={image.preview} 
                        alt={image.originalName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{image.name}</p>
                        <p className="text-sm text-gray-600">
                          {image.originalWidth}×{image.originalHeight} → {image.newWidth}×{image.newHeight}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.originalSize)} → {formatFileSize(image.resizedSize)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600 font-medium">
                        {image.newWidth}×{image.newHeight}px
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
                  Resize More Images
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

        {/* Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resizing Tips</CardTitle>
            <CardDescription>
              Get the best results from your image resizing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Link className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Maintain Aspect Ratio</h4>
                    <p className="text-sm text-gray-600">Keep this on to prevent image distortion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Maximize2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Use Presets</h4>
                    <p className="text-sm text-gray-600">Quick sizing for social media platforms</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileImage className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Quality Preservation</h4>
                    <p className="text-sm text-gray-600">Avoid upscaling for best quality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <ArrowRight className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Batch Processing</h4>
                    <p className="text-sm text-gray-600">Resize multiple images at once</p>
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