import { parseFile } from 'music-metadata';
import fs from 'fs';
import connection from './db.js';

const audioFolder = './files/audio/';
const files = fs.readdirSync(audioFolder).filter(file => file.endsWith('.mp3'));

for (const file of files) {
  try {
    const metadata = await parseFile(audioFolder + file);

    // extract useful data
    const usefulData = {
      title: metadata.common.title || 'Unknown title',
      artist: metadata.common.artist || 'Unknown artist',
      album: metadata.common.album || 'Unknown album',
      year: metadata.common.year || null,
      genre: metadata.common.genre?.[0] || 'Unknown genre',
      duration: metadata.format.duration || null,
      bitrate: metadata.format.bitrate || null
    };

    // Insert into database
    await connection.execute(
      `INSERT INTO files (filename, file_type, metadata_json) 
       VALUES (?, ?, ?)`,
      [file, 'audio', JSON.stringify(usefulData)]
    );

    console.log(`✓ Lagt till: ${file}`);

  } catch (error) {
    console.error(`✗ Fel med ${file}:`, error.message);
  }
}

connection.end();