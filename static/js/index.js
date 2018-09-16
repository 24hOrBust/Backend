
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

    // map.addLayer({
    //     "id": "earthquakes-heat",
    //     "type": "heatmap",
    //     "source": "fuel-type-colors",
    //     "maxzoom": 16.38,
    //     "paint": {
    //         // Increase the heatmap weight based on frequency and property magnitude
    //         "heatmap-weight": [
    //             "interpolate",
    //             ["linear"],
    //             ["get", "rate-of-spread"],
    //             0, 0.25,
    //             100, 1
    //         ],
    //         // Increase the heatmap color weight weight by zoom level
    //         // heatmap-intensity is a multiplier on top of heatmap-weight
    //         "heatmap-intensity": [
    //             "interpolate",
    //             ["linear"],
    //             ["zoom"],
    //             0, 1,
    //             9, 3
    //         ],
    //         // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    //         // Begin color ramp at 0-stop with a 0-transparancy color
    //         // to create a blur-like effect.
    //         "heatmap-color": [
    //             "interpolate",
    //             ["linear"],
    //             ["heatmap-density"],
    //             0, "rgba(0,0,0,0)",
    //             0.01, "rgb(0,255,0)",
    //             1, "rgb(255,0,0)"
    //         ],
    //         // Adjust the heatmap radius by zoom level
    //         "heatmap-radius": [
    //             "interpolate",
    //             ["linear"],
    //             ["get","rate-of-spread"],
    //             0, 10,
    //             100, 20
    //         ],
    //         // Transition from heatmap to circle layer by zoom level
    //         "heatmap-opacity": [
    //             "interpolate",
    //             ["linear"],
    //             ["zoom"],
    //             7, 1,
    //             20, 0.25
    //         ],
    //     }
    // });


    map.addLayer({
        "id": "fuel-points",
        "type": "circle",
        "source": "fuel-type-colors",
        //"minzoom": 16.38,
        "paint": {
            // Color circle by earthquake magnitude
            "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "rate-of-spread"],
                0, "rgb(0,255,0)",
                100, "rgb(255,0,0)"
            ],
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "rate-of-spread"],
                0, 20,
                100, 40
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": [
                "interpolate",
                ["linear"],
                ["get", "sample"],
                0, 1,
                1, 0
            ],
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 0.25,
                13, 0.25,
                17, 0.75
            ],
            "circle-blur": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5, 10,
                18, 0
            ]
        }
    });

    map.addLayer({
        "id": "individ_points",
        "type": "circle",
        "source": "fuel-type-colors",
        "paint": {
            "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "rate-of-spread"],
                0, "rgb(0,255,0)",
                100, "rgb(255,0,0)"
            ],
            "circle-radius": 10,
            "circle-stroke-color": "white",
            "circle-stroke-width": [
                "interpolate",
                ["linear"],
                ["get", "sample"],
                0, 1,
                1, 0
            ],
            "circle-opacity": [
                "interpolate",
                ["linear"],
                ["get", "sample"],
                0, 1,
                1, 0
            ]
        }
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mousemove', 'fuel-points', function(e) {
        //Cancel if we are too far from the circles
        if(map.getZoom() < 15) return;

        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties["fuel-type-name"];
        description += "\n(Estimated spread rate: ";
        description += (e.features[0].properties["rate-of-spread"]*0.02012).toFixed(2);
        description += " kph)";

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        // }

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
    //console.log(map.getZoom())
}, 100);