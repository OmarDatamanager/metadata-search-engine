import exifr from 'exifr';
import fs from 'fs';
import connection from './db.js';

const imageFolder = './files/image/';

try {
  const files = fs.readdirSync(imageFolder).filter(file =>
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  );

  console.log(`Hittade ${files.length} bildfiler att processa...`);

  for (const file of files) {
    try {
      const imagePath = `${imageFolder}${file}`;
      const metadata = await exifr.parse(imagePath);

      // Simplify metadata for storage
      const simplifiedMetadata = {
        dimensions: metadata ? {
          width: metadata.ImageWidth,
          height: metadata.ImageHeight
        } : null,
        camera: metadata ? {
          make: metadata.Make,
          model: metadata.Model
        } : null,
        gps: metadata && metadata.latitude ? {
          lat: metadata.latitude,
          lng: metadata.longitude
        } : null,
        date: metadata ? metadata.CreateDate || metadata.DateTimeOriginal : null
      };

      // Insert into database
      const [result] = await connection.promise().execute(
        `INSERT INTO files (filename, file_type, metadata_json) 
         VALUES (?, ?, ?)`,
        [file, 'image', JSON.stringify(simplifiedMetadata)]
      );

      console.log(`✓ Inserted: ${file} (ID: ${result.insertId})`);

    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  console.log('Image processing complete!');
  connection.end();

} catch (error) {
  console.error('Error reading image folder:', error);
}