# script to merge the commute data with the school definitions

options(stringsAsFactors=FALSE)

library(plyr)
library(stringr)
library(rjson)

commute <- read.csv("school-cluster-mapping-2012-v2.csv")
schools <- read.csv("school-locs2-coded.csv")

commute <- mutate(commute,
                  cluster_str = cluster,
                  cluster = as.numeric(str_replace_all(cluster, "Cluster ", "")))

names(schools) <- tolower(names(schools))
schools <- subset(schools,
                  select=c(school.year, schoolname, adjusted.school.id,
                           school.type..state., charter.status,
                           school.address.location.1, prek.3, prek.4,
                           preschool, kindergarten, grade.1, grade.2,
                           grade.3, grade.4, grade.5, grade.6, grade.7,
                           grade.8, grade.9, grade.10, grade.11, grade.12,
                           lon, lat))

schools <- mutate(schools,
                  school.year = as.numeric(school.year),
                  charter.status = charter.status == 'Yes',
                  prek.3 = prek.3 == 'Y',
                  prek.4 = prek.4 == 'Y',
                  preschool = preschool == 'Y',
                  kindergarten = kindergarten == 'Y',
                  grade.1 = grade.1 == 'Y',
                  grade.2 = grade.2 == 'Y',
                  grade.3 = grade.3 == 'Y',
                  grade.4 = grade.4 == 'Y',
                  grade.5 = grade.5 == 'Y',
                  grade.6 = grade.6 == 'Y',
                  grade.7 = grade.7 == 'Y',
                  grade.8 = grade.8 == 'Y',
                  grade.9 = grade.9 == 'Y',
                  grade.10 = grade.10 == 'Y',
                  grade.11 = grade.11 == 'Y',
                  grade.12 = grade.12 == 'Y'
)

schools <- rename(schools, c('adjusted.school.id'='school_code',
                             'school.type..state.'='school_type',
                             'school.address.location.1'='school_address'))


dat <- join(commute, schools, type='left')

# one school is mis-geocoded
# 38.8628, -76.9921
dat[dat$school_code==1126, 'lon'] <- -76.9921
dat[dat$school_code==1126, 'lat'] <- 38.8628

#ggplot(dat, aes(lon, lat, color=cluster)) + geom_jitter(position=position_jitter(width=.01,height=.01))

write.csv(dat, file='commute_data_denorm.csv')

dat.json <- toJSON(dat)
cat(dat.json, file='commute_data_denorm.json')

cat(toJSON(alply(schools[,c('schoolname', 'school_code')], 1, 
                  function(rr) as.list(rr)))
    , file='schools.json')

