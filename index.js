import express from 'express';
import connection from './db.js';

const app = express();
const port = 3000;

// to serve static files from the frontend directory
app.use(express.static('frontend'));

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'frontend' });
});

// API for searching metadata
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const type = req.query.type || '';

    let sql = `SELECT filename, file_type, metadata_json 
               FROM files 
               WHERE LOWER(JSON_EXTRACT(metadata_json, '$')) LIKE LOWER(?)`;
    const params = [`%${query}%`];

    if (type) {
      sql += ` AND file_type = ?`;
      params.push(type);
    }

    const [rows] = await connection.promise().execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// API for fetching all files
app.get('/api/files', async (req, res) => {
  try {
    const [files] = await connection.execute('SELECT * FROM files');
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Test database connection
connection.execute('SELECT 1 + 1 AS result', (err, results) => {
  if (err) console.error('Database error:', err);
  else console.log('Database test result:', results[0].result);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});