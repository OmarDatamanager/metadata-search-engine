// frontend/script.js

let latestResults = [];
let map;
let markers = [];

function showFilters() {
  const type = document.getElementById('fileType').value;
  document.getElementById('filtersContainer').style.display = type ? 'flex' : 'none';
  document.getElementById('imageFilters').style.display = type === 'image' ? 'flex' : 'none';
  document.getElementById('audioFilters').style.display = type === 'audio' ? 'flex' : 'none';
}

function showNotification(message, isError = true) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.background = isError ? '#e74c3c' : '#2ecc71';
  notification.style.display = 'block';
  setTimeout(() => { notification.style.display = 'none'; }, 3000);
}

async function searchFiles() {
  try {
    const query = document.getElementById('searchInput').value;
    const fileType = document.getElementById('fileType').value;
    let url = `/api/search?q=${encodeURIComponent(query)}&type=${fileType}`;

    // Image filters
    if (fileType === 'image') {
      const isoRange = document.getElementById('isoRange')?.value || 'all';
      const fNumber = document.getElementById('fNumber')?.value || 'all';
      const dateTaken = document.getElementById('dateTaken')?.value || 'all';
      if (isoRange !== 'all') url += `&isoRange=${isoRange}`;
      if (fNumber !== 'all') url += `&fNumber=${fNumber}`;
      if (dateTaken !== 'all') url += `&dateTaken=${dateTaken}`;
    }

    // Audio filters
    if (fileType === 'audio') {
      const genre = document.getElementById('genreFilter').value;
      const artist = document.getElementById('artistFilter').value;
      const year = document.getElementById('yearFilter').value;
      if (genre !== 'all') url += `&genre=${encodeURIComponent(genre)}`;
      if (artist !== 'all') url += `&artist=${encodeURIComponent(artist)}`;
      if (year !== 'all') url += `&year=${encodeURIComponent(year)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const results = await response.json();

    results.forEach(file => {
      if (typeof file.metadata_json === 'string') {
        try { file.metadata_json = JSON.parse(file.metadata_json); }
        catch { file.metadata_json = {}; }
      }
    });

    latestResults = results;
    populateAudioFilters(results);
    displayResults(results);

    if (results.length === 0) showNotification('Inga resultat hittades', false);
    toggleMapButton(results);

    // reset view
    document.getElementById('map').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('results').style.display = 'grid';
    document.getElementById('mapButton').style.display = 'block';

  } catch (error) {
    console.error('Error:', error);
    showNotification('Ett fel uppstod vid sökningen: ' + error.message);
  }
}

function populateAudioFilters(results) {
  const genreSet = new Set();
  const artistSet = new Set();
  const yearSet = new Set();
  results.forEach(f => {
    if (f.file_type === 'audio' && f.metadata_json) {
      if (f.metadata_json.genre) genreSet.add(f.metadata_json.genre);
      if (f.metadata_json.artist) artistSet.add(f.metadata_json.artist);
      if (f.metadata_json.year) yearSet.add(f.metadata_json.year);
    }
  });

  const genreFilter = document.getElementById('genreFilter');
  const artistFilter = document.getElementById('artistFilter');
  const yearFilter = document.getElementById('yearFilter');

  // clear previous options except 'all'
  [genreFilter, artistFilter, yearFilter].forEach(sel => sel.querySelectorAll('option:not([value="all"])').forEach(o => o.remove()));

  // Sort and add options alphabetically
  [...genreSet].sort().forEach(g => {
    const option = document.createElement('option'); option.value = g; option.textContent = g;
    genreFilter.appendChild(option);
  });

  [...artistSet].sort().forEach(a => {
    const option = document.createElement('option'); option.value = a; option.textContent = a;
    artistFilter.appendChild(option);
  });

  // Sort years in descending order
  [...yearSet].sort((a, b) => b - a).forEach(y => {
    const option = document.createElement('option'); option.value = y; option.textContent = y;
    yearFilter.appendChild(option);
  });
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  if (!results.length) { resultsDiv.innerHTML = '<div class="no-results">Inga resultat hittades</div>'; return; }

  resultsDiv.innerHTML = results.map(file => {
    const metadata = file.metadata_json || {};
    function renderMetadata(obj, prefix = "") {
      if (!obj || typeof obj !== "object") return `<span>${obj}</span>`;
      return Object.keys(obj).map(key => {
        if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          return `<p class="meta-field"><b>${prefix + key}:</b></p>` + renderMetadata(obj[key], prefix + key + ".");
        } else {
          return `<p class="meta-field"><b>${prefix + key}:</b> ${obj[key] ?? "-"}</p>`;
        }
      }).join('');
    }
    const details = renderMetadata(metadata);

    let preview = "";
    if (file.file_type === "image") {
      preview = `<img src="/files/image/${file.filename}" alt="${file.filename}" class="file-preview" onerror="this.style.display='none'">`;
    } else if (file.file_type === "audio") {
      preview = `<audio controls class="file-preview"><source src="/files/audio/${file.filename}" type="audio/mpeg">Din webbläsare stödjer inte ljuduppspelning.</audio>`;
    }

    // Dropdown for images, PDF, and PPT files
    let dropdown = "";
    if (["image", "pdf", "ppt"].includes(file.file_type)) {
      dropdown = `<div class="dropdown"><button class="dropbtn">⋮</button>
        <div class="dropdown-content">
          <a href="/files/${file.file_type}/${file.filename}" download>Ladda ner</a>
          <a href="#" onclick="shareFile('${file.filename}', '${file.file_type}')">Dela</a>
        </div></div>`;
    }

    return `<div class="result-card">
      <h3>${file.filename}</h3>
      <p><b>Typ:</b> ${file.file_type}</p>
      ${preview}
      ${details}
      ${dropdown}
    </div>`;
  }).join('');

  // Dropdown click handling
  document.querySelectorAll('.dropbtn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const content = btn.nextElementSibling;
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    });
  });

  document.addEventListener('click', e => {
    document.querySelectorAll('.dropdown-content').forEach(dd => {
      if (!dd.parentElement.contains(e.target)) dd.style.display = 'none';
    });
  });
}

function shareFile(filename, fileType) {
  const url = `${window.location.origin}/files/${fileType}/${filename}`;
  navigator.clipboard.writeText(url).then(() => {
    showNotification('Länk kopierad till urklipp', false);
  }).catch(() => showNotification('Kunde inte kopiera länken', true));
}

function toggleMapButton(results) {
  const fileType = document.getElementById('fileType').value;
  const mapControls = document.getElementById('mapControls');
  const mapButton = document.getElementById('mapButton');
  const hasGPS = results.some(f => f.file_type === 'image' && f.metadata_json?.gps?.lat && f.metadata_json?.gps?.lng);
  mapControls.style.display = fileType === 'image' ? 'flex' : 'none';
  mapButton.style.display = hasGPS ? 'block' : 'none';
}

function showMap() {
  if (typeof L === 'undefined') {
    showNotification('Kartbiblioteket laddades inte korrekt. Ladda om sidan.');
    return;
  }

  const mapDiv = document.getElementById('map');
  const resultsDiv = document.getElementById('results');
  const backButton = document.getElementById('backButton');
  const mapButton = document.getElementById('mapButton');

  mapDiv.style.display = 'block';
  resultsDiv.style.display = 'none';
  backButton.style.display = 'block';
  mapButton.style.display = 'none';

  if (!map) {
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  } else {
    map.invalidateSize();
  }

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const gpsFiles = latestResults.filter(file => {
    if (file.file_type !== 'image') return false;
    const metadata = file.metadata_json || {};
    if (!metadata.gps) return false;
    const lat = parseFloat(metadata.gps.lat);
    const lng = parseFloat(metadata.gps.lng);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  if (gpsFiles.length === 0) {
    showNotification('Inga bilder med platsinformation att visa');
    return;
  }

  const markerGroup = L.featureGroup();

  gpsFiles.forEach(file => {
    const gps = file.metadata_json.gps;
    const lat = parseFloat(gps.lat);
    const lng = parseFloat(gps.lng);

    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
      <b>${file.filename}</b><br>
      <img src="/files/image/${file.filename}" style="width:150px; height:100px; object-fit:cover; margin-top:10px;" onerror="this.style.display='none'"><br>
      <p>Lat: ${lat.toFixed(6)}</p>
      <p>Lng: ${lng.toFixed(6)}</p>
      <p>ISO: ${file.metadata_json.iso || 'Okänt'}</p>
      <p>Bländare: ${file.metadata_json.f_number || 'Okänt'}</p>
      <p>Datum: ${file.metadata_json.date_taken || 'Okänt'}</p>
    `);

    markers.push(marker);
    markerGroup.addLayer(marker);
  });

  map.fitBounds(markerGroup.getBounds().pad(0.1));
}

function hideMap() {
  document.getElementById('map').style.display = 'none';
  document.getElementById('results').style.display = 'grid';
  document.getElementById('backButton').style.display = 'none';
  document.getElementById('mapButton').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('searchButton').addEventListener('click', searchFiles);
  document.getElementById('mapButton').addEventListener('click', showMap);
  document.getElementById('backButton').addEventListener('click', hideMap);
});