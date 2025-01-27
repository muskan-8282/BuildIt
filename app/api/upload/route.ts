import { Storage } from '@google-cloud/storage'
import { NextResponse } from 'next/server'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME!)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create a unique filename
    const fileName = `${Date.now()}-${file.name}`
    
    // Create a write stream to upload the file
    const blob = bucket.file(fileName)
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    })

    // Convert File to Buffer and upload
    const buffer = Buffer.from(await file.arrayBuffer())
    
    await new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Blob stream error:', err)
        reject(err)
      })
      blobStream.on('finish', resolve)
      blobStream.end(buffer)
    })

    // Make the file public and get its URL
    await blob.makePublic()
    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${fileName}`

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 })
  }
} 