
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9zY2lsbGF0b3IiLCJhIjoiY2oya3F1bzQzMDBrbjMzczVoNjk5NzE4dCJ9.IGqUQQ3XNps5MVol_Raikg'
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 9,
    center: [-120.646231,47.833999],
    style: 'mapbox://styles/mapbox/dark-v9'
})

map.on('load', function() {
    map.addSource('fuel-type-colors', {
        "type": "geojson",
        "data": datasrc
    });

    map.addLayer({
        "id": "earthquakes-point",
        "type": "circle",
        "source": "fuel-type-colors",
        //"minzoom": 7,
        "paint": {
            // Color circle by earthquake magnitude
            "circle-color": [
                "get", "fuel-type-color"
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            // Transition from heatmap to circle layer by zoom level
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 0,
                8, 1
            ]
        }
    }, 'waterway-label');
})