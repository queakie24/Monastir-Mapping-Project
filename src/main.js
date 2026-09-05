// Global State
let currentCity = 'New York City';
let currentYear = 1910;
let db;

// City configuration registry
const CITY_CONFIG = {
  'New York City': { center: [40.715, -73.985], zoom: 15, years: [1910, 1920, 1930, 1940] },
  'Rochester':     { center: [43.1566, -77.6088], zoom: 15, years: [1910, 1920, 1930, 1940] },
  'Indianapolis':  { center: [39.7682, -86.1581], zoom: 15, years: [1910, 1920, 1930, 1940] },
  'Paris':         { center: [48.8534, 2.3488], zoom: 15, years: [1926, 1931, 1936] },
  'Bitola':        { center: [41.0310, 21.3340], zoom: 15, years: [1943] }
};

// Layer group for dynamic markers
const currentCityMarkers = L.layerGroup();

// Initialize Map
const initialConfig = CITY_CONFIG[currentCity];
const map = L.map('map').setView(initialConfig.center, initialConfig.zoom);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

currentCityMarkers.addTo(map);

// SQL Setup
async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => `./lib/${file}`
  });

  const response = await fetch('./database/testdb.sqlite');
  const buffer = await response.arrayBuffer();

  return new SQL.Database(new Uint8Array(buffer));
}

function showAddressDetails(db, addressID, addressName) {
  const panel = document.getElementById('sidepanel');
  const content = document.getElementById('sidepanelcontent');

  // Query ALL people at this address for the current year
  const sqlAll = `
    SELECT
      l.familyID,
      l.notes,
      l.relationToHead,
      p.personID,
      p.firstName,
      p.lastName
    FROM livedIn l
    JOIN person p ON l.personID = p.personID
    WHERE l.addressID = $addressID
      AND l.year = $year
  `;

  const stmtAll = db.prepare(sqlAll);
  stmtAll.bind({ $addressID: addressID, $year: currentYear });

  // 1. Group individuals by familyID
  const familiesMap = {};

  while (stmtAll.step()) {
    const person = stmtAll.getAsObject();
    const familyID = person.familyID;

    if (!familiesMap[familyID]) {
      familiesMap[familyID] = {
        headName: '',
        headNotes: '',
        members: []
      };
    }

    // Check if this person is the head of household
    if (person.relationToHead === 'Head') {
      const name = `${person.firstName || ''} ${person.lastName || ''}`.trim();
      familiesMap[familyID].headName = name || `Family #${familyID}`;
      familiesMap[familyID].headNotes = person.notes || '';
    }

    familiesMap[familyID].members.push(person);
  }
  stmtAll.free();

  const familyIDs = Object.keys(familiesMap);
  const count = familyIDs.length;

  // 2. Generate HTML markup using <details> for native accordions
  const familiesHTML = familyIDs.map(famID => {
    const family = familiesMap[famID];
    const headName = family.headName || `Family #${famID}`;

    const membersHTML = family.members.map(member => {
      const memberName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || `Individual #${member.personID}`;
      const relation = member.relationToHead ? ` (${member.relationToHead})` : '';

      return `
        <div class="individual-card">
          <p>${memberName}${relation}</p>
          <p>${member.notes ? member.notes : 'No extra notes available.'}</p>
        </div>
      `;
    }).join('');

    return `
      <details class="family-accordion" name="family-group">
        <summary class="family-header">
          <strong>Family of: ${headName}</strong>
        </summary>
        <div class="person-details">
          ${family.headNotes ? `<p class="family-notes"><em>${family.headNotes}</em></p>` : ''}
          ${membersHTML}
        </div>
      </details>
    `;
  }).join('');

  // 3. Render sidepanel
  content.innerHTML = `
    <h2>${addressName}</h2>
    <p><strong>Year:</strong> ${currentYear}</p>
    <p><strong>Total Families:</strong> ${count}</p>
    <hr>
    <h3>Families</h3>
    ${count > 0 ? familiesHTML : '<p>No family records found.</p>'}
  `;

  panel.classList.add('open');
}

function closeSidePanel() {
  const sidePanel = document.getElementById('sidepanel');
  if (sidePanel) {
    sidePanel.classList.remove('open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closepanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidePanel);
  }
});

function loadCityMarkers(db, cityName, selectedYear) {
  currentCityMarkers.clearLayers();

  const sql = `
    SELECT 
      a.addressID, 
      a.addressName, 
      a.latitude, 
      a.longitude, 
      a.city,
      COUNT(DISTINCT l.familyID) AS familyCount
    FROM addresses a
    JOIN livedIn l ON a.addressID = l.addressID
    WHERE a.city = $city AND l.year = $year
    GROUP BY a.addressID, a.addressName, a.latitude, a.longitude, a.city
  `;

  const stmt = db.prepare(sql);
  stmt.bind({ $city: cityName, $year: Number(selectedYear) });

  while (stmt.step()) {
    const row = stmt.getAsObject();
    
    if (row.latitude && row.longitude) {
      const marker = L.marker([row.latitude, row.longitude]).bindPopup(`<b>${row.addressName}</b><br> Families: ${row.familyCount}`);

      marker.on('click', () => {showAddressDetails(db, row.addressID, row.addressName);})
      
      currentCityMarkers.addLayer(marker);
    }
  }

  stmt.free(); 
}

function updateYearDropdown(cityName) {
  const yearDropdown = document.getElementById('yearSelect');
  if (!yearDropdown) return;
  
  yearDropdown.innerHTML = ''; 

  const config = CITY_CONFIG[cityName];
  if (!config) return;

  config.years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearDropdown.appendChild(option);
  });

  // Ensure currentYear updates to the active city's first available year
  currentYear = config.years[0];
  yearDropdown.value = currentYear;
}

function onYearChange(event) {
  currentYear = Number(event.target.value);
  loadCityMarkers(db, currentCity, currentYear);
}

function onCityChange(event) {
  currentCity = event.target.value;
  const config = CITY_CONFIG[currentCity];

  if (config) {
    map.setView(config.center, config.zoom);
    updateYearDropdown(currentCity); // Also resets currentYear internally
    loadCityMarkers(db, currentCity, currentYear);
  }
}

async function startMap() {
  db = await initDatabase();
  
  updateYearDropdown(currentCity);
  loadCityMarkers(db, currentCity, currentYear); 

  const citySelect = document.getElementById('citySelect');
  if (citySelect) {
    citySelect.addEventListener('change', onCityChange);
  }

  const yearSelect = document.getElementById('yearSelect');
  if (yearSelect) {
    yearSelect.addEventListener('change', onYearChange);
  }
}

startMap();

//THINGS FOR NEXT TIME
// - Make dropdowns look better within side panel
// - Make sure text is not too small and is easily readable
// - Start adding more families to the database
// -- Including different years / cities
// - See how adding photos works and how it displays in the dropdown

//PROBLEMS WITH DATABASE/CODE
// - Added spouseID and marriageYear to correctly display married/maiden name in sidepanel
// - How to fix when someone is married more than once within census years???
// - Can have list of spouseIDs within one column and use a delimiter to separate, but may be inefficient
// - Can do the same with marriage years, for-loop to iterate through and match in-order years to spouses

//Change how the drop down looks and the whole title bar at the top
//And after that make it so each data point button has different info on the panel

//Read through the side panel and button code so I understand it myself, and know how to make it customizable
//Start making things look pretty