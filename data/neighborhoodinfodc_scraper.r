library(XML)
setwd("./scrape_cluster_info/")
url_template <- "http://www.neighborhoodinfodc.org/nclusters/nbr_prof_clus%s%d.html"
url_letter <- c('', 'b','c','d','e')

final_product <- list()

for(n in 1:5){
    a <- sprintf(url_template, url_letter[n], 1:39)
    actual_urls <- sapply(a, readLines)
    catch <- list()

    for(j in actual_urls){
        start_location <- grep('<table class="Table" cellspacing="1" cellpadding="7" rules="groups" frame="box" summary="Procedure Report: Detailed and/or summarized report">', j)
        
        end_location <- grep('</table>', j[start_location:length(j)])        
        html_table <- paste(j[start_location:(end_location[1]+start_location-1)], collapse="\n")
        
        catch <- c(catch, html_table)
    }

    page_scraped <- lapply(seq_along(catch), function(x){
        y <- readHTMLTable(catch[[x]])
        y <- y[[1]][,c(1,2)]
        names(y) <- c("element", "value")
        
        rownames(y) <- y$element
        y <- cbind(cluster_id = sprintf("Cluster %d", x), y)
        return(y)
    })

    final_product[[n]] <- do.call(rbind.data.frame, page_scraped)    
    ##write.csv(page_scraped, sprintf("page%s_scraped.csv",n), row.names=FALSE)
}
            