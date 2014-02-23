## Convert school_profile assessment & enrollment section


## copied from pull_process.R

#!/usr/bin/env Rscript

# pulls data from LearnDC, PCSB, and Google Docs, merges it, and writes to a JSON 
setwd("C:/codedev/school-chooser/data")
options(stringsAsFactors=FALSE)

library(jsonlite)
library(httr)
library(plyr)
library(stringr)
library(reshape2)
library(RCurl)

school_codes <- read.table("school_codes.txt")[[1]]

## Operator Functions ##
`%notin%` <- function(x,y) !(x %in% y) 
`%+%` <- function(x,y) paste(x,y,sep="")



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
	## map sections by name -- tts
    tru <- prof$all_data$unexcused_absences
    myew <- prof$all_data['mid_year_entry_and_withdrawal']

    att <- ifelse(length(prof$all_data$attendance$data)==0, NA, prof$all_data$attendance$data[[1]]$val$in_seat_attendance)    
    sus <- ifelse(length(prof$all_data$suspensions$data)==0, NA, prof$all_data$suspensions$data[[1]]$val$suspended_1)
    tru <- ifelse(length(prof$all_data$unexcused_absences$data)==0, NA, (try_default(prof$all_data$unexcused_absences$data[[1]]$val$`16-25_days`, NULL) + try_default(prof$all_data$unexcused_absences$data[[1]]$val$more_than_25_days, NULL))/100)
    
    # extract and put into a DF for later processing
    withdrawals <- try_default(sum(laply(prof$all_data$mid_year_entry_and_withdrawal$data, function(dd) ifelse(!is.null(dd$val$withdrawal), dd$val$withdrawal, 0))), 0)
    # there's a bunch of crap here to deal with failure modes...
    scode <- ifelse(!is.null(prof$code), prof$code, 0)
    
    ret <- data.frame(school_code = scode,
                      attendanceRate=att,
                      suspensionRate=sus,
                      midyearWithdrawal=withdrawals,
                      truancyRate=tru
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
})
names(overviews) <- as.character(school_codes)

pf_fmt <- "http://www.learndc.org/data/profile/school_%04d.JSON"

profiles <- llply(school_codes, function(pf) {
    try_url <- sprintf(pf_fmt, pf)
    if(url.exists(try_url)){
        pf_json <- jsonlite::fromJSON(try_url, simplifyDataFrame=FALSE, encoding='UTF-8')
        pf_json$code <- pf
        pf_json$all_data <- c(pf_json$report_card$sections, pf_json$profile$sections)
        pf_json$report_card <- NULL
        pf_json$profile <- NULL
        names(pf_json$all_data) <- unlist(lapply(pf_json$all_data, function(x){x$id}))
        pf_json
    }
})
profiles <- Filter(function(x) length(x)>0, profiles)

assessment_data <- lapply(profiles, function(x){
    assm_chunk <- lapply(x$all_data$dccas$data, function(y){
        data.frame(subject=y$key$subject,
            grade=y$key$grade,
            enrollment_status=y$key$enrollment_status,
            subgroup = y$key$subgroup,
            year=y$key$year,
            n_eligible=y$val$n_eligible,
            n_test_takers=y$val$n_test_takers,
            advanced_or_proficient=y$val$advanced_or_proficient,
            below_basic=y$val$below_basic,
            basic=y$val$basic,
            proficient=y$val$proficient,
            advanced=y$val$advanced)    
    })
    return(do.call(rbind.data.frame, assm_chunk))
})



## Write to Output
mainDir <- getwd()
subDir <- 'output'

dir.create(file.path(mainDir, subDir), showWarnings = FALSE)
setwd(file.path(mainDir, subDir))

GetSchoolNames <- function(x){
    sprintf("%04d %s", profiles[[x]]$code, profiles[[x]]$org_name)
}

for(i in 1:length(assessment_data)){  
    filename <- "dccas " %+% GetSchoolNames(i) %+% ".csv"
    if(nrow(assessment_data[[i]]) > 0){
        output <- data.frame(school_code=profiles[[i]]$code, school_name=profiles[[i]]$org_name, assessment_data[[i]])
        write.csv(output, filename, row.names=FALSE)
    }    
}

## One Table

one_table <- data.frame()

for(i in 1:length(assessment_data)){  
    if(nrow(assessment_data[[i]]) > 0){
        one_table <- rbind(one_table, data.frame(school_code=profiles[[i]]$code, school_name=profiles[[i]]$org_name, assessment_data[[i]]))        
    }
}

one_assm_chunk <- do.call(rbind.data.frame, one_table)


### Get Enrollment Data


enrollment_data <- lapply(profiles, function(x){
    assm_chunk <- lapply(x$all_data$enrollment$data, function(y){
        data.frame(year=y$key$year,
            subgroup = y$key$subgroup,
            grade=y$key$grade,
            student_count=y$val)    
    })
    return(do.call(rbind.data.frame, assm_chunk))
})


for(i in 1:length(enrollment_data)){  
    filename <- gsub("/", "-","enrollment " %+% GetSchoolNames(i) %+% ".csv")
    
    if(nrow(enrollment_data[[i]]) > 0){
        output <- data.frame(school_code=profiles[[i]]$code, school_name=profiles[[i]]$org_name, enrollment_data[[i]])
        write.csv(output, filename, row.names=FALSE)
    }    
}


one_table <- data.frame()

for(i in 1:length(enrollment_data)){  
    if(nrow(enrollment_data[[i]]) > 0){
        one_table <- rbind(one_table, data.frame(school_code=profiles[[i]]$code, school_name=profiles[[i]]$org_name, enrollment_data[[i]]))        
    }
}

one_enr_chunk <- do.call(rbind.data.frame, one_table)
