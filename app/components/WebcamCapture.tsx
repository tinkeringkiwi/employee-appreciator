'use client'

import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

export default function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [generatedCertificate, setGeneratedCertificate] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 900 },
          aspectRatio: { ideal: 4 / 5 },
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

  const startCountdown = () => {
    let counter = 3
    setCountdown(counter)

    const interval = setInterval(() => {
      counter -= 1
      if (counter > 0) {
        setCountdown(counter)
      } else {
        clearInterval(interval)
        setCountdown(null)
        capturePhoto() // actually take the photo
      }
    }, 1000)
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

        setCapturedImage(imageData) // ✅ store image for regenerate
        stopCamera()
        sendToBackend(imageData)
      }
    }
  }

  const sendToBackend = async (image: string) => {
    setIsLoading(true)
    setMessage('Generating employee goodwill...')

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedCertificate(data.certificate)
        setMessage('Employee goodwill generated!')
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
    setGeneratedCertificate(null)
    setMessage('')
    startCamera()
  }

  const downloadCertificate = () => {
    if (generatedCertificate) {
      const link = document.createElement('a')
      link.href = generatedCertificate
      link.download = 'employee-of-the-month.png'
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-100 via-gray-100 to-blue-50">
      {/* Classic 2000s header bar */}
      <div className="bg-linear-to-b from-blue-50 to-blue-200 text-white py-2 px-4shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-blue-900 font-black px-3 py-1 text-xl border border-yellow-500 shadow-sm">
              ★
            </div>
            <h1
              className="text-2xl text-black font-bold"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.25)' }}
            >
              Corporate Employee Appreciation Portal™
            </h1>
          </div>
          <div className="text-xs bg-blue-900 px-3 py-1 rounded border border-blue-400">
            v0.1.7 Beta
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Navbar */}
        <div className="bg-gray-200 border border-gray-400 mb-4 mt-4 shadow-sm">
          <div className="flex text-sm font-semibold">
            <div className="border-r-2 border-gray-400 px-4 py-2 hover:bg-gray-300 cursor-pointer">
              Home
            </div>
            
            <div className="border-r-2 border-gray-400 px-4 py-2 hover:bg-gray-300 cursor-pointer">
              My Employment
            </div>
            <div className="bg-white border-r-2 border-gray-400 px-4 py-2 text-blue-700">
              Employee Appreciation
            </div>
            <div className="border-r-2 border-gray-400 px-4 py-2 hover:bg-gray-300 cursor-pointer">
              Corporate
            </div>
            <div className="border-r-2 border-gray-400 px-4 py-2 hover:bg-gray-300 cursor-pointer">
              Corporate
            </div>
            <div className="px-4 py-2 hover:bg-gray-300 cursor-pointer">
              Help
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white border-2 border-gray-400 shadow-md">
              <div className="bg-linear-to-b from-blue-200 to-blue-50 text-black px-3 py-2 font-bold text-sm border-b-2 border-gray-400">
                Quick Links
              </div>
              <div className="p-3 space-y-1 text-sm">
                <div className="text-blue-700 hover:underline cursor-pointer flex items-center gap-2">
                  <span className="text-xs">▸</span> New Certificate
                </div>
                <div className="text-blue-700 hover:underline cursor-pointer flex items-center gap-2">
                  <span className="text-xs">▸</span> View History
                </div>
                <div className="text-blue-700 hover:underline cursor-pointer flex items-center gap-2">
                  <span className="text-xs">▸</span> Print Queue
                </div>
                <div className="text-blue-700 hover:underline cursor-pointer flex items-center gap-2">
                  <span className="text-xs">▸</span> Settings
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 shadow-md p-3">
              <div className="font-bold text-sm text-yellow-800 mb-2">
                ⚠️ Notice
              </div>
              <div className="text-xs text-gray-700">
                This system is for authorized personnel only. Misuse may result
                in disciplinary action.
              </div>
            </div>

            <div className="bg-white border-2 border-gray-400 shadow-md p-3">
              <div className="font-bold text-sm text-gray-700 mb-2">
                Did You Know?
              </div>
              <div className="text-xs text-gray-600">
                We appreciate all our employees.
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white border-2 border-gray-400 shadow-lg">
              <div className="bg-linear-to-b from-gray-300 to-gray-200 px-4 py-3 border-b-2 border-gray-400">
                <h2 className="text-xl font-bold text-gray-800">
                  Employee Recognition Certificate Generator
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Create your official corporate Employee Appreciation Award
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Camera/Image Display */}
                <fieldset className="border-2 border-gray-400 p-4">
                  <legend className="text-sm font-bold text-gray-700 px-2">
                    Step 1: Capture Photo
                  </legend>
                  <div
                    className="relative border-2 border-gray-500 bg-black mx-auto
                max-w-[400px] aspect-4/5 overflow-hidden"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={`w-full object-cover ${
                        isCameraOn ? 'block' : 'hidden'
                      }`}
                    />

                    {countdown && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-6xl font-bold">
                        {countdown}
                      </div>
                    )}

                    {capturedImage && (
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full"
                      />
                    )}

                    {!isCameraOn && !capturedImage && (
                      <div className="aspect-4/5 flex flex-col items-center justify-center bg-linear-to-br from-gray-700 to-gray-900">
                        <Camera className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-300 text-sm font-bold">
                          Camera Inactive
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Click &quot;Start Camera&quot; below
                        </p>
                      </div>
                    )}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    {!isCameraOn && !capturedImage && (
                      <button
                        onClick={startCamera}
                        className="w-full bg-linear-to-b from-green-200 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold py-2 px-4 border-2 border-green-700 shadow-md text-sm"
                      >
                        ▶ Start Camera
                      </button>
                    )}

                    {isCameraOn && (
                      <div className="flex gap-2">
                        <button
                          onClick={startCountdown}
                          className="flex-1 bg-linear-to-b from-green-200 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold py-2 px-4 border-2 border-green-700 shadow-md text-sm"
                        >
                          📷 Capture Photo
                        </button>
                        <button
                          onClick={stopCamera}
                          className="bg-linear-to-b from-red-200 to-red-400 hover:from-red-500 hover:to-red-600 text-black font-bold py-2 px-4 border-2 border-red-700 shadow-md text-sm"
                        >
                          ■ Stop
                        </button>
                      </div>
                    )}

                    {capturedImage && !generatedCertificate && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            capturedImage && sendToBackend(capturedImage)
                          }
                          disabled={isLoading}
                          className="flex-1 bg-linear-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 border-2 border-orange-700 disabled:border-gray-600 shadow-md text-sm"
                        >
                          {isLoading
                            ? '⌛ Processing...'
                            : '⚡ Generate Certificate'}
                        </button>
                        <button
                          onClick={retakePhoto}
                          className="bg-linear-to-b from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 border-2 border-gray-700 shadow-md text-sm"
                        >
                          ↻ Retake
                        </button>
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* Status Message */}
                {message && (
                  <div
                    className={`border-2 p-3 text-sm font-semibold ${
                      message.includes('Error') || message.includes('Failed')
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : 'bg-green-50 border-green-500 text-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {message.includes('Error') || message.includes('Failed')
                          ? '❌'
                          : '✓'}
                      </span>
                      <span>{message}</span>
                    </div>
                  </div>
                )}

                {/* Generated Certificate Display */}
                {generatedCertificate && (
                  <fieldset className="border-2 border-gray-400 p-4">
                    <legend className="text-sm font-bold text-gray-700 px-2">
                      Step 2: Your Certificate
                    </legend>

                    <div className="border-2 border-gray-500 mb-3">
                      <img
                        src={generatedCertificate}
                        alt="Generated Certificate"
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={downloadCertificate}
                        className="flex-1 bg-linear-to-b from-green-200 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold py-2 px-4 border-2 border-green-700 shadow-md text-sm"
                      >
                        💾 Download Certificate
                      </button>
                      <button
                        onClick={() =>
                          capturedImage && sendToBackend(capturedImage)
                        }
                        disabled={isLoading}
                        className="bg-linear-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 border-2 border-orange-700 disabled:border-gray-600 shadow-md text-sm"
                      >
                        {isLoading ? '⌛ Processing...' : '🔄 Regenerate'}
                      </button>
                      <button
                        onClick={retakePhoto}
                        className="bg-linear-to-b from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 border-2 border-gray-700 shadow-md text-sm"
                      >
                        📷 Create New
                      </button>
                    </div>
                  </fieldset>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-xs text-gray-600 bg-gray-200 border-2 border-gray-400 p-3">
              <p>© 2002 Corporate Intellectual Property Corporation LTD™ | All Rights Reserved</p>
              <p className="mt-1">
                <span className="text-blue-700 hover:underline cursor-pointer">
                  Privacy Policy
                </span>{' '}
                |
                <span className="text-blue-700 hover:underline cursor-pointer ml-1">
                  Terms of Service
                </span>{' '}
                |
                <span className="text-blue-700 hover:underline cursor-pointer ml-1">
                  Contact IT Support
                </span>
              </p>
              <p className="mt-2 text-gray-500">
                Best viewed in Internet Explorer 6.0 or higher at 1024x768
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
