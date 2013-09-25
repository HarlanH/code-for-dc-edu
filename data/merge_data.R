# script to merge the commute data with the school definitions

options(stringsAsFactors=FALSE)

library(plyr)
library(stringr)
library(rjson)

commute <- read.csv("school-cluster-mapping-2012-v2.csv")
schools <- read.csv("school-locs4-coded.csv")

commute <- mutate(commute,
                  cluster_str = cluster,
                  cluster = as.numeric(str_replace_all(cluster, "Cluster ", "")))

names(schools) <- tolower(names(schools))
schools <- subset(schools,
                  select=c(school_year, school_name, school_code,
                           web_site,
                           school_type_state, charter_status,
                           school_address_location_1, prek_3, prek_4,
                           preschool, kindergarten, grade_1, grade_2,
                           grade_3, grade_4, grade_5, grade_6, grade_7,
                           grade_8, grade_9, grade_10, grade_11, grade_12,
                           mar_latitude, mar_longitude, mar_ward, mar_census_tract))

schools <- mutate(schools,
                  school_year = as.numeric(school_year),
                  charter_status = charter_status == 'Yes',
                  prek_3 = prek_3 == 'Y',
                  prek_4 = prek_4 == 'Y',
                  preschool = preschool == 'Y',
                  kindergarten = kindergarten == 'Y',
                  grade_1 = grade_1 == 'Y',
                  grade_2 = grade_2 == 'Y',
                  grade_3 = grade_3 == 'Y',
                  grade_4 = grade_4 == 'Y',
                  grade_5 = grade_5 == 'Y',
                  grade_6 = grade_6 == 'Y',
                  grade_7 = grade_7 == 'Y',
                  grade_8 = grade_8 == 'Y',
                  grade_9 = grade_9 == 'Y',
                  grade_10 = grade_10 == 'Y',
                  grade_11 = grade_11 == 'Y',
                  grade_12 = grade_12 == 'Y',
                  mar_ward = as.numeric(str_sub(mar_ward, 6))
)

schools <- rename(schools, c('school_type_state'='school_type',
                             'school_address_location_1'='school_address',
                             'mar_latitude'='latitude',
                             'mar_longitude'='longitude',
                             'mar_census_tract'='census_tract',
                             'mar_ward'='ward'))


dat <- join(commute, schools, type='left', by='school_code')

# # one school is mis-geocoded
# # 38.8628, -76.9921
# dat[dat$school_code==1126, 'lon'] <- -76.9921
# dat[dat$school_code==1126, 'lat'] <- 38.8628

#ggplot(dat, aes(lon, lat, color=cluster)) + geom_jitter(position=position_jitter(width=.01,height=.01))

write.csv(dat, file='commute_data_denorm.csv')

dat.json <- toJSON(dat)
cat(dat.json, file='commute_data_denorm.json')

# make nice verstion of the schools list to be loaded
schools <- mutate(schools,
                  elementary = prek_3 | prek_4 | kindergarten | grade_1 | grade_2 | grade_3 | grade_4 | grade_5,
                  middle = grade_6 | grade_7 | grade_8,
                  high = grade_9 | grade_10 | grade_11 | grade_12)

schools_nice <- subset(schools, select=c('school_name', 'school_code',
                                         'web_site', 'school_type',
                                         'charter_status', 'school_address',
                                         'ward', 'census_tract',
                                         'elementary', 'middle', 'high'))
schools_nice <- schools_nice[order(schools_nice$school_name), ]
cat(toJSON(alply(schools_nice, 1, 
                 function(rr) as.list(rr)))
    , file='schools.json')
