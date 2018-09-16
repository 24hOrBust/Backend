
mapboxgl.accessToken = 'pk.eyJ1IjoiYm9zY2lsbGF0b3IiLCJhIjoiY2oya3F1bzQzMDBrbjMzczVoNjk5NzE4dCJ9.IGqUQQ3XNps5MVol_Raikg'
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 9,
    center: [-73.695134,42.732189],
    style: 'mapbox://styles/mapbox/satellite-v9'
})

map.on('load', function() {
    map.addSource('fuel-type-colors', {
        "type": "geojson",
        "data": datasrc
    });

    map.addLayer({
        "id": "earthquakes-heat",
        "type": "heatmap",
        "source": "fuel-type-colors",
        "maxzoom": 16.38,
        "paint": {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "rate-of-spread"],
                0, 0.25,
                100, 1
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 1,
                9, 3
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0, "rgba(33,102,172,0)",
                0.2, "rgb(103,169,207)",
                0.4, "rgb(209,229,240)",
                0.6, "rgb(253,219,199)",
                0.8, "rgb(239,138,98)",
                1, "rgb(178,24,43)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["get","rate-of-spread"],
                0, 10,
                100, 20
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7, 1,
                20, 0.25
            ],
        }
    });


    map.addLayer({
        "id": "fuel-points",
        "type": "circle",
        "source": "fuel-type-colors",
        "minzoom": 16.38,
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
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'fuel-points', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties["fuel-type-name"];

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('mouseleave', 'fuel-points', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
})

setInterval(function() {
    console.log(map.getZoom())
}, 100);