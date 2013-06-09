# convert the geojson about clusters into a more compact form that
# can be used for plotting centers and names

options(stringsAsFactors=FALSE)

library(rjson)
library(plyr)
library(stringr)

dat <- fromJSON(file='../clusters.geojson')

proc_one_neighborhood <- function(dd) {
    out <- data.frame(
        id = as.numeric(str_sub(dd$properties$NAME, 9)),
        names = dd$properties$NBH_NAMES)
    out$lon_ctr = mean(range(laply(dd$geometry$coordinates[[1]], 
                                   function(x) x[[1]])))
    out$lat_ctr = mean(range(laply(dd$geometry$coordinates[[1]], 
                                   function(x) x[[2]])))
    out
}

out <- ldply(1:39, function(ii) proc_one_neighborhood(dat[2][1]$features[[ii]]))
out <- out[order(out$id), ]
# ggplot(out, aes(lon_ctr, lat_ctr, label=names)) + geom_text()

write.csv(out, file='nc_names_centers.csv', row.names=FALSE)
cat(toJSON(out), file='nc_names_centers.json')
