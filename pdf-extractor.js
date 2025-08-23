import fs from 'fs';
import pdfParse from 'pdf-parse-fork';
import connection from './db.js';

const pdfFolder = './files/pdf/';

try {
  // read all files in the directory
  const files = fs.readdirSync(pdfFolder).filter(file => file.endsWith('.pdf'));

  console.log(`Found ${files.length} PDF files to process...`);

  for (const file of files) {
    try {
      const pdfPath = `${pdfFolder}${file}`;

      // extract metadata
      const data = await pdfParse(fs.readFileSync(pdfPath));

      // prepare data for insertion
      const metadata = {
        info: data.info || {},
        numPages: data.numpages || 0,
        text: data.text ? data.text.substring(0, 500) : '' // first 500 characters only
      };

      // insert into database
      const [result] = await connection.promise().execute(
        `INSERT INTO files (filename, file_type, metadata_json) 
         VALUES (?, ?, ?)`,
        [file, 'pdf', JSON.stringify(metadata)]
      );

      console.log(`✓ Inserted: ${file} (ID: ${result.insertId})`);

    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  console.log('Finished processing all files!');
  connection.end(); // closing the connection

} catch (error) {
  console.error('Error reading folder:', error);
}