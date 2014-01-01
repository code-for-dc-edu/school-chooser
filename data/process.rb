require 'csv'
require 'json'

output = []

data = CSV.read 'schools.csv'
headers = data.shift.map {|i| i.to_s }
schools = data.map {|row| Hash[*headers.zip(row).flatten] }

schools.each do |school|
    newSchool = {}
    newSchool["code"] = school["School Code"]
    newSchool["name"] = school["School Name"]
    newSchool["grades"] = Array.class_eval(school["Grades Offered"])
    newSchool["collegeEnrollment"] = {
        "val" => nil,
        "sd" => nil
    }
    newSchool["studentsFromMyNeighborhood"] = {}
    39.times do |nc|
        newSchool["studentsFromMyNeighborhood"][nc] = {
            "val" => school["Commute NC " + nc.to_s],
            "sd" => school["Commute NC " + nc.to_s + " Normalized Model"]
        }
    end
    newSchool["schoolCulture"] = {
        "val" => {
            "attendanceRate" => school["Attendance"],
            "suspensionRate" => school["Suspension"],
            "truancyRate" => school["Truancy"],
            "midyearWithdrawal" => school["Withdrawal"]
        },
        "sd" => school["School Culture Model"]
    }
    newSchool["racialDiversity"] = {
        "val" => {
            "asian" => school["Asian"],
            "africanAmerican" => school["Black non-Hispanic"],
            "multiracial" => school["Multiracial"],
            "hawaiianPacificIslander" => school["Pacific / Hawaiian"],
            "white" => school["White non-Hispanic"],
            "hispanic" => school["Hispanic / Latino"],
            "americanIndianAlaskaNative" => school["Native American / Alaskan"]
        },
        "sd" => school["Simpson's Normalized"]
    }
    newSchool["graduationRate"] = {
        "val" => school["Graduation Rate"],
        "sd" => school["Graduation Rate SD"],
    }
    newSchool["academicGrowth"] = {
        "val" => {
            "math" => school["MGP Math"],
            "reading" => school["MGP Reading"]
        },
        "sd" => school["Academic Growth Model"]
    }
    newSchool["instructionalStaffPerStudent"] = {
        "val" => nil,
        "sd" => nil
    }
    output.push(newSchool)
end

File.open("schools.json","w") { |f| f.write(JSON.pretty_generate(output)) }