// Create the map
const map = L.map('map').setView([40.715, -73.985], 15);

// Add the OpenStreetMap tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load SQL.js & your SQLite database
async function initDatabase() {
  // Point locateFile to your local lib folder containing sql-wasm.wasm
  const SQL = await initSqlJs({
    locateFile: file => `./lib/${file}`
  });

  // Fetch your SQLite file
  const response = await fetch('./database/testdb.sqlite');
  const buffer = await response.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  // Example Query: Retrieve points from the database
  const stmt = db.prepare("SELECT addressID, addressName, latitude, longitude, city FROM addresses");

  while (stmt.step()) {
    const row = stmt.getAsObject();
    
    if (row.latitude && row.longitude) {
      L.marker([row.latitude, row.longitude])
        .bindPopup(`<b>${row.addressName}</b><br>${row.city}`)
        .addTo(map);
    }
  }
  
  stmt.free(); // Clean up memory
}

initDatabase();