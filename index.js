import express from 'express';
import connection from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve media files
app.use('/files/audio', express.static(path.join(__dirname, 'files', 'audio')));
app.use('/files/image', express.static(path.join(__dirname, 'files', 'image')));

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// API: Search metadata with filters
app.get('/api/search', async (req, res) => {
  try {
    const {
      q = '',
      type = '',
      isoRange = 'all',
      fNumber = 'all',
      dateTaken = 'all',
      genre,
      artist,
      year
    } = req.query;

    let sql = `SELECT filename, file_type, metadata_json FROM files WHERE LOWER(JSON_EXTRACT(metadata_json,'$')) LIKE LOWER(?)`;
    const params = [`%${q}%`];

    if (type) {
      sql += ` AND file_type = ?`;
      params.push(type);
    }

    // Image filters
    if (type === 'image') {
      if (isoRange !== 'all') {
        const [min, max] = isoRange.split('-').map(Number);
        sql += ` AND JSON_EXTRACT(metadata_json,'$.iso') BETWEEN ? AND ?`;
        params.push(min, max);
      }

      if (fNumber !== 'all') {
        if (fNumber === '<3') sql += ` AND JSON_EXTRACT(metadata_json,'$.f_number') < 3`;
        else if (fNumber === '>10') sql += ` AND JSON_EXTRACT(metadata_json,'$.f_number') > 10`;
        else {
          sql += ` AND JSON_EXTRACT(metadata_json,'$.f_number') = ?`;
          params.push(parseFloat(fNumber));
        }
      }

      if (dateTaken !== 'all') {
        sql += ` AND YEAR(STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(metadata_json,'$.date_taken')),'%Y-%m-%dT%H:%i:%s.%fZ')) = ?`;
        params.push(parseInt(dateTaken, 10));
      }
    }

    // Audio filters
    if (type === 'audio') {
      if (genre) {
        sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(metadata_json,'$.genre')) = ?`;
        params.push(genre);
      }
      if (artist) {
        sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(metadata_json,'$.artist')) = ?`;
        params.push(artist);
      }
      if (year) {
        sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(metadata_json,'$.year')) = ?`;
        params.push(year);
      }
    }

    const [rows] = await connection.promise().execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// API: Get all files (optional, can be used for debugging)
app.get('/api/files', async (req, res) => {
  try {
    const [files] = await connection.execute('SELECT * FROM files');
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Test DB connection
connection.execute('SELECT 1 + 1 AS result', (err, results) => {
  if (err) console.error('Database error:', err);
  else console.log('Database test result:', results[0].result);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
