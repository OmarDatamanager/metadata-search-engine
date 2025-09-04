import express from 'express';
import connection from './db.js';
import path from 'path';

const app = express();
const port = 3000;

// Serve static frontend files
app.use(express.static('frontend'));

// Serve media files
app.use('/files/audio', express.static(path.join('files', 'audio')));
app.use('/files/image', express.static(path.join('files', 'image')));

// Homepage route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'frontend' });
});

// API: Search metadata with ISO filtering
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const type = req.query.type || '';
    const isoRange = req.query.isoRange || 'all';

    let sql = `SELECT filename, file_type, metadata_json 
               FROM files 
               WHERE LOWER(JSON_EXTRACT(metadata_json, '$')) LIKE LOWER(?)`;
    const params = [`%${query}%`];

    if (type) {
      sql += ` AND file_type = ?`;
      params.push(type);
    }

    // ISO filtering for images
    if (type === 'image' && isoRange && isoRange !== 'all') {
      const [min, max] = isoRange.split('-').map(Number);
      sql += ` AND JSON_EXTRACT(metadata_json, '$.iso') BETWEEN ? AND ?`;
      params.push(min, max);
    }

    const [rows] = await connection.promise().execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// API: Get all files
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
