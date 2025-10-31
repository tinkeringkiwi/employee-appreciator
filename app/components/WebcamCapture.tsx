'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Camera, RotateCcw, Send, Video, VideoOff } from 'lucide-react'

export default function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 900 },
          aspectRatio: { ideal: 4 / 5 }, // Portrait ratio
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOn(true)
        setMessage('')
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setMessage('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraOn(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)
        setMessage('Photo captured! Ready to generate your certificate.')
        stopCamera()
      }
    }
  }

  const sendToBackend = async () => {
    if (!capturedImage) return

    setIsLoading(true)
    setMessage('Generating your Employee of the Month certificate...')

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: capturedImage }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Certificate generated successfully! 🎉')
        console.log('Backend response:', data)
      } else {
        setMessage('Error: ' + (data.error || 'Failed to process'))
      }
    } catch (err) {
      console.error('Error sending to backend:', err)
      setMessage('Failed to generate certificate')
    } finally {
      setIsLoading(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setMessage('')
    startCamera()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-yellow-300 to-red-400 p-4 flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-80 animate-bounce">
          🍔
        </div>
        <div className="absolute top-40 right-20 text-6xl opacity-80 animate-bounce delay-100">
          🍟
        </div>
        <div className="absolute bottom-20 left-20 text-6xl opacity-80 animate-bounce delay-200">
          🥤
        </div>
        <div className="absolute bottom-40 right-40 text-6xl opacity-80 animate-bounce delay-300">
          ⭐
        </div>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-4 border-yellow-400 relative z-10 overflow-hidden py-0">
        <CardHeader className="bg-red-600 text-white text-center space-y-2 py-6">
          <CardTitle className="text-4xl font-black tracking-tight">
            EMPLOYEE APPRECIATOR©
          </CardTitle>
          <CardDescription className="text-yellow-100 text-lg font-semibold">
            Generate Your Official Employee of the Month Certificate
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-6">
          {/* Camera/Image Display */}
          <div className="relative rounded-lg overflow-hidden border-4 border-yellow-400 shadow-lg bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full ${isCameraOn ? 'block' : 'hidden'}`}
            />

            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="w-full" />
            )}

            {!isCameraOn && !capturedImage && (
              <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <Camera className="w-16 h-16 text-yellow-400 mb-4" />
                <p className="text-yellow-100 font-semibold">
                  Ready for your close-up?
                </p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isCameraOn && !capturedImage && (
              <Button
                onClick={startCamera}
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg h-14 shadow-lg"
              >
                <Video className="mr-2 h-5 w-5" />
                Start Camera
              </Button>
            )}

            {isCameraOn && (
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold text-lg h-14 shadow-lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </Button>
                <Button
                  onClick={stopCamera}
                  size="lg"
                  variant="destructive"
                  className="h-14 shadow-lg"
                >
                  <VideoOff className="h-5 w-5" />
                </Button>
              </div>
            )}

            {capturedImage && (
              <div className="flex gap-3">
                <Button
                  onClick={sendToBackend}
                  disabled={isLoading}
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 shadow-lg disabled:opacity-50"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {isLoading ? 'Generating...' : 'Generate Certificate'}
                </Button>
                <Button
                  onClick={retakePhoto}
                  size="lg"
                  variant="outline"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-50 h-14 shadow-lg font-bold"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Retake
                </Button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`p-4 rounded-lg text-center font-semibold border-2 ${
                message.includes('Error') || message.includes('Failed')
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-green-50 text-green-700 border-green-300'
              }`}
            >
              {message}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>© 2024 Generic Fast Food Corporation</p>
            <p className="text-xs mt-1">
              Results may vary. Certificate has no monetary value.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
