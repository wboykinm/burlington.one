# Preprocess lidar data with RGB color
. . . for use in `deck.js` 3d models per [Allan Walker's method](https://blog.mapbox.com/coloring-lidar-4522ca5a7186).

## Prereqs

- OGR/GDAL
- A working BigQuery instance (and your own preferred way of getting data there)
- Data (in this case pulled from [VCGI](http://geodata.vermont.gov/))
- An AOI mask (`uvm_mask.sh` in this case)

### Extract elevation for uvm
_Yes, the pixel resolution set here is silly for a WGS84 dataset, but at least it's consistently-silly . . ._

`gdalwarp -of GTiff -tr 8.725154295732531e-06 -6.352619255283447e-06 -tap -cutline uvm_mask.shp -cl uvm_mask -crop_to_cutline Elevation_DSM0p7m2014_UVM.tif tmp_tiff/Elevation_DSM0p7m2014_UVMd.tif`

### Extract imagery for uvm, resampling up to lidar coarseness

`gdalwarp -of GTiff -tr 8.725154295732530851e-06 -6.352619255283446904e-06 -tap -cutline uvm_mask.shp -cl uvm_mask -crop_to_cutline tmp_tiff/UVM_20130423d.tif tmp_tiff/UVM_20130423e.tif`

### Turn elevation into a csv

`gdal2xyz.py -band 1 -csv tmp_tiff/Elevation_DSM0p7m2014_UVMd.tif tmp_tiff/UVM_elevation.csv`

### Turn imagery into band csvs
```
gdal2xyz.py -band 1 -csv tmp_tiff/UVM_20130423f.tif tmp_tiff/UVM_20130423f_red.csv

gdal2xyz.py -band 2 -csv tmp_tiff/UVM_20130423f.tif tmp_tiff/UVM_20130423f_green.csv

gdal2xyz.py -band 3 -csv tmp_tiff/UVM_20130423f.tif tmp_tiff/UVM_20130423f_blue.csv
```

### Send these to BigQuery tables for spatial joining, as:

```
tmp_tiff/UVM_elevation.csv --> tmp.bill_test_e
tmp_tiff/UVM_20130423f_red.csv --> tmp.bill_test_ir
tmp_tiff/UVM_20130423f_green.csv --> tmp.bill_test_ig
tmp_tiff/UVM_20130423f_blue.csv --> tmp.bill_test_ib
```

# Over on BigQuery, run the join as a sequence of created tables:

```SQL
CREATE OR REPLACE TABLE `tmp.bill_image` AS (
SELECT
    GENERATE_UUID() AS i_id,
    r.x AS x,
    r.y AS y,
    r.red AS red,
    g.green AS green,
    b.blue AS blue,
    ST_GeogPoint(CAST(r.x AS numeric), CAST(r.y AS numeric)) AS the_geog
  FROM `tmp.bill_test_ir` r
  JOIN `tmp.bill_test_ig` g ON g.x = r.x AND g.y = r.y
  JOIN `tmp.bill_test_ib` b ON b.x = r.x AND b.y = r.y
);
  
CREATE OR REPLACE TABLE `tmp.bill_elev` AS (
  SELECT
    GENERATE_UUID() AS e_id,
    *,
    ST_GeogPoint(CAST(x AS numeric), CAST(y AS numeric)) AS the_geog
  FROM `tmp.bill_test_e`
);

CREATE OR REPLACE TABLE `tmp.bill_joined` AS (
  SELECT
    ARRAY_AGG(i.i_id ORDER BY ST_Distance(e.the_geog, i.the_geog) LIMIT 1) [ORDINAL(1)] AS i_id,
    e.e_id
  FROM `tmp.bill_elev` e 
  JOIN `tmp.bill_image` i ON ST_DWithin(e.the_geog, i.the_geog, 10)
  GROUP BY e.e_id
);

-- Put it all together
CREATE OR REPLACE TABLE `tmp.bill_final` AS (
  SELECT 
    e.x,
    e.y,
    e.z,
    i.red,
    i.green,
    i.blue
  FROM `tmp.bill_elev` e
  JOIN `tmp.bill_joined` j ON j.e_id = e.e_id
  JOIN `tmp.bill_image` i ON i.i_id = j.i_id
);
```

### Fold it all into an array of arrays 
. . . which matches the schema expected by [the client implementation](index.html) (i.e. the way deck.js wants to parse it)

```SQL
SELECT
  FORMAT("%T", [
    CAST(x AS FLOAT64),
    CAST(y AS FLOAT64),
    CAST(z AS FLOAT64),
    CAST(red AS INT64),
    CAST(green AS INT64),
    CAST(blue AS INT64)
  ]) AS arr
FROM `tmp.bill_final` 
```

# Export the above 
. . . as a `.json` file, stash it on dropbox for retrieval by the client, as specified in [index.html](index.html)