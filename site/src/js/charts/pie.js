define(
    ['lodash',
     'd3'
    ], function (_, d3) {
    'use strict';
    //Adapted from Mike Bostock's pie example in the d3 documentation
	var pie=function(selection, dataset,options){
		/*appends a pie based on dataset to d3 selection
		expects each datum to have following properties: value, shortName, label
		value: percentage of the whole
		shortName: used for CSS class to apply to arcs
		label: used for text labels for pie slices that are large enough
		*/
		options=options || {};
		var defaults={
			w:300,
			h:300,
			//Fallback for colors. Use CSS instead.
			//See class attribute of arcs below.
			color: d3.scale.category10(),
			innerRadius: 0
		};
		options=_.defaults(options,defaults);
		options.outerRadius=options.w/2;
		
		var arc = d3.svg.arc()
						.innerRadius(options.innerRadius)
						.outerRadius(options.outerRadius);

		var pieLayout = d3.layout.pie().value(function(datum){return datum.value;});

		//Create SVG element
		var svg = selection.append('svg')
					.attr('width', options.w)
					.attr('height', options.h);

		//Set up groups
		var arcs = svg.selectAll('g.arc')
			.data(pieLayout(dataset))
			.enter()
			.append('g')
			.attr('class', 'arc')
			.attr('transform', 'translate(' + options.outerRadius + ',' + options.outerRadius + ')');
		//Labels for alt text and screen readers
		arcs.append('title').text(function(d){
				var title=d.data.label;
				title+=':\n'+d.data.value+'%';
				return title;
			});

		//Draw arc paths
		arcs.append('path')
			.attr('fill', function(d, i) {
				return options.color(i);
			})
			.attr('d', arc)
			.attr('class',function(d){ return d.data.shortName? 'vis'+d.data.shortName : '';});

		//Labels
		arcs.append('text')
			.attr('transform', function(d) {
				return 'translate(' + arc.centroid(d) + ')';
			})
			.attr('text-anchor', 'middle')
			.text(function(d) {
			var text='';
			if(d.value>0.06){
				text=d.data.label || '';
			}
			return text;
		}).attr('class','pie-text');
	};
	return pie;
});