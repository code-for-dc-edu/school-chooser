#!/usr/bin/env Rscript

# pulls data from LearnDC, PCSB, and Google Docs, merges it, and writes to a JSON 

options(stringsAsFactors=FALSE)

library(jsonlite)
library(httr)
library(plyr)
library(stringr)

school_codes <- read.table("school_codes.txt")[[1]]

# get data from LearnDC

ov1 <- fromJSON("http://learndc.org/data/overview/school_1117_overview.JSON")
pf1 <- fromJSON("http://learndc.org/data/profile/school_1117.JSON", simplifyDataFrame=FALSE)

ret <- with(ov1, list(
    code=org_code,
    name=org_name,
    grades=grades_serviced,
    address=address,
    website=website,
    profile=external_report_card,
    charter=charter
    ))

lapply(pf1$profile$sections, function(x) x$id)
ret <- with(pf1, append(ret, list(
    )))

pcsb_equity_url <- 'http://data.dcpcsb.org/resource/sxfs-2j93.json'
pcsb_equity_json <- content(GET(pcsb_equity_url))
# iterate through that list, pulling lat/lon from the address, then removing
# that structure
pcsb_equity_json <- llply(pcsb_equity_json, function(sch) {
    sch$longitude <- sch$address$longitude
    sch$latitude <- sch$address$latitude
    sch$street <- fromJSON(sch$address$human_address)$address
    sch$address <- NULL
    sch
})
equity <- ldply(pcsb_equity_json, function(x) as.data.frame(x))


