import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

const readdir = promisify(fs.readdir)
const mkdir = promisify(fs.mkdir)
const unlink = promisify(fs.unlink)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Check admin authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Parse the form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes('image')
      }
    })

    const [fields, files] = await form.parse(req)
    
    if (!files.image || Array.isArray(files.image)) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    const uploadedFile = files.image
    const fileExtension = path.extname(uploadedFile.originalFilename || '')
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`
    const newPath = path.join(uploadDir, fileName)

    // Move file to final location
    fs.renameSync(uploadedFile.filepath, newPath)

    // Return the public URL
    const imageUrl = `/uploads/products/${fileName}`
    
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl 
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ message: 'Failed to upload image' })
  }
}
