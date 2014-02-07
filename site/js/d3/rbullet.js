function rbullet_box(metric_sd, rank, object_id, metric_name) {
	metric_name = typeof metric_name !=='undefined' ? metric_name : "Awesomeness";
	
	var margin = {top: 23, right: 0, bottom: 14, left: 0},
		w = document.getElementById(object_id).offsetWidth,
		metric_data = [{sd: metric_sd, rank: rank}],
		obj_call = "#" + object_id;

	w = w >= 270 ? w: 270;
	h = 110;
	
	// Setup background.  Yes there are easier ways to do it.  Leave me alone.
	var boxdat = [
			{ index: 0, color: '#EEEEFE'},
			{ index: 1, color: '#DDDDF0'},
			{ index: 2, color: '#CFCFDF'},
			{ index: 3, color: '#CFCFDF'},
			{ index: 4, color: '#DDDDF0'},
			{ index: 5, color: '#EEEEFE'}
		];

	var background_pane = d3.select(obj_call)
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.attr("class", "background_pane");

	var boxes = background_pane.selectAll("g")
		.data(boxdat)
		.enter()
		.append("g")
		.append("rect")
		.attr("x", function(d){
			return w/6 * d.index;
		})
		.attr("y", margin.top)
		.attr("width", w/6-1)
		.attr("height", 46)
		.attr("fill", function(d){
			return d.color;
		});
		
	
	var label_dat =
	[ {text: "BELOW AVERAGE", xcord: 0, anchor: "start"}, {text: "ABOVE AVERAGE", xcord: w, anchor: "end"}]
	
	background_pane.append("g")
		.selectAll("text")
		.data(label_dat)
		.enter()
		.append("text")
		.text(function(d){
			return d.text;
		})
		.attr("x",function(d){
			return d.xcord;
		})
		.attr("y", 84)
		.attr("font-size", "13px")
		.attr("font-family", "arial")
		.attr("text-anchor", function(d){
			return d.anchor;
		})
		.attr("font-weight", "bold")
		.attr("fill", "#DDDDF0")
		.style("letter-spacing", -1);
		
	// Display the data 
	var rbullet_pane = d3.select(obj_call)
		.append("svg")
		.attr("width", w)
		.attr("height", h)
		.attr("class", "rbullet_pane")
		.attr("id", obj_call+"_svg");
	
	rbullet_pane.append("g")
		.selectAll("text")
		.data([metric_name])
		.enter()
		.append("text")
		.text(function(d){
			return d;
		})
		.attr("x", 0)
		.attr("y", 16)
		.attr("font-size", "21px")
		.attr("font-family", "arial")
		.attr("text-anchor", "start")
		.attr("font-weight", "bold")
		.attr("fill", "#DDDDDD")
		.style("letter-spacing", 1)
		.transition().duration(1500).delay(120)
		.attr("fill", "#30ACCF");;

	var metric_bar = rbullet_pane.selectAll("rect")
		.data(metric_data)
		.enter()
		.append("rect")
		.attr("x", 3)
		.attr("y", margin.top + 16)
		.attr("width", 2)
		.attr("height", 14)
		.attr("fill", "#DDDDDD");
		
	metric_bar.data(metric_data)
		.transition().duration(1500).delay(120)
		.attr("width", function(d){
			return (d.sd + 3) * w/6;
		})
		.attr("fill", "#30ACCF");
	
	metric_bar.on('click', function(event){
		// save for later.
	});	
	
	var bullet = rbullet_pane.selectAll("circle")
		.data(metric_data)
		.enter()
		.append("circle")
		.attr("cx", 3)
		.attr("cy", margin.top + 23)
		.attr("r", 16);
		
	bullet.data(metric_data)
		.transition().duration(1500).delay(120)
		.attr("cx", function(d){
			return (d.sd + 3) * w/6;
		})
		.attr("fill", "#30ACCF");
		
	var circle_text = rbullet_pane.append("g")
		.selectAll("text")
		.data(metric_data)
		.enter()
		.append('text')
		.text(function(d){
			return d.rank;
		})
		.attr("x", 2)
		.attr("y", margin.top + 28)
		.attr("font-size", "16px")
		.attr("font-family", "arial")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle")
		.attr("fill", "#FFFFFF");
		
	circle_text.data(metric_data)
		.transition().duration(1500).delay(120)
		.attr("x", function(d){
			return (d.sd + 3) * w/6;
		});

	document.getElementById(object_id).style.height = h+"px";
	document.getElementById(object_id).style.width = w+"px";
}

