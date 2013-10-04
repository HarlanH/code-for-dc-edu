require 'rubygems'
require 'json'
require 'fileutils'

OUTPUT_FILE = "merged.geojson"

kmz_file = File.read(ARGV[0])
kmz_result = JSON.parse(kmz_file)
kmz_features = kmz_result["features"]

shp_file = File.read(ARGV[1])
shp_result = JSON.parse(shp_file)
shp_features = shp_result["features"]

kmz_features.each_with_index do |feature, i|
	feature["properties"] = shp_features[i]["properties"]
    feature["geometry"] = feature["geometry"]["geometries"][1]
end

File.open(OUTPUT_FILE,"w") { |f| f.write('{"type":"FeatureCollection","features":' + kmz_features.to_json + '}') }