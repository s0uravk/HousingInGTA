// Initialize an empty object to store city coordinates
let cityCoordinates = {};

// Initialize global variables
let features = [];
let barChartStarts = null;
let barChartCompletions = null;
let map; // Variable to hold the Leaflet map instance
let mapMarkers = []; // Initialize the mapMarkers array
let uniqueYears = new Set();
let uniqueMunicipalities = new Set();
let startedLayer = L.layerGroup();
let completedLayer = L.layerGroup();

// Function to initialize the map
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
}


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

 console.log(processFeatures(features))
 
 function updateMap() {
  console.log('updateMap called');

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

  processFeatures(features).then(() => {
    let filteredFeatures = features.filter(feature => {
      return selectedYear === '' || String(feature.properties.Year) === String(selectedYear);
    });

    // Remove existing layers
    if (map.hasLayer(startedLayer)) {
      map.removeLayer(startedLayer);
    }
    if (map.hasLayer(completedLayer)) {
      map.removeLayer(completedLayer);
    }

   // Create the "Started" houses layer with smaller markers
   startedLayer = L.geoJSON(filteredFeatures, {
    pointToLayer: function (feature, latlng) {
      let startTotal = feature.properties.Starts_Total || 0;
      return L.circleMarker(latlng, {
        radius: Math.sqrt(startTotal) * 0.3, // Adjust size multiplier here
        fillColor: 'blue',
        color: 'black',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
      
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h5>Municipality:</h5> ${feature.properties.Municipality}<h5>
                       <h5>Starts Total:</h5> ${feature.properties.Starts_Total}<h5>
                       <h5>Year : </h5> ${feature.properties.Year}<h5>`);
    }
  });

  // Create the "Completed" houses layer with smaller markers
  completedLayer = L.geoJSON(filteredFeatures, {
    pointToLayer: function (feature, latlng) {
      let completionTotal = feature.properties.Completions_Total || 0;
      return L.circleMarker(latlng, {
        radius: Math.sqrt(completionTotal) * 0.3, // Adjust size multiplier here
        fillColor: 'green',
        color: 'black',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h5>Municipality:</h5> ${feature.properties.Municipality}<h5>
                       <h5>Completions Total:</h5> ${feature.properties.Completions_Total}<h5>
                       <h5>Year : </h5> ${feature.properties.Year}<h5>`);
    }
  });

  // Add layers to the map and set up layer control
  startedLayer.addTo(map);
  completedLayer.addTo(map);

  // Set up layer control
  L.control.layers(null, {
    "Housing Starts": startedLayer,
    "Housing Completions": completedLayer
  }).addTo(map);
}).catch(error => console.error('Error processing features:', error));
}

// Function to handle dropdown changes
function optionChanged() {
  updateCharts();
  updateMap();
}

// Initialize the page
init();