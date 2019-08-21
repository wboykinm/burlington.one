# get list of btv tiles with robosat (presumably in a docker container) because it's easy
docker pull mapbox/robosat:latest-cpu
docker run -i -t mapbox/robosat:latest-cpu /bin/bash
echo '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Polygon", "coordinates": [ [ [ -73.29151153564453, 44.43990835130455 ], [ -73.14628601074219, 44.43990835130455 ], [ -73.14628601074219, 44.54130294068246 ], [ -73.29151153564453, 44.54130294068246 ], [ -73.29151153564453, 44.43990835130455 ] ] ] } } ] }' > btv.geojson
zooms=( 12 13 14 15 16 17 18 )
for i in "${zooms[@]}"; do
  ./rs cover --zoom $i btv.geojson btv_$i.csv
done

# back on the local repo . . .

# combine tile lists for vectors (in data/tmp/)
cd tmp/
csvstack btv_12.csv btv_13.csv btv_14.csv btv_15.csv btv_16.csv > btv.csv
# add z17-18 to the stack (in data/tmp/)
csvstack btv_12.csv btv_13.csv btv_14.csv btv_15.csv btv_16.csv btv_17.csv btv_18.csv > btv_high.csv
cd ../

# vectors

# (this, specifically: https://github.com/systemed/tilemaker)
brew install protobuf boost lua51 shapelib
cd ~/github/tilemaker/
wget -c http://download.geofabrik.de/north-america/us/vermont-latest.osm.pbf
# set config compression to "none", add building height field
tilemaker vermont-latest.osm.pbf --output=osm/
cp -r osm/ ~/github/bird/offline/data/vector/

# b&w sat bases
while read p
do
  x=$(echo $p | csvcut -c 1)
  y=$(echo $p | csvcut -c 2)
  z=$(echo $p | csvcut -c 3)
  curl https://maps.vcgi.vermont.gov/arcgis/rest/services/EGC_services/IMG_VCGI_BW_WM_CACHE/ImageServer/tile/$z/$y/$x --create-dirs -o raster/ortho/$z/$x/$y.png
done < tmp/btv_high.csv

# birdseye
while read p
do
  x=$(echo $p | csvcut -c 1)
  y=$(echo $p | csvcut -c 2)
  z=$(echo $p | csvcut -c 3)
  curl https://mapwarper.net/maps/tile/33964/$z/$x/$y --create-dirs -o raster/birdseye/$z/$x/$y.png
done < tmp/btv_high.csv

