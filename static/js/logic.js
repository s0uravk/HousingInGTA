// Global variables to store features and chart instances
let features = [];
let barChartStarts = null;
let barChartCompletions = null;
let map; // Variable to hold the Leaflet map instance
let mapMarkers = []; // Initialize the mapMarkers array
let uniqueYears = new Set();
let uniqueMunicipalities = new Set();

// Initialization Function
function init() {
  let url = "https://services6.arcgis.com/ONZht79c8QWuX759/arcgis/rest/services/HousingConstructionActivity/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";

  d3.json(url).then(response => {
    features = response.features;
    populateDropdowns(features);
    updateCharts();
    // Call updateMap after data is loaded
    updateMap();
    processFeatures(features);
  }).catch(error => console.error('Error fetching data:', error));
}

// Function to populate dropdowns
function populateDropdowns(features) {

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
};
 // Initialize an empty object to store city coordinates
let cityCoordinates = {};

// Function to fetch coordinates for each city
async function fetchCityCoordinates(uniqueMunicipalities) {
  let fetchPromises = uniqueMunicipalities.map(async city => {
    let url = `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`;
    try {
      let data = await d3.json(url);
      // console.log(`API response for ${city}:`, data); // Log API response
      if (data.length > 0) {
        cityCoordinates[city] = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      } else {
        console.warn(`No coordinates found for city: ${city}`);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  });

  await Promise.all(fetchPromises);
}

// Function to add coordinates to the JSON data
function updateFeaturesWithCoordinates(features) {
  features.forEach(item => {
    let city = item.properties.Municipality;
    if (cityCoordinates[city]) {
      item.geometry = {
        type: "Point",
        coordinates: [cityCoordinates[city].lon, cityCoordinates[city].lat]
      };
    }
  });
}

// Example usage
async function processFeatures(features) {
  let uniqueMunicipalities = [...new Set(features.map(f => f.properties.Municipality))];
  await fetchCityCoordinates(uniqueMunicipalities);
  updateFeaturesWithCoordinates(features);
}

processFeatures(features);

function getColorBasedOnCompletion(completionTotal) {
  // Define your color scale based on completion totals
  if (completionTotal > 1000) return 'red';
  if (completionTotal > 500) return 'orange';
  return 'green';
}

function updateMap() {
  console.log('updateMap called');

  // Get the selected year from the dropdown
  let selectedYear = d3.select('#selYearMap').property('value');

  if (!map) {
    map = L.map("map", {
      center: [43.7, -79.42], // Coordinates for the GTA area
      zoom: 10
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }

  // Filter features based on the selected year
  let filteredFeatures = features.filter(feature => {
    return selectedYear === '' || String(feature.properties.Year) === String(selectedYear);
  });

  // Remove existing layers
  if (map.hasLayer(mapMarkers)) {
    map.removeLayer(mapMarkers);
  }



  function onEachFeature(feature, layer) {
    layer.bindPopup(`<b>Municipality:</b> ${feature.properties.Municipality}<br>
                     <b>Starts Total:</b> ${feature.properties.Starts_Total}<br>
                     <b>Completions Total:</b> ${feature.properties.Completions_Total}`);
  }

  // Add filtered features to the map
  mapMarkers = L.geoJSON(filteredFeatures, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, styleFeature(feature));
    },
    onEachFeature: onEachFeature
  }).addTo(map);

  // Update legend
  updateLegend();
}

// Function to update the legend based on color scale
function updateLegend() {
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 500, 1000];
    let labels = ['< 500', '500 - 1000', '> 1000'];

    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColorBasedOnCompletion(grades[i] + 1) + '"></i> ' +
        labels[i] + '<br>';
    }

    return div;
  };

  legend.addTo(map);
};


// Function to handle dropdown changes
function optionChanged() {
  updateCharts();
  updateMap();
}

// Initialize the page
init();
