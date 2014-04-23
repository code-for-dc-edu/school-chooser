define([], function () {
    'use strict';
    var utils={
		fPercent: function(decimal){
			//Retuns a string representation of the
			//number to two decimal places with % sign
			return ''+(Math.round(decimal*10000)/100)+'%';
		}
	};
	return utils;
});