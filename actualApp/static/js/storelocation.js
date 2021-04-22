//Establish data source
const url = '/api/store';

d3.json(url).then(function(data) {
    console.log(data); 
    createMap(data);

});

function createMap(data) {

    var myIcon = L.icon({
        iconUrl: 'https://s3.amazonaws.com/shecodesio-production/uploads/files/000/004/934/original/shopping_cart.png?1613066289',
        iconSize: [30,25]
    })

    var marker = [];
    data.forEach(function(dataPoint) {
        marker.push(
            L.marker([dataPoint.Latitude, dataPoint.Longitude], {
                icon:myIcon})
                .bindPopup("<h4>" + dataPoint.City + "</h4><hr /><h6>" + dataPoint.Address + "</h6>")
        )   
    })

    var markerLayer = L.layerGroup(marker);

    var clusters = L.markerClusterGroup();
    clusters.addLayer(markerLayer);

    var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    var watercolor = L.tileLayer.provider('Stamen.Watercolor');

    var baseMaps = {
        "Dark Map": darkmap,
        "Street Map": streetmap,
        "Light Map": lightmap,
        "Watercolor": watercolor
    };

    var overlayMaps = {
        Stores: markerLayer
    };

    var myMap = L.map("map", {
        center: [43.198510, -112.359900],
        zoom: 3,
        layers: [streetmap],
        fullscreenControl: true
    });
    
    myMap.addLayer(clusters);

    L.control
        .layers(baseMaps, overlayMaps, {
        collapsed: true})
        .addTo(myMap);

    
}
