define([], function () {
    'use strict';
    var utils={
		fPercent: function(decimal){
			//Retuns a string representation of the
			//number to two decimal places with % sign
			return ''+(Math.round(decimal*10000)/100)+'%';
		},
		humanReadable:{
			asian: 'Asian',
			africanAmerican: 'African American',
			multiracial: 'Multiracial',
			hawaiianPacificIslander: 'Hawaiian or Pacific Islander',
			white: 'Caucasian',
			hispanic: 'Hispanic',
			americanIndianAlaskaNative: 'American Indian or Alaskan Native'
		},
		valsObjToArr: function(valsObj){
            ///Convert a val objects from schools.json
            //to a d3-friendly array
            var dataset=[];
            var datum;
            for (var key in valsObj){
                if(valsObj.hasOwnProperty(key)){
                    datum={
                        label:this.humanReadable[key] || key,
                        shortName: key,
                        value:valsObj[key]
                    };
                    dataset.push(datum);
                }
            }
            return dataset;
		}
	};
	return utils;
});