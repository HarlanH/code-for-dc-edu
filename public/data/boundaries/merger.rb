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

regex = /(?<=SCHOOL NAME<\/td><td class="dataGridRightTD">)(.*?)(?=<)/

kmz_features.each_with_index do |feature, i|
    school_name = feature["properties"]["Description"].match regex
    shp_matches = shp_features.select { |shp| shp["properties"]["SCHOOLNAME"] == school_name[1]}
    if shp_matches.length == 1
    	feature["properties"] = shp_matches[0]["properties"]
        feature["geometry"] = feature["geometry"]["geometries"][1]
    else
        puts "Couldn't match " + school_name[1]
    end
end

File.open(OUTPUT_FILE,"w") { |f| f.write('{"type":"FeatureCollection","features":' + kmz_features.to_json + '}') }