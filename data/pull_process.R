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

getValue <- function(arrayOfKeyVals, keyname, keyval, result_numeric=FALSE) {
    for (kv in arrayOfKeyVals) {
        if (kv$key[keyname] == keyval) {
            return(if (result_numeric) as.numeric(kv$val) else kv$val)
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
    ret <- list(val=c(asian=getValue(sect$data, "subgroup", "Asian", result_numeric=TRUE),
                         africanAmerican=getValue(sect$data, "subgroup", "African American", result_numeric=TRUE),
                         multiracial=getValue(sect$data, "subgroup", "Multi Racial", result_numeric=TRUE),
                         hawaiianPacificIslander=0,
                         white=getValue(sect$data, "subgroup", "White", result_numeric=TRUE),
                         hispanic=getValue(sect$data, "subgroup", "Hispanic", result_numeric=TRUE),
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

# culture is based on withdrawal, suspension, attendance, unexclused absenses
# first, get those numbers from one school
# then, separately, normalize all schools

n20 <- function(x) if (is.null(x)) 0 else x
n2na <- function(x) if (is.null(x)) NA else x

makeCultureDF <- function(prof) {
    # confirm that we have the right sections
    tru <- prof$profile$sections[[6]]
    att <- prof$profile$sections[[7]]
    sus <- prof$profile$sections[[8]]
    exp <- prof$profile$sections[[9]]
    myew <- prof$profile$sections[[10]]
    stopifnot(tru$id == 'unexcused_absences')
    stopifnot(att$id == 'attendance'); stopifnot(sus$id == 'suspensions')
    stopifnot(exp$id == 'expulsions'); stopifnot(myew$id == 'mid_year_entry_and_withdrawal')
    
    # extract and put into a DF for later processing
    #myew_val <- getValue(myew$data, "month", 5)
    ret <- data.frame(in_seat_attendance=try_default(n2na(att$data[[1]]$val$in_seat_attendance), NA),
                      state_in_seat_attendance=try_default(n2na(att$data[[1]]$val$state_in_seat_attendance), NA),
                      suspended_1=try_default(sus$data[[1]]$val$suspended_1, NA),
                      state_suspended_1=try_default(sus$data[[1]]$val$state_suspended_1, NA),
                      expulsions=try_default(exp$data[[1]]$val$expulsions, NA),
                      state_expulsions=try_default(exp$data[[1]]$val$state_expulsions, NA),
                      myew=try_default(getValue(myew$data, "month", 5)$net_cumulative, NA),
                      truancy=n20(try_default(tru$data[[1]]$val$`16-25_days`, NULL)) + 
                          n20(try_default(tru$data[[1]]$val$more_than_25_days, NULL)),
                      truancy_state=n20(try_default(tru$data[[1]]$val$`state_16-25_days`, NULL)) + 
                          n20(try_default(tru$data[[1]]$val$state_more_than_25_days, NULL))
                      )
    ret
}
makeCultureDF(pf1)

# TODO: with everyone's data, do appropriate normalization

# hammer the server to get all the report card data, then loop through to 
# build the appropriate structures

sc_fmt <- "http://learndc.org/data/overview/school_%04d_overview.JSON"
overviews <- llply(school_codes, function(sc) {
    sc_json <- jsonlite::fromJSON(sprintf(sc_fmt, sc))
    with(sc_json, list(
        code=org_code,
        name=org_name,
        grades=grades_serviced,
        address=address,
        website=website,
        profile=external_report_card,
        charter=charter
    ))
}, .progress='time')

pf_fmt <- "http://learndc.org/data/profile/school_%04d.JSON"
profiles <- llply(school_codes, function(pf) {
    pf_json <- jsonlite::fromJSON(sprintf(pf_fmt, pf), simplifyDataFrame=FALSE)
    pf_json$code <- pf
    pf_json
}, .progress='time')
 
culture_df <- ldply(profiles, function(pf) cbind(makeCultureDF(pf), code=pf$code))

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


