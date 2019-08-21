var styleBird = {
  // add birds-eye map  
  "version": 8,
  "sources": {
    'birdseye': {
      "type": "raster",
      "tileSize": 256,
      "tiles": [location.origin+location.pathname+"/data/raster/birdseye/{z}/{x}/{y}.png"]
    }
  },
  //"glyphs": location.origin+location.pathname+"font/{fontstack}/{range}.pbf",
  "layers": [{
    "id": "bird-tiles",
    "type": "raster",
    "source": "birdseye",
    "minzoom": 0,
    "maxzoom": 22,
    "paint": {
      "raster-opacity": 1,
      //"raster-opacity-transition": { "duration": 4000 / speed}
    }
  }]
};

var styleVec = {
  // add current-day map
  "version": 8,
  "sources": {
    "ortho": {
      "tiles": [location.origin+location.pathname+"/data/raster/ortho/{z}/{x}/{y}.png"],
      "type": "raster",
      "tileSize": 256
    },
    "osm": {
      "tiles": [location.origin+location.pathname+"/data/vector/osm/{z}/{x}/{y}.pbf"],
      "type": "vector"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "layout": {},
      "paint": {"background-color": "#f2f1eb"}
    },
    {
      "id": "vcgi_bw",
      "type": "raster",
      "source": "ortho",
      "layout": {},
      "paint": {
        "raster-saturation": -1,
        "raster-contrast": 0.66,
        "raster-brightness-max": 0.8,
        "raster-brightness-min": 0.5,
        "raster-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          16,
          0.8,
          19.5,
          0.3
        ]
      }
    },
    {
      "id": "building",
      "type": "fill-extrusion",
      "source": "osm",
      "source-layer": "building",
      "minzoom": 14,
      "layout": {},
      "paint": {
        "fill-extrusion-color": "#dfbdbf",
        "fill-extrusion-height":
        [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0,
          17,
          ["get", "height"]
        ],
        "fill-extrusion-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0.1,
          17,
          0.6
        ]
      }
    }
  ]
}