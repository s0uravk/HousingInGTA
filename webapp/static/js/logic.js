// Global variables to store features and chart instance
let features = [];
let barChart = null;

// Initialization Function
function init() {
  let url = "https://services6.arcgis.com/ONZht79c8QWuX759/arcgis/rest/services/HousingConstructionActivity/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";

  d3.json(url).then(response => {
    console.log(response);
    features = response.features;
    populateDropdowns(features);
    updateChart();
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

  sortedYears.forEach(year => {
    d3.select('#selYear')
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

function updateChart() {
  let selectedYear = d3.select('#selYear').property('value');
  let selectedMunicipality = d3.select('#selMunc').property('value');

  // Filter data based on selected values
  let filteredData = features.filter(d =>
    (selectedYear === '' || d.properties.Year == selectedYear) &&
    (selectedMunicipality === '' || d.properties.Municipality === selectedMunicipality)
  );

  // Aggregate data by type of housing
  let housingTypes = ['Starts_Singles', 'Starts_Semi', 'Starts_Row', 'Starts_Apartments'];
  let aggregatedData = {};

  // Initialize aggregatedData for each type
  housingTypes.forEach(type => {
    aggregatedData[type] = 0;
  });

  filteredData.forEach(d => {
    housingTypes.forEach(type => {
      aggregatedData[type] += d.properties[type] || 0;
    });
  });

  // Prepare data for Chart.js
  let labels = housingTypes;
  let values = housingTypes.map(type => aggregatedData[type]);

  // Destroy the previous chart if it exists
  if (barChart) {
    barChart.destroy();
  }

  // Create a new bar chart
  let ctx = document.getElementById('barChart').getContext('2d');
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Housing Starts by Type',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
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

// Function to handle dropdown changes
function optionChanged() {
  updateChart();
}

// Initialize the page
init();
