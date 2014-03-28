define({
    "root": {
        "address": "Street Address",
        "grade": "Grade",
        "PS": "Pre-K 3",
        "PK": "Pre-K 4",
        "K": "Kindergarten",
        "next": "Next",
        "forTheGeeks": "For the Geeks",
        "zoned": "Your zoned school",
        "showCompare": "Compare these schools",
        "hideCompare": "Hide comparison",
        "belowAvg": "Below Average",
        "aboveAvg": "Above Average",
        "views": {
            "basicInfo": {
                "title": "Step 1: Tell us about yourself",
                "instructions": "We will use this basic information to look up your in-boundary school(s) and to customize your results."
            },
            "ranking": {
                "title": "Step 2: What's important to you?",
                "instructions": "Drag and drop items to create your list of priorities. Tap an item's name to learn more about it. We will rank the available schools based on your choices."
            },
            "results": {
                "title": "Step 3: Explore your results",
                "instructions": "Using the priorities you selected, we've sorted all available schools that offer your grade. Tap any school to learn more about it."
            }
        },
        "items": {
            "academicGrowth": {
                "name": "Academic Growth",
                "definition": "Academic growth looks at improvement in students' math and reading test scores between years. By using growth instead of proficiency, we can begin to understand how the school is helping the students it has, rather than reward a school for simply having a high-performing population.",
                "forTheGeeks": "This measure is derived from the median growth percentile (MGP) measure. MGP is defined as the median of individual student growth percentiles (SGP), measures of a student's performance relative to that of other students with similar test score history. SGPs are calculated using quantile regression of DC CAS scores by the Office of the State Superintendent of Education (OSSE) for each student in DC. OSSE then reports MGP values for schools (and individual grades and subgroups within schools) as both a year-to-year and two-year combined median, the latter offering somewhat greater stability. Our model uses the most recent two-year MGP in both math and reading if available, using the year-to-year value otherwise, and taking a weighted average of the standard scores of each."
            },
            "collegeEnrollment": {
                "name": "College Enrollment",
                "definition": "College Enrollment looks at the percentage of graduates from the school who enroll in a 2- or 4- year college. This measure can point to a school with a strong college-going culture, although there are many potential paths to success following high school graduation.",
                "forTheGeeks": ""
            },
            "graduationRate": {
                "name": "Graduation Rate",
                "definition": "Graduation Rate is the percentage of students who graduate from the school within four years of entering ninth grade. Graduation requirements are set by the state and are consistent between schools.",
                "forTheGeeks": "The Office of the State Superintendent of Education (OSSE) measures graduation rates according to uniform methodology set by the US Department of Education. The total number of graduates is divided by the ninth grade cohort, equal to the number of students who began ninth grade at the school four years prior, subtracting the number of students who transfered to another school (or emigrated or died) and adding the number of students who transfered into the school. A five-year graduation rate is also available; however, our model uses only the four-year values. Values are normalized by finding the standard score, or the difference in standard deviations versus the mean."
            },
            "instructionalStaffPerStudent": {
                "name": "Instructional Staff per Student",
                "definition": "",
                "forTheGeeks": ""
            },
            "racialDiversity": {
                "name": "Racial Diversity",
                "definition": "Racial Diversity measures the chance that two students at the school, selected at random, would be of different races. Some families value a diverse learning environment, with students from many backgrounds and cultures, and this measure can help identify schools where this is the case.",
                "forTheGeeks": "Our model calculates racial diversity with a replacement Simpson index, using enrollment figures provided by the Office of the State Superintendent of Education (OSSE). Racial subgroup populations of less than ten students are censored from the public dataset, and are thus not factored into this calculation. The resulting indexes are normalized by finding the standard score, or the difference in standard deviations versus the mean."
            },
            "schoolClimate": {
                "name": "School Climate",
                "definition": "School Climate combines a number of measures that attempt to describe the school's ability to retain students and keep them engaged. These measures are 1. the attendance rate, 2. the truancy rate (the percentage of chronically absent students), 3. the suspension rate, and 4. the percentage of students who leave the school mid-year.",
                "forTheGeeks": "The specific measures used are in-seat attendance (excluding all absences both excused and unexcused), the percentage of students with ten or more days of unexcused absences, the percentage of students suspended for at least one full day, and the cumulative mid-year withdrawal rate (measured in May). These values are normalized by finding the standard score versus a comparison value provided by the 2013 DC Equity Report intended to control for differences in the grade ranges."
            },
            "studentsFromMyNeighborhood": {
                "name": "Students from My Neighborhood",
                "definition": "Even if a school is not itself located near your house, some families will prefer to select a school attended by other children from their neighborhood. Students from My Neighborhood uses your address to determine whether there are other students attending this school from your neighborhood and those near it.",
                "forTheGeeks": "The Office of the State Superintendent of Education (OSSE) reports enrollment figures by neighborhood cluster, using the 39 cluster dataset available from the Office of the Chief Technology Officer (OCTO). Populations of less than ten students are censored from the public dataset. These counts are scored as follows: -1 for a school with no enrollment from the local cluster; 0 for a school with a non-reportable number of students from the local cluster, or between one and nine students; 1 for a schools with a reportable number of students from the local cluster, or ten or more students."
            }
        },
    }
});