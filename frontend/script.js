// script.js
async function loadFiles() {
  try {
    const response = await fetch('http://localhost:3000/api/files');
    const files = await response.json();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = files.map(file =>
      `<div>${file.filename} (${file.file_type})</div>`
    ).join('');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

loadFiles();