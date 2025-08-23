import express from 'express';
import connection from './db.js';

const app = express();
const port = 3000;

// define a route for testing
app.get('/', (req, res) => {
  res.send('Hello from Metadata Search Engine!');
});

app.get('/', (req, res) => {
  res.send('Hello from Metadata Search Engine!');
});

// start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// test database connection
connection.execute('SELECT 1 + 1 AS result', (err, results) => {
  if (err) console.error('Database error:', err);
  else console.log('Database test result:', results[0].result);
});