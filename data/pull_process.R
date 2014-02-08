#!/usr/bin/env Rscript

# pulls data from LearnDC, PCSB, and Google Docs, merges it, and writes to a JSON 

options(stringsAsFactors=FALSE)

library(jsonlite)
library(httr)
library(plyr)
library(stringr)
library(reshape2)

school_codes <- read.table("school_codes.txt")[[1]]

#####################################################################

# helper functions...
n20 <- function(x) if (is.null(x)) 0 else x
n2na <- function(x) if (is.null(x)) NA else x
zscore <- function(x) (x-mean(x, na.rm=TRUE))/sd(x, na.rm=TRUE)

# getValue
# helper for pulling stuff out of list structures
getValue <- function(arrayOfKeyVals, keyname, keyval, result_numeric=FALSE) {
    for (kv in arrayOfKeyVals) {
        if (kv$key[keyname] == keyval) {
            return(if (result_numeric) as.numeric(kv$val) else kv$val)
        }
    }
    return(NA)
}

# culture is based on attendance, suspension, truancy, and withdrawal
# first, get those numbers from one school
# then, separately, normalize all schools

# makeCultureDF
# given a single school's profile, extract culture info into a data.frame
makeCultureDF <- function(prof) {
    # confirm that we have the right sections
    tru <- prof$profile$sections[[6]]
    att <- prof$profile$sections[[7]]
    sus <- prof$profile$sections[[8]]
    myew <- prof$profile$sections[[10]]
    stopifnot(tru$id == 'unexcused_absences')
    stopifnot(att$id == 'attendance'); 
    stopifnot(sus$id == 'suspensions')
    stopifnot(myew$id == 'mid_year_entry_and_withdrawal')
    
    # extract and put into a DF for later processing
    withdrawals <- try_default(sum(laply(myew$data, function(dd) dd$val$withdrawal)), 0)
    # there's a bunch of crap here to deal with failure modes...
    ret <- data.frame(attendanceRate=1-try_default(n2na(att$data[[1]]$val$in_seat_attendance), NA),
                      state_attendanceRate=1-try_default(n2na(att$data[[1]]$val$state_in_seat_attendance), NA),
                      suspensionRate=try_default(sus$data[[1]]$val$suspended_1, NA),
                      state_suspensionRate=try_default(sus$data[[1]]$val$state_suspended_1, NA),
                      midyearWithdrawal=withdrawals,
                      truancyRate=(n20(try_default(tru$data[[1]]$val$`16-25_days`, NULL)) + 
                          n20(try_default(tru$data[[1]]$val$more_than_25_days, NULL)))/100,
                      state_truancyRate=(n20(try_default(tru$data[[1]]$val$`state_16-25_days`, NULL)) + 
                          n20(try_default(tru$data[[1]]$val$state_more_than_25_days, NULL)))/100
                      )
    ret
}

##########################################################################
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
names(overviews) <- as.character(school_codes)

pf_fmt <- "http://learndc.org/data/profile/school_%04d.JSON"
profiles <- llply(school_codes, function(pf) {
    pf_json <- jsonlite::fromJSON(sprintf(pf_fmt, pf), simplifyDataFrame=FALSE)
    pf_json$code <- pf
    pf_json
}, .progress='time')
 
###################################################################
# OK, now we've got the data, so process it into culture blocks

culture_df <- ldply(profiles, function(pf) cbind(makeCultureDF(pf), code=pf$code))
culture_df <- mutate(culture_df,
                     mean_zscore=(zscore(attendanceRate) + zscore(suspensionRate) +
                                  zscore(midyearWithdrawal) + zscore(truancyRate))/4)
# we'll turn this into a JSON structure later on...
buildCultureStruct <- function(df, code) {
    with(df[df$code==code,], 
         list(schoolCulture=list(val=list(attendanceRate=attendanceRate,
                                          suspensionRate=suspensionRate,
                                          truancyRate=truancyRate,
                                          midyearWithdrawal=midyearWithdrawal),
                                 zscore=mean_zscore)))
}

###################################################################
# extract graduation rates

# foreach school, pull the graduation section from the report card 
# and put into a DF
makeGraduationDF <- function(profiles) {
    ldply(profiles, function(pf) {
        sections <- pf$report_card$sections
        grad_rate <- try_default({
                sect <- which(laply(sections, function(x) x$id == 'graduation'))
                with(sections[[sect]]$data[[1]]$val, graduates/cohort_size)
            }, NA, quiet=TRUE)
        data.frame(school_code=pf$code, grad_rate=grad_rate)
    })
}
grad_df <- makeGraduationDF(profiles)
grad_df$grad_zscore <- zscore(grad_df$grad_rate)
buildGradStruct <- function(df, sc) {
    with(df[df$school_code==sc,], 
         list(graduationRate=list(val=grad_rate,
                                   zscore=grad_zscore)))
}

###################################################################
# extract academic growth scores

# foreach school, pull the academic growth section from the report card 
# and put into a DF
makeAcademicGrowthDF <- function(profiles) {
    ldply(profiles, function(pf) {
        sections <- pf$report_card$sections
        read_score <- try_default(sections[[1]]$data[[1]]$subgroups[[1]]$read_score,
                                 NA, quiet=TRUE)
        math_score <- try_default(sections[[1]]$data[[1]]$subgroups[[1]]$math_score,
                                  NA, quiet=TRUE)
        data.frame(school_code=pf$code, read_score=read_score, math_score=math_score)
    })
}
growth_df <- makeAcademicGrowthDF(profiles)
growth_df$growth_zscore <- (zscore(growth_df$read_score) + zscore(growth_df$math_score))/2
buildGrowthStruct <- function(df, sc) {
    with(df[df$school_code==sc,], 
         list(academicGrowth=list(val=list(math=math_score, reading=read_score),
                                  zscore=growth_zscore)))
}

###################################################################
# Get the PCSB Equity data set

pcsb_equity_url <- 'http://data.dcpcsb.org/resource/sxfs-2j93.json'
pcsb_equity_json <- content(GET(pcsb_equity_url))

# iremove the non-flat part of the structure, then convert to a DF
pcsb_equity_json <- llply(pcsb_equity_json, function(sch) {
    sch$address <- NULL
    sch
})
equity <- ldply(pcsb_equity_json, function(x) as.data.frame(x))

# computing diversity from the equity DF
race_cols <- c('hispanic_latino', 'black_non_hispanic', 'asian', 
               'multiracial', 'white_non_hispanic', 
               'native_american_alaskan', 'pacific_hawaiian')
equity_race <- equity[,race_cols]
equity_race <- colwise(function(x) as.numeric(x)/100)(equity_race)
equity_race$simpson_di <- 1/rowSums(as.matrix(equity_race)^2) * ncol(equity_race)
equity_race$simpson_di_rank <- myRank(equity_race$simpson_di)
equity_race$simpson_di_z <- zscore(equity_race$simpson_di)
equity_race$code <- equity$school_code
# we'll convert this to JSON later too...
buildDiversityStruct <- function(df, sc) {
    with(df[df$code==sc,], 
         list(racialDiversity=list(val=list(asian=asian,
                                            africanAmerican=black_non_hispanic,
                                            multiracial=multiracial,
                                            hawaiianPacificIslander=pacific_hawaiian,
                                            white=white_non_hispanic,
                                            hispanic=hispanic_latino,
                                            americanIndianAlaskaNative=native_american_alaskan),
                                 zscore=simpson_di_z)))
}

###################################################################
# pull commute data
commute_url <- "http://ec2-54-235-58-226.compute-1.amazonaws.com/storage/f/2013-06-01T15%3A23%3A20.103Z/commute-data-denorm.json"
commute_df <- as.data.frame(jsonlite::fromJSON(commute_url))

# turn into the appropriate data structure
buildCommuteStruct <- function(df, code) {
    ret <- dlply(subset(df, school_code==code), 'cluster', function(rr) {
        list(val=rr$count)
    })
    attr(ret, 'split_labels') <- NULL
    ret
}

###################################################################
# now, put it all together

makeOneSchoolStruct <- function(school_code) {
    c(overviews[[as.character(school_code)]],
      list(studentsFromMyNeighborhood=buildCommuteStruct(commute_df, school_code)),
      buildCultureStruct(culture_df, school_code),
      buildDiversityStruct(equity_race, school_code),
      buildGradStruct(grad_df, school_code),
      buildGrowthStruct(growth_df, school_code))
}
# cat(toJSON(makeOneSchoolStruct(313)))
# cat(toJSON(makeOneSchoolStruct(101)))
# cat(toJSON(makeOneSchoolStruct(402)))

cat(toJSON(llply(school_codes, function(sc) makeOneSchoolStruct(sc))))

