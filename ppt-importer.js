// Import the file system module (fs)
import fs from 'fs';
import connection from './db.js';

// Read the json string from file
let json = fs.readFileSync('./powerpoint-metadata.json', 'utf-8');

// Convert from a string to a real data structure
let data = JSON.parse(json);


for (let powerpointMetadata of data) {
  // extract the file name (the property digest + '.ppt)
  let fileName = powerpointMetadata.digest + '.ppt';

  // remove the file name
  delete powerpointMetadata.digest;

  // remove sha hashes as well (only needed for file authenticy checks)
  delete powerpointMetadata.sha256;
  delete powerpointMetadata.sha512;

  // console.log things to see that we have correct 
  // filname and metadata
  // (that eventually want to write to the db)
  console.log('');
  console.log(fileName);
  console.log(powerpointMetadata);

  let result = await connection.execute(
    `INSERT INTO files (filename, file_type, metadata_json) 
   VALUES (?, ?, ?)`,
    [fileName, 'ppt', JSON.stringify(powerpointMetadata)]
  );
}