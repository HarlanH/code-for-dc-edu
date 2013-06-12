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
dat <- subset(dat, !is.na(grade.12) & !is.na(school_type))
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
dat$level <- factor(with(dat, ifelse(grade.12,'High',ifelse(grade.7,'Middle','Elem'))),
                    levels=c('Elem','Middle','High'), ordered=TRUE)
dat$charter <- ifelse(dat$charter.status, 'Charter', 'Public')

plot.1 <- ggplot(dat, aes(x=lon_ctr,y=lat_ctr,xend=lon,yend=lat,size=count)) + 
    geom_segment(alpha=.1) +
    geom_point(aes(x=lon,y=lat,size=school_count,color=charter.status)) +
    facet_wrap(~school_type)

plot.2 <- ggplot(dat, 
       aes(x=lon_ctr,y=lat_ctr,xend=lon,yend=lat,size=count,alpha=count)) + 
    geom_segment() +
    geom_segment(data=subset(dat, count>50), color='blue') +
    geom_point(aes(x=lon,y=lat,size=school_count), color='#00B81C') +
    scale_size(range=c(1,7)) +
    facet_grid(charter ~ level) +
    xlab('') + ylab('') +
    theme(legend.position='none', axis.text=element_text(size=0), text=element_text(size=20))

ggsave('static_analysis_2.pdf', plot.2, width=10, height=7)


