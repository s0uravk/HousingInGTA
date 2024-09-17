# Real Estate Dashboard

Welcome to the Real Estate Dashboard project! This web-based dashboard visualizes housing construction activities across Ontario municipalities, using Leaflet.js, D3.js, and Chart.js. The application allows users to explore housing trends over the past five years with interactive maps and bar charts.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

## Features

- **Interactive Map**: Visualize housing starts and completions with dynamic circle markers on a map. Filter by year to view data for specific time periods.
- **Bar Charts**: Display housing starts and completions by type using responsive bar charts.
- **Dropdown Filters**: Filter data by year and municipality, with charts and maps updating dynamically.
- **Geospatial Data Processing**: Fetch and process real-time data from GeoJSON sources, with city names mapped to coordinates.

## Technologies

- **Frontend**:
  - [D3.js](https://d3js.org/): For creating interactive data visualizations.
  - [Leaflet.js](https://leafletjs.com/): For interactive maps.
  - [Chart.js](https://www.chartjs.org/): For bar charts.
  - [OpenStreetMap API](https://nominatim.org/release-docs/develop/api/Search/): For city coordinates.
  
## Demo
You can view the live deployed dashboard here: [View the deployed dashboard](https://s0uravk.github.io/HousingInGTA/)

## Setup Instructions

### Prerequisites

Ensure you have the following installed:
- Node.js and npm (for frontend dependencies)

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/real-estate-dashboard.git
   cd real-estate-dashboard
   ```

2. **Install JavaScript Dependencies:**
   ```bash
   npm install d3 leaflet chart.js
   ```

### Running the Application

1. **Open Your HTML Files:**
   Open the `index.html` file in your preferred web browser.

## Usage

- **Filter Data**: Use the dropdowns to filter the data by year and municipality.
- **Map Interaction**: Click on markers on the map to view details of housing starts and completions.
- **Charts**: View bar charts for housing starts and completions, which update based on selected filters.

## Future Enhancements

- **Amenities Layer**: Incorporate additional map layers to show nearby amenities.
- **Enhanced Data Visualizations**: Add more advanced charts or trend analyses.
- **User Interaction**: Implement user feedback mechanisms or save favorite views.

## Contributing

Contributions are welcome! If you would like to contribute to this project, please fork the repository and submit a pull request with your changes. For major changes, please open an issue to discuss what you would like to change.
