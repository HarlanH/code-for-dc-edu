
options(stringsAsFactors=FALSE)

library(RCurl)
library(rjson)
library(plyr)
library(stringr)

key = 'f1ff3562e49ebf0b362a35c8a9175b6f727f61da'

url_base = 'http://api.census.gov/data/2011/acs5?key='

#http://api.census.gov/data/2011/acs5?key=f1ff3562e49ebf0b362a35c8a9175b6f727f61da&get=B00001_001E,NAME&for=block+group:*&in=state:11+county:001+tract:000100

tract_query <- 'http://api.census.gov/data/2011/acs5?key=f1ff3562e49ebf0b362a35c8a9175b6f727f61da&get=B00001_001E,NAME&for=tract:*&in=state:11+county:001'

tracts <- fromJSON(file=tract_query)
tracts <- ldply(tracts)
names(tracts) <- tracts[1,]
tracts <- tracts[2:nrow(tracts),]

cols <- c('B11003_003E', 'B11003_001E')

block_groups <- ldply(tracts$tract, function(tt) {
    qq <- paste0(url_base, key, '&get=', paste(cols, collapse=','), 
                 ',NAME&for=block+group:*&in=state:11+county:001+tract:', tt)
    bg <- fromJSON(file=qq)
    bg <- ldply(bg)
    names(bg) <- bg[1,]
    bg <- bg[2:nrow(bg),]
    Sys.sleep(.5)
    bg
}, .progress='time')

write.csv(block_groups, file='block_group_data.csv')
cat(toJSON(block_groups), file='block_group_data.json')
