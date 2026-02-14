L.mapbox.accessToken = 'pk.eyJ1IjoibGFuZHBsYW5uZXIiLCJhIjoiY2lyb2YxaWt5MGJ3NGZrbTY4Y2x6MzdpbCJ9.Icd0ic7Rovbm58u89_AZ7A';

var map = L.mapbox.map('map').setView([44.487, -73.226], 13);

//var popup = new L.Popup({ autoPan: false });
var streetsBase = 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png'
var streetsRef = 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png'
//var streetsBase = 'https://api.mapbox.com/styles/v1/landplanner/cirvbac9j000zg6m8uol41ae1/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGFuZHBsYW5uZXIiLCJhIjoicUtlZGgwYyJ9.UFYz8MD4lI4kIzk9bjGFvg'
//var streetsRef = 'https://api.mapbox.com/styles/v1/landplanner/cirvbh1p20013g8nrqykpfwog/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGFuZHBsYW5uZXIiLCJhIjoicUtlZGgwYyJ9.UFYz8MD4lI4kIzk9bjGFvg'

var baseLayer = L.tileLayer(streetsBase).addTo(map);

// control that shows state info on hover
var info = L.control({position: 'bottomleft'});

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

// Reusable as long as everything has a "name" field
info.update = function (props) {
  this._div.innerHTML = (props ? props.tooltip : '' );
};

info.addTo(map);

$("table").attr( "class", "table table-striped table-condensed" );
////////////////////////////////////////////////////////////////////////
//////////////////////    NATURAL LAYERS   /////////////////////////////
////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////// 


// SUBWATERSHEDS LAYER
var subwatersheds = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#225378",
      fillColor: '#acf0f2',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.6,
      clickable: true
    };
  },
  onEachFeature: onEachFeaturesheds
});

function resetHighlightsheds(e) {
  subwatersheds.resetStyle(e.target) 
  info.update();
}

// Behavior for vector layers
function onEachFeaturesheds(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightsheds,
  });
}

$.getJSON("geodata/chittenden_subwatersheds.topojson", function(data) {
  var subwatershedsgeojson = topojson.feature(data, data.objects.chittenden_subwatersheds).features;
  subwatersheds.addData(subwatershedsgeojson);
});

// CITY PARKS LAYER
var parks = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#26393d",
      fillColor: '#d0a825',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.6,
      clickable: true
    };
  },
  onEachFeature: onEachFeatureparks
});

function resetHighlightparks(e) {
  parks.resetStyle(e.target) 
  info.update();
}

// Behavior for vector layers
function onEachFeatureparks(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightparks,
  });
}

$.getJSON("geodata/btv_parks.topojson", function(data) {
  var parksgeojson = topojson.feature(data, data.objects.btv_parks).features;
  parks.addData(parksgeojson);
});

// WETLANDS LAYER
var wetlands = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#fffae4",
      fillColor: '#40627c',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
      clickable: true
    };
  },
  onEachFeature: onEachFeaturewet
});

function resetHighlightwet(e) {
  wetlands.resetStyle(e.target) 
  info.update();
}

// Behavior for vector layers
function onEachFeaturewet(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightwet,
  });
}

$.getJSON("geodata/chittenden_vswi_wetlands.topojson", function(data) {
  var wetlandsgeojson = topojson.feature(data, data.objects.chittenden_vswi_wetlands).features;
  wetlands.addData(wetlandsgeojson);
});

// CURRENT PRECIPITATION LAYER
/*var currentPrecipitation = L.tileLayer.wms("http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs", {
    format: 'image/png',
    transparent: true,
    layers: 'RAS_RIDGE_NEXRAD'
});*/

// CLIMATE LAYER
function getColorPrecip(d) {
  return d > 70 ? '#253494' : 
        d > 63 ? '#2c7fb8' : 
        d > 55 ? '#41b6c4' : 
        d > 48 ? '#7fcdbb' : 
        d > 41 ? '#c7e9b4' : 
        d > 33 ? '#ffffcc' : 
        '#ffffff';
}

var precipitation = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#333333",
      fillColor: getColorPrecip(feature.properties.inches),
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
      clickable: true
    };
  },
  onEachFeature: onEachFeatureprecip
});

function resetHighlightprecip(e) {
  precipitation.resetStyle(e.target) 
  info.update();
}

// Behavior for vector layers
function onEachFeatureprecip(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightprecip,
  });
}

$.getJSON("geodata/chittenden_30yr_mean_precip_in.topojson", function(data) {
  var precipgeojson = topojson.feature(data, data.objects.chittenden_precip).features;
  precipitation.addData(precipgeojson);
});

//COMMUNITY GARDEN LAYER

var gardens = L.geoJson(null, {
  onEachFeature: function (feature, layer) {
    layer.setIcon(
      L.mapbox.marker.icon(
        {
          'marker-symbol': 'garden', 
          'marker-color': '59245f'
        }
      )
    );
    layer.bindPopup("<h1>" + feature.properties.name + "</h1><p>" + feature.properties.description + "</p>");
  }
});
$.getJSON("geodata/btv_community_gardens.topojson", function(data) {
  var gardensgeojson = topojson.feature(data, data.objects.collection).features;
  gardens.addData(gardensgeojson);
});

////////////////////////////////////////////////////////////////////////
///////////////////////    SOCIAL LAYERS    ////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// CENSUS LAYERS

// get color depending on population density value
function getColor1(d) {
  return d > 18800 ? '#08306b' : 
        d > 11400 ? '#3e4d82' : 
        d > 7570 ? '#656e9a' : 
        d > 5390 ? '#8b90b3' : 
        d > 3570 ? '#b1b4cc' : 
        d > 860 ? '#d7d9e5' : 
        '#ffffff';
}

function getColor2(d) {
  return d > 300 ? '#4a1486' : 
        d > 164 ? '#6a51a3' : 
        d > 96 ? '#807dba' : 
        d > 61 ? '#9e9ac8' : 
        d > 33 ? '#bcbddc' : 
        d > 11 ? '#dadaeb' : 
        '#ffffff';
}

function getStyle1(feature) {
  return {
    weight: 0,
    opacity: 0,
    fillOpacity: 0.7,
    fillColor: getColor1(feature.properties.popdens)
  };
}

function getStyle2(feature) {
  return {
    weight: 0,
    opacity: 0,
    fillOpacity: 0.7,
    fillColor: getColor2(feature.properties.housing)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 3,
    color: '#333',
    opacity: 0.8,
    fillOpacity: 0.3
  });

  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

var popdensity;
var housing;

function resetHighlight1(e) {
  popdensity.resetStyle(e.target) 
  info.update();
}

function resetHighlight2(e) {
  housing.resetStyle(e.target)
  info.update();
}

function onEachFeature1(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight1,
  });
}

function onEachFeature2(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight2,
  });
}

popdensity = L.geoJson(null, {
  style: getStyle1,
  onEachFeature: onEachFeature1
});

housing = L.geoJson(null, {
  style: getStyle2,
  onEachFeature: onEachFeature2
});

$.getJSON("geodata/btv_census_blocks_2010.topojson", function(data) {
  var censusgeojson = topojson.feature(data, data.objects.btv_census_blocks_2010).features;
  popdensity.addData(censusgeojson);
  housing.addData(censusgeojson);
});

// END CENSUS LAYERS


// CITY BOUNDARY LAYER
var city = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#1E90FF",
      fill: false,
      weight: 4,
      opacity: 1,
      clickable: false
    };
  }
});
$.getJSON("geodata/burlington.topojson", function(data) {
  var citygeojson = topojson.feature(data, data.objects.burlington).features;
  city.addData(citygeojson);
});

// COUNTY BOUNDARY LAYER
var county = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#1E90FF",
      fill: false,
      weight: 1,
      opacity: 1,
      clickable: false
    };
  }
});
$.getJSON("geodata/chittenden_towns.topojson", function(data) {
  var countygeojson = topojson.feature(data, data.objects.chittenden_towns).features;
  county.addData(countygeojson);
});

// SURFICIAL GEOLOGY LAYER
function getColorSurfgeo(d) {
  return d == 1 ? '#a6cee3' : 
        d == 2 ? '#1f78b4' : 
        d == 3 ? '#b2df8a' : 
        d == 4 ? '#33a02c' : 
        d == 5 ? '#fb9a99' : 
        d == 6 ? '#e31a1c' :
        d == 7 ? '#fdbf6f' : 
        '#ff7f00';
}

var surfgeo = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#333333",
      fillColor: getColorSurfgeo(feature.properties.id),
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
      clickable: true
    };
  },
  onEachFeature: onEachFeaturesurfgeo
});

function resetHighlightsurfgeo(e) {
  surfgeo.resetStyle(e.target) 
  info.update();
}

// Behavior for vector layers
function onEachFeaturesurfgeo(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightsurfgeo,
  });
}

$.getJSON("geodata/chittenden_surficial_geology.topojson", function(data) {
  var surfgeogeojson = topojson.feature(data, data.objects.chittenden_surfgeo).features;
  surfgeo.addData(surfgeogeojson);
});

// BEDROCK GEOLOGY LAYER
function getColorbedrock(d) {
  return d == 1 ? '#fbb4ae' : 
        d == 2 ? '#b3cde3' : 
        d == 3 ? '#ccebc5' : 
        d == 4 ? '#decbe4' : 
        d == 5 ? '#fed9a6' : 
        d == 6 ? '#ffffcc' :
        '#e5d8bd';
}

var bedrock = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#333333",
      fillColor: getColorbedrock(feature.properties.subcategor),
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
      clickable: true
    };
  },
  onEachFeature: onEachFeaturebedrock
});

function resetHighlightbedrock(e) {
  bedrock.resetStyle(e.target) 
  info.update();
}

// Behavior for vector layers
function onEachFeaturebedrock(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightbedrock,
  });
}

$.getJSON("geodata/chittenden_bedrock.topojson", function(data) {
  var bedrockgeojson = topojson.feature(data, data.objects.chittenden_bedrock).features;
  bedrock.addData(bedrockgeojson);
});

addLayer(city, 'City Boundary', 1, 'social');
addLayer(county, 'Chittenden County Towns', 2, 'social');
addLayer(bedrock, 'Bedrock Geology', 4, 'natural');
addLayer(surfgeo, 'Surficial Geology', 5, 'natural');
addLayer(L.tileLayer('https://s3.amazonaws.com/geosprocket/tiles/btv-soils/{z}/{x}/{y}.png'), 'Soil Types', 6, 'natural');
addLayer(subwatersheds, 'Subwatersheds', 7, 'natural');
addLayer(L.tileLayer('https://s3.amazonaws.com/geosprocket/btvgeographic/{z}/{x}/{y}.png'), 'Elevation Contours', 8, 'natural');
addLayer(wetlands, 'VSWI Wetlands', 9, 'natural');
addLayer(precipitation, 'Annual Mean Precipitation', 10, 'natural');
addLayer(popdensity, 'Population Density, 2010', 11, 'social');
addLayer(housing, 'Households, 2010', 12, 'social');
addLayer(parks, 'City Parks', 13, 'social');
addLayer(L.mapbox.tileLayer('landplanner.hm1kg9l2'), 'Building Footprints', 14, 'social');
addLayer(gardens, 'Community Gardens', 15, 'social');
addLayer(L.tileLayer('http://mapwarper.net/layers/tile/586/{z}/{x}/{y}.png'), '1810 - "A correct map of Burlington from actual survey." Made by W. Colt', 16, 'historical')
addLayer(L.tileLayer('http://mapwarper.net/layers/tile/572/{z}/{x}/{y}.png'), '1830 - Plan of Burlington Village Drawn by A.B. Young', 17, 'historical')
addLayer(L.tileLayer('http://mapwarper.net/layers/tile/576/{z}/{x}/{y}.png'), '1890 - Map of the City of Burlington by G.M. Hopkins', 18, 'historical')
addLayer(L.tileLayer('http://mapwarper.net/layers/tile/409/{z}/{x}/{y}.png'), '1937 - Aerial photography of Burlington, VT by Sanborn Co.', 19, 'historical')


function addLayer(layer, name, zIndex, category) {
  var controllerType = category + 'Layers'
  var ui = document.getElementById(controllerType);
  layer.setZIndex(zIndex);
  var link = document.createElement('button');
  link.href = '#';
  link.className = 'btn btn-default btn-xs btn-block';
  link.setAttribute("type", "button")
  link.type = 'button';
  link.innerHTML = name;
  link.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      this.className = 'btn btn-default btn-xs btn-block';
      // TODO fix the multi-layer weirdness here
      if (category == 'historical') {
        map.removeLayer(topLayer);
        topLayer = L.tileLayer(streetsRef, {
          maxZoom: 18
        }).addTo(map);
        topPane.appendChild(topLayer.getContainer());
        topLayer.setZIndex(7);
      }
    } else {
      map.addLayer(layer);
      this.className = 'active btn btn-default btn-xs btn-block';
      if (category == 'historical') {
        map.removeLayer(topLayer);
      }
    }
  };
  ui.appendChild(link);
};

// TODO ADD LAYER CONTROLLER
/*
$.getJSON('js/layerConfig.json', function(data) {
  for (var i = 0; i < data.length; i++) {
    var controllerType = data[i].type + 'Layers'
    var ui = document.getElementById(controllerType);
    var layer = data[i].use
    console.log(data[i])
    layer.setZIndex(data[i].zindex);
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'btn btn-default btn-xs';
    link.type = 'button';
    link.innerHTML = data[i].name;
    link.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
        this.className = 'btn btn-default btn-xs';
      } else {
        map.addLayer(layer);
        this.className = 'active btn btn-primary btn-xs';
      }
    };
    ui.appendChild(link);
  }
})
*/
// ADD THE REFERENCE OVERLAY
var topPane = L.DomUtil.create('div', 'leaflet-top-pane', map.getPanes().mapPane);
var topLayer = new L.tileLayer(streetsRef, {
  maxZoom: 18
}).addTo(map);
topPane.appendChild(topLayer.getContainer());
topLayer.setZIndex(7);

//SWITCH BASEMAPS
document.getElementById('streets').onclick = function() {
  map.removeLayer(baseLayer);
  map.removeLayer(topLayer);
  baseLayer = L.tileLayer(streetsBase).addTo(map);
  topLayer = L.tileLayer(streetsRef, {
    maxZoom: 18
  }).addTo(map);
  topPane.appendChild(topLayer.getContainer());
  topLayer.setZIndex(7);
};
document.getElementById('satellite').onclick = function() {
  map.removeLayer(baseLayer);
  map.removeLayer(topLayer);
  baseLayer = L.mapbox.tileLayer('landplanner.h1dknok1').addTo(map);
  topLayer = L.mapbox.tileLayer('landplanner.map-6ycmi90w', {
    maxZoom: 18
  }).addTo(map);
  topPane.appendChild(topLayer.getContainer());
  topLayer.setZIndex(7);
};