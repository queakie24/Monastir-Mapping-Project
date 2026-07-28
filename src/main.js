//Global Variables
let currentCity = 'New York City';
let currentYear = 1920;

//Collection of markers that changes for each city
let currentCityMarkers = L.layerGroup();

//Create the map on Manhattan
const map = L.map('map').setView([40.715, -73.985], 15);

//Add the OpenStreetMap tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

//Load SQL.js & SQLite database -- Try to edit this function to load any set of points from a selected city and year
async function initDatabase() {
  //Point locateFile to your local lib folder containing sql-wasm.wasm
  const SQL = await initSqlJs({
    locateFile: file => `./lib/${file}`
  });

  //Fetch SQLite file
  const response = await fetch('./database/testdb.sqlite');
  const buffer = await response.arrayBuffer();

  return new SQL.Database(new Uint8Array(buffer));
}

function loadCityMarkers(db, cityName){

  currentCityMarkers.clearLayers(); //Clear existing markers

  //Retrieve address points from the database (test for retrieving all, and only from one city)
  const stmt = db.prepare("SELECT addressID, addressName, latitude, longitude, city FROM addresses WHERE city = $city");
  stmt.bind({$city: cityName});

  while (stmt.step()) {
    const row = stmt.getAsObject();
    
    if (row.latitude && row.longitude) {
      const marker = L.marker([row.latitude, row.longitude]).bindPopup(`<b>${row.addressName}</b><br>${row.city}`);
      currentCityMarkers.addLayer(marker);
    }
  }

  currentCityMarkers.addTo(map); // Add the markers to the map
  
  stmt.free(); // Clean up memory
}

async function startMap(){
  const db = await initDatabase();
  loadCityMarkers(db, currentCity); // Load markers for the initial city
}

startMap();

//Add drop down functionality to reload and change map, and repopulate data points
//Change how the drop down looks and the whole title bar at the top
//Add another drop down for the year, and add code to have that drop down change values depending on city chosen
//Can make the above just a const array with set values for each city
//Add some data points in other cities to test
//After all that, add a button event that opens a side panel, can add info inside said panel later.
//Maybe make it so it's a panel in the background that becomes visible when the button is clicked, and can be closed with an X button in the corner of the panel.
//And after that make it so each data point button has different info on the panel
//AND make it so each data point says how many families are living at that address