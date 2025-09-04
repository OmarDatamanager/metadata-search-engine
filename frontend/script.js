// script.js
async function searchFiles() {
  try {
    const query = document.getElementById('searchInput').value;
    const fileType = document.getElementById('fileType').value;

    // Image filters
    const minISO = document.getElementById('minISO')?.value || '';
    const maxISO = document.getElementById('maxISO')?.value || '';
    const minFNumber = document.getElementById('minFNumber')?.value || '';
    const maxFNumber = document.getElementById('maxFNumber')?.value || '';

    // Build query string
    const params = new URLSearchParams({ q: query, type: fileType });
    if (fileType === 'image') {
      if (minISO) params.append('minISO', minISO);
      if (maxISO) params.append('maxISO', maxISO);
      if (minFNumber) params.append('minFNumber', minFNumber);
      if (maxFNumber) params.append('maxFNumber', maxFNumber);
    }

    const response = await fetch(`/api/search?${params.toString()}`);
    const results = await response.json();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = results.map(file => {
      const metadata = file.metadata_json || {};

      // Render metadata recursively
      function renderMetadata(obj, prefix = "") {
        if (!obj || typeof obj !== "object") return `<span>${obj}</span>`;
        let html = "";
        for (const key in obj) {
          if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            html += `<p class="meta-field"><b>${prefix + key}:</b></p>` + renderMetadata(obj[key], prefix + key + ".");
          } else {
            html += `<p class="meta-field"><b>${prefix + key}:</b> ${obj[key] !== null && obj[key] !== undefined ? obj[key] : "-"}</p>`;
          }
        }
        return html;
      }

      const details = renderMetadata(metadata);

      // Determine preview for image/audio
      let preview = "";
      if (file.file_type === "image") {
        preview = `<img src="files/image/${file.filename}" alt="${file.filename}" class="file-preview">`;
      } else if (file.file_type === "audio") {
        preview = `<audio controls class="file-preview">
                    <source src="files/audio/${file.filename}" type="audio/mpeg">
                    Din webbläsare stödjer inte ljuduppspelning.
                  </audio>`;
      }

      return `
        <div class="result-card">
          <h3>${file.filename}</h3>
          <p><b>Typ:</b> ${file.file_type}</p>
          ${preview}
          ${details}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Initial load
searchFiles();

// Attach search to button
document.querySelector('button').addEventListener('click', searchFiles);

// Optional: attach filter input changes for instant search
const filterInputs = ['minISO', 'maxISO', 'minFNumber', 'maxFNumber'];
filterInputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', searchFiles);
});
