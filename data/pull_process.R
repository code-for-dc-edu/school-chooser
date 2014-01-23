#!/usr/bin/env Rscript

# pulls data from LearnDC, PCSB, and Google Docs, merges it, and writes to a JSON 

options(stringsAsFactors=FALSE)

library(jsonlite)
library(httr)
library(plyr)
library(stringr)

school_codes <- read.table("school_codes.txt")[[1]]

# get data from LearnDC

ov1 <- jsonlite::fromJSON("http://learndc.org/data/overview/school_0405_overview.JSON")
pf1 <- jsonlite::fromJSON("http://learndc.org/data/profile/school_0405.JSON", simplifyDataFrame=FALSE)

############################################
# convert the overview to a simple structure

ret <- with(ov1, list(
    code=org_code,
    name=org_name,
    grades=grades_serviced,
    address=address,
    website=website,
    profile=external_report_card,
    charter=charter
    ))

######################################################
# Convert the profile data to a racial diversity block
# and a culture block


lapply(pf1$profile$sections, function(x) x$id)

getValue <- function(arrayOfKeyVals, keyname, keyval) {
    for (kv in arrayOfKeyVals) {
        if (kv$key[keyname] == keyval) {
            return(as.numeric(kv$val))
        }
    }
    return(NA)
}
makeDiversityBlock <- function(prof) {
    # confirm that section 2 is the enrollment
    sect <- prof$profile$sections[[2]]
    stopifnot(sect$id == 'enrollment')
    
    # the keys that we care about are:
    # grade=='All', year=='2012', and subgroup==?
    ret <- list(val=c(asian=getValue(sect$data, "subgroup", "Asian"),
                         africanAmerican=getValue(sect$data, "subgroup", "African American"),
                         multiracial=getValue(sect$data, "subgroup", "Multi Racial"),
                         hawaiianPacificIslander=0,
                         white=getValue(sect$data, "subgroup", "White"),
                         hispanic=getValue(sect$data, "subgroup", "Hispanic"),
                         americanIndianAlaskaNative=0),
                sd=0)
    procDiversityBlock(ret)
}
procDiversityBlock <- function(ll) {
    # proportion
    ll$val <- ll$val / sum(ll$val)
    # equitability: http://www.tiem.utk.edu/~gross/bioed/bealsmodules/simpsonDI.html
    ll$sd <- 1/(sum(ll$val^2) * length(ll$val))
    ll
}
makeDiversityBlock(pf1)

makeCultureBlock <- function(prof) {
    # confirm that section 2 is the enrollment
    sect <- prof$profile$sections[[2]]
    stopifnot(sect$id == 'enrollment')
    
    # the keys that we care about are:
    # grade=='All', year=='2012', and subgroup==?
    ret <- list(val=c(asian=getValue(sect$data, "subgroup", "Asian"),
                      africanAmerican=getValue(sect$data, "subgroup", "African American"),
                      multiracial=getValue(sect$data, "subgroup", "Multi Racial"),
                      hawaiianPacificIslander=0,
                      white=getValue(sect$data, "subgroup", "White"),
                      hispanic=getValue(sect$data, "subgroup", "Hispanic"),
                      americanIndianAlaskaNative=0),
                sd=0)
    procDiversityBlock(ret)
}
makeCultureBlock(pf1)


##############################
# Get the PCSB Equity data set

pcsb_equity_url <- 'http://data.dcpcsb.org/resource/sxfs-2j93.json'
pcsb_equity_json <- content(GET(pcsb_equity_url))

# iremove the non-flat part of the structure, then convert to a DF
pcsb_equity_json <- llply(pcsb_equity_json, function(sch) {
    sch$address <- NULL
    sch
})
equity <- ldply(pcsb_equity_json, function(x) as.data.frame(x))


