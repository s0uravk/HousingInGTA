// Global variables to store features and chart instances
let features = [];
let barChartStarts = null;
let barChartCompletions = null;
let map; // Variable to hold the Leaflet map instance
let mapMarkers = []; // Initialize the mapMarkers array

// Initialization Function
function init() {
  let url = "https://services6.arcgis.com/ONZht79c8QWuX759/arcgis/rest/services/HousingConstructionActivity/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";

  d3.json(url).then(response => {
    features = response.features;
    populateDropdowns(features);
    updateCharts();
    // Call updateMap after data is loaded
    updateMap();
  }).catch(error => console.error('Error fetching data:', error));
}

// Function to populate dropdowns
function populateDropdowns(features) {
  let uniqueYears = new Set();
  let uniqueMunicipalities = new Set();

  features.forEach(element => {
    uniqueYears.add(element.properties.Year);
    uniqueMunicipalities.add(element.properties.Municipality);
  });

  let sortedYears = Array.from(uniqueYears).sort((a, b) => a - b);
  let sortedMunicipalities = Array.from(uniqueMunicipalities).sort();

  d3.select('#selYear').selectAll('option').remove();
  d3.select('#selMunc').selectAll('option').remove();
  d3.select('#selYearMap').selectAll('option').remove();

  sortedYears.forEach(year => {
    d3.select('#selYear')
      .append('option')
      .text(year)
      .attr('value', year);
  });

  sortedYears.forEach(year => {
    d3.select('#selYearMap')
      .append('option')
      .text(year)
      .attr('value', year);
  });

  sortedMunicipalities.forEach(municipality => {
    d3.select('#selMunc')
      .append('option')
      .text(municipality)
      .attr('value', municipality);
  });
}

// Function to update charts and map
function updateCharts() {
  let selectedYear = d3.select('#selYear').property('value');
  let selectedMunicipality = d3.select('#selMunc').property('value');
  let selectedYearMap = d3.select('#selYearMap').property('value');

  // Filter data for charts, including "GTA_total"
  let filteredDataForCharts = features.filter(d =>
    (selectedYear === '' || d.properties.Year == selectedYear) &&
    (selectedMunicipality === '' || d.properties.Municipality === selectedMunicipality)
  );

  // Filter data for the map, excluding "GTA_total"
  let filteredDataForMap = filteredDataForCharts.filter(d => d.properties.Municipality !== "GTA_total");

  let housingTypes = ['Starts_Singles', 'Starts_Semi', 'Starts_Row', 'Starts_Apartments'];
  let completionHousingTypes = ['Completions_Single', 'Completions_Semi', 'Completions_Row', 'Completions_Apartments'];

  let aggregatedDataStarts = {};
  let aggregatedDataCompletions = {};

  housingTypes.forEach(type => {
    aggregatedDataStarts[type] = 0;
  });

  completionHousingTypes.forEach(type => {
    aggregatedDataCompletions[type] = 0;
  });

  filteredDataForCharts.forEach(d => {
    housingTypes.forEach(type => {
      aggregatedDataStarts[type] += d.properties[type] || 0;
    });
    completionHousingTypes.forEach(type => {
      if (d.properties.hasOwnProperty(type)) {
        aggregatedDataCompletions[type] += d.properties[type] || 0;
      }
    });
  });

  let labelsStarts = housingTypes; // Use field names directly
  let valuesStarts = housingTypes.map(type => aggregatedDataStarts[type]);

  let labelsCompletions = completionHousingTypes; // Use field names directly
  let valuesCompletions = completionHousingTypes.map(type => aggregatedDataCompletions[type]);

  // Destroy existing charts if they exist
  if (barChartStarts) {
    barChartStarts.destroy();
  }
  if (barChartCompletions) {
    barChartCompletions.destroy();
  }

  // Create the Housing Starts chart
  let ctxStarts = d3.select('#barChartStarts').node().getContext('2d');
  barChartStarts = new Chart(ctxStarts, {
    type: 'bar',
    data: {
      labels: labelsStarts,
      datasets: [{
        label: 'Housing Starts by Type',
        data: valuesStarts,
        backgroundColor: [
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          beginAtZero: true
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Create the Housing Completions chart
  let ctxCompletions = d3.select('#barChartCompletions').node().getContext('2d');
  barChartCompletions = new Chart(ctxCompletions, {
    type: 'bar',
    data: {
      labels: labelsCompletions,
      datasets: [{
        label: 'Completed Housing by Type',
        data: valuesCompletions,
        backgroundColor: [
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          beginAtZero: true
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Update Leaflet map with markers based on the selected year
  updateMap();
}

// Function to initialize or update the map with markers
function updateMap() {
  // Check if map is already initialized
  if (!map) {
    // Initialize the map
    map = L.map("map", {
      center: [38.8264999, -100.8526688],
      zoom: 5
    });

    // Add a base layer to the map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }

  // Clear existing markers
  mapMarkers.forEach(marker => map.removeLayer(marker));
  mapMarkers = [];

  // Get the selected year from the dropdown
  let selectedYearMap = d3.select('#selYearMap').property('value');

  // Filter data for the selected year
  let filteredDataForMap = features.filter(d =>
    d.properties.Year == selectedYearMap &&
    d.properties.Municipality !== "GTA_total"
  );

  // Add new markers
  filteredDataForMap.forEach(d => {
    let lat = d.geometry.coordinates[1];
    let lng = d.geometry.coordinates[0];
    let marker = L.circle([lat, lng], {
      color: 'blue',
      fillColor: '#30f',
      fillOpacity: 0.5,
      radius: 1000 * (d.properties.Starts_Singles || 0) // Example for size
    }).addTo(map);

    // Add to mapMarkers array
    mapMarkers.push(marker);
  });
}

// Function to handle dropdown changes
function optionChanged() {
  updateCharts();
}

// Initialize the page
init();
