//Global Variables
let currentCity = 'New York City';
let currentYear = 1920;
let db;

//Collection of markers that changes for each city
let currentCityMarkers = L.layerGroup();

//Create the map on Manhattan
const map = L.map('map').setView([40.715, -73.985], 16);

//Add the OpenStreetMap tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

//Load SQL.js & SQLite database
async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => `./lib/${file}`
  });

  const response = await fetch('./database/testdb.sqlite');
  const buffer = await response.arrayBuffer();

  return new SQL.Database(new Uint8Array(buffer));
}

function loadCityMarkers(db, cityName){
  currentCityMarkers.clearLayers(); 

  const stmt = db.prepare("SELECT addressID, addressName, latitude, longitude, city FROM addresses WHERE city = $city");
  stmt.bind({$city: cityName});

  while (stmt.step()) {
    const row = stmt.getAsObject();
    
    if (row.latitude && row.longitude) {
      const marker = L.marker([row.latitude, row.longitude]).bindPopup(`<b>${row.addressName}</b><br>${row.city}`);
      currentCityMarkers.addLayer(marker);
    }
  }

  currentCityMarkers.addTo(map); 
  stmt.free(); 
}

function updateYearDropdown(cityName) {
  const yearDropdown = document.getElementById('yearSelect');
  yearDropdown.innerHTML = ''; // Clears existing year options

  if (cityName === 'New York City' || cityName === 'Rochester' || cityName === 'Indianapolis') {
    const years = [1910, 1920, 1930, 1940];
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearDropdown.appendChild(option);
    });
  }
  else if (cityName === 'Paris') {
    const years = [1926, 1931, 1936];
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearDropdown.appendChild(option);
    });
  }
  else if (cityName === 'Bitola') {
    const years = [1943];
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearDropdown.appendChild(option);
    });
  }
}

async function startMap(){
  db = await initDatabase();
  updateYearDropdown(currentCity);
  loadCityMarkers(db, currentCity); 
  
  const citySelect = document.getElementById('citySelect');
  citySelect.addEventListener('change', onCityChange);
}

function changeCityCenter(cityName){
  switch(cityName) {
    case 'New York City':
      map.setView([40.715, -73.985], 15);
      break;
    case 'Indianapolis':
      map.setView([39.7682, -86.1581], 15);                                             //Change coordinates for these cities later
      break;                                                                            //When more of the population is added to the database
    case 'Rochester':
      map.setView([43.1566, -77.6088], 15);
      break;
    case 'Paris':
      map.setView([48.8566, 2.3522], 15);
      break;
    case 'Bitola':
      map.setView([41.03097605340596, 21.333955937806056], 15);
      break;
  }
}

function onCityChange(event){
  currentCity = event.target.value;
  changeCityCenter(currentCity);
  updateYearDropdown(currentCity); // <--- Updates year options for selected city
  loadCityMarkers(db, currentCity);  // <--- Reloads markers for selected city
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