import exifr from 'exifr'
import fs from 'fs'
import connection from './db.js'

const imageFolder = './files/image/'

try {
  const files = fs.readdirSync(imageFolder).filter(file => {
    const lower = file.toLowerCase()
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')
  })

  console.log(`Hittade ${files.length} bildfiler att processa...`)

  for (const file of files) {
    try {
      const imagePath = `${imageFolder}${file}`
      const metadata = await exifr.parse(imagePath, { gps: true })

      //chose relevant fields for search engine
      const simplifiedMetadata = {
        filename: file,
        description: metadata?.ImageDescription || null,
        camera_make: metadata?.Make || null,
        camera_model: metadata?.Model || null,
        lens_model: metadata?.LensModel || null,
        date_taken: metadata?.DateTimeOriginal || metadata?.CreateDate || null,
        width: metadata?.ImageWidth || null,
        height: metadata?.ImageHeight || null,
        iso: metadata?.ISO || null,
        exposure_time: metadata?.ExposureTime || null,
        f_number: metadata?.FNumber || null,
        gps: (metadata?.latitude && metadata?.longitude) ? {
          lat: metadata.latitude,
          lng: metadata.longitude
        } : null
      }

      // Insert into database
      const [result] = await connection
        .promise()
        .execute(
          `INSERT INTO files (filename, file_type, metadata_json) 
           VALUES (?, ?, ?)`,
          [file, 'image', JSON.stringify(simplifiedMetadata)]
        )

      console.log(`✓ Inserted: ${file} (ID: ${result.insertId})`)
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message)
    }
  }

  console.log('Image processing complete!')
  connection.end()
} catch (error) {
  console.error('Error reading image folder:', error)
}
