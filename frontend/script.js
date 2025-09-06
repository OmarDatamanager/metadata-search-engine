// Show or hide filters depending on file type
function showFilters() {
  const type = document.getElementById('fileType').value;
  const filtersContainer = document.getElementById('filtersContainer');
  if (type === 'image') {
    filtersContainer.style.display = 'flex';
  } else {
    filtersContainer.style.display = 'none';
  }
}

// Main search function
async function searchFiles() {
  try {
    const query = document.getElementById('searchInput').value;
    const fileType = document.getElementById('fileType').value;
    const isoRange = document.getElementById('isoRange')?.value || 'all';
    const fNumber = document.getElementById('fNumber')?.value || 'all';
    const dateTaken = document.getElementById('dateTaken')?.value || 'all';

    let url = `/api/search?q=${encodeURIComponent(query)}&type=${fileType}`;
    if (fileType === 'image') {
      if (isoRange !== 'all') url += `&isoRange=${isoRange}`;
      if (fNumber !== 'all') url += `&fNumber=${fNumber}`;
      if (dateTaken !== 'all') url += `&dateTaken=${dateTaken}`;
    }

    const response = await fetch(url);
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
            html += `<p class="meta-field"><b>${prefix + key}:</b></p>` +
              renderMetadata(obj[key], prefix + key + ".");
          } else {
            html += `<p class="meta-field"><b>${prefix + key}:</b> ${obj[key] ?? "-"}</p>`;
          }
        }
        return html;
      }

      const details = renderMetadata(metadata);

      // Determine preview
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


// Attach search to button
document.getElementById('searchButton').addEventListener('click', searchFiles);
