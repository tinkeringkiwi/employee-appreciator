import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API route is being triggered')

    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const postData = {
      employee_image: image,
    }

    // Replace this URL with your partner's backend endpoint
    const BACKEND_URL =
      process.env.BACKEND_URL || 'http://localhost:8000/api/process'

    // Forward the image to your partner's backend
    const backendResponse = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postData }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Backend processing failed', details: backendData },
        { status: backendResponse.status }
      )
    }

    // Return the backend's response to the frontend
    return NextResponse.json({
      success: true,
      data: backendData,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
