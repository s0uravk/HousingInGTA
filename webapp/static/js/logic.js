// Initialization Function
function init () {
  let url = "https://services6.arcgis.com/ONZht79c8QWuX759/arcgis/rest/services/HousingConstructionActivity/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"

  d3.json(url).then(function(response) {
    console.log(response)
  })
}
// Adding Options to select tags
let url = "https://services6.arcgis.com/ONZht79c8QWuX759/arcgis/rest/services/HousingConstructionActivity/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
d3.json(url).then(response => {
  console.log(response)
  features = response.features;

  // Create Sets to store unique years and municipalities
  let uniqueYears = new Set();
  let uniqueMunicipalities = new Set();
  
  features.forEach(element => {
    // Add unique years to the Set
    uniqueYears.add(element.properties.Year);
    // Add unique municipalities to the Set
    uniqueMunicipalities.add(element.properties.Municipality);
  });

    // Convert Sets to arrays and sort them in ascending order
  let sortedYears = Array.from(uniqueYears).sort((a, b) => a - b);
  let sortedMunicipalities = Array.from(uniqueMunicipalities).sort();

  // Append sorted years to the dropdown
  sortedYears.forEach(year => {
    d3.select('#selYear')
      .append('option')
      .text(year)
      .attr('value', year);
  });

  // Append sorted municipalities to the dropdown
  sortedMunicipalities.forEach(municipality => {
    d3.select('#selMunc')
      .append('option')
      .text(municipality)
      .attr('value', municipality);
  });

 
})

// Calling init function
//init()