options(stringsAsFactors=FALSE)

library(plyr)
library(stringr)
library(reshape2)
library(ggplot2)
library(scales)
library(ggmap)

ncs <- read.csv('nc_names_centers.csv')
commutes <- read.csv('commute_data_denorm.csv')

# put NC info into commute table

dat <- merge(commutes, ncs, by.x='cluster', by.y='id', all.x=TRUE)

# do some cleanup
dat <- subset(dat, !is.na(grade_12) & !is.na(school_type))
capwords <- function(s, strict = FALSE) {
    cap <- function(s) paste(toupper(substring(s, 1, 1)),
{s <- substring(s, 2); if(strict) tolower(s) else s},
                             sep = "", collapse = " " )
    sapply(strsplit(s, split = " "), cap, USE.NAMES = !is.null(names(s)))
}
dat$school_type <- capwords(dat$school_type)
dat$school_type[dat$school_type=='Magnet School/Vocational Shared Time'] <- 'Magnet School'
dat$count[dat$count==-1] <- 4 # rough estimate of 1-9

dat <- ddply(dat, .(school_code), mutate, school_count=sum(count))
dat$level <- factor(with(dat, ifelse(grade_12,'High',ifelse(grade_7,'Middle','Elem'))),
                    levels=c('Elem','Middle','High'), ordered=TRUE)
dat$charter <- ifelse(dat$charter_status, 'Charter', 'Public')

plot.1 <- ggplot(dat, aes(x=lon_ctr,y=lat_ctr,xend=longitude,yend=latitude,size=count)) + 
    geom_segment(alpha=.1) +
    geom_point(aes(x=longitude,y=latitude,size=school_count,color=charter_status)) +
    facet_wrap(~school_type)

plot.2 <- ggplot(dat, 
       aes(x=lon_ctr,y=lat_ctr,xend=longitude,yend=latitude,size=count,alpha=count)) + 
    geom_segment() +
    geom_segment(data=subset(dat, count>50), color='blue') +
    geom_point(aes(x=longitude,y=latitude,size=school_count), color='#00B81C') +
    scale_size(range=c(1,7)) +
    facet_grid(charter ~ level) +
    xlab('') + ylab('') +
    theme(legend.position='none', axis.text=element_text(size=0), text=element_text(size=20))

ggsave('static_analysis_2.pdf', plot.2, width=10, height=7)

plot.3 <- ggplot(dat, 
       aes(x=lon_ctr,y=lat_ctr,xend=longitude,yend=latitude,size=count,alpha=count)) + 
    geom_segment() +
    geom_segment(data=subset(dat, count>50), color='blue') +
    geom_point(aes(x=longitude,y=latitude,size=school_count), color='#00B81C') +
    scale_size(range=c(1,7)) +
    facet_wrap( ~ ward) +
    xlab('') + ylab('') +
    theme_bw() +
    theme(legend.position='none', axis.text=element_text(size=0), text=element_text(size=20))

ggsave('static_analysis_3.png', plot.3, width=7, height=7)

# do a version of plot.3, but one ward per separate image, and a map behind
dc_map <- get_map(location=c(-77.016667, 38.905111), zoom=12, #maptype='toner',
        source='osm', color='bw')

for (x in 1:8) {
    dat_ward <- subset(dat, ward==x)
    p <- ggmap(dc_map, extent='device') +
        geom_segment(data=dat_ward,
                     color='blue',
                     mapping=aes(x=lon_ctr,y=lat_ctr,xend=longitude,yend=latitude,size=count,alpha=count)) +
        geom_segment(data=subset(dat_ward, count>50), 
                     color='red',
                     mapping=aes(x=lon_ctr,y=lat_ctr,xend=longitude,yend=latitude,size=count,alpha=count)) +
        geom_point(data=dat_ward,
                   aes(x=longitude,y=latitude,size=school_count), color='gold') +
        scale_size(range=c(1,7)) +
        xlab('') + ylab('') +
        theme_bw() +
        theme(legend.position='none', axis.text=element_text(size=0),
              axis.ticks=element_line(size=0))
    ggsave(sprintf('anim_map_ward_%d.png', x), p, width=7, height=7,dpi=100)
}

