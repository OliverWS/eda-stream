Array.prototype.clone = function() { return this.slice(0); }

var Graph = function(opts){
	var vis,data,el,p,w,h,x,y,line,vis, size, time;
	var init = function(options) {
		el = options.el;
		p = options.pad || 50;
		w = $(el).width() - 2*p;
		h = $(el).height() - p;
		label = options.label || null;
		fill = options.fill || "none";
		stroke = options.stroke || null;
		data = {};
		size = options.size || 'auto';
		if( size == 'auto'){
			size = w;
		}
		data.points = [];
		for(var i=0; i < size; i++){data.points.push(0.0);}
		data.range = [0,100];
		updateRange();
		renderGraph();
			
	};
	
	var updateRange = function() {
		data.range = [d3.min(data.points)*0.9,d3.max(data.points)*1.1];	
	};
	
	var setSize = function(s) {
		if(s > size) {
			for(var i=size; i < s; i++){data.points.unshift(0.0);}
			size = s;
		}
		else if (s < size) {
			for(var i=size; i > s; i--){data.points.shift();}
		}
		updateRange();
		updateGraph();
	
	};
	
	var addPoint = function(dp) {
		if((dp != NaN) && (dp != undefined) && (dp != "")){
			data.points.push(dp);
		
			if(data.points.length > size){
				data.points.shift();
			}
		
			updateRange();
			updateGraph();
			console.log("Adding datapoint: " + dp);

		}
		else {
			console.log("Rejecting datapoint: " + dp);
		}
	};
	
	var updateGraph = function() {
		x = d3.scale.linear().domain([0, data.points.length]).range([0, w]);
		y = d3.scale.linear().domain(data.range).range([h, 0]);
		var points = data.points.clone();
		points.push(data.range[0]);
		points.unshift(data.range[0]);
		vis.selectAll("g.y").remove();
		var yrule = vis.selectAll("g.y")
		    .data(y.ticks(5))
		    .enter().append("svg:g")
		    .attr("class", "y");
		vis.selectAll("text.title").text(formatDate(new Date()));
		yrule.append("svg:line")
		    .attr("class", "grid")
		    .style("shape-rendering", "crispEdges")
		    .attr("x1", 0)
		    .attr("x2", w)
		    .attr("y1", y)
		    .attr("y2", y);
		yrule.append("svg:text")
		    .attr("class", "yText")
		    .attr("x", -6)
		    .attr("y", y)
		    .attr("dy", ".35em")
		    .attr("text-anchor", "end")
			.text(function(d,i) {return d.toFixed(2).toString()});
		
		vis.selectAll("path.graph-data")
			.attr("d", line(points))	
	};
	
	var renderGraph = function() {
		x = d3.scale.linear().domain([0, data.points.length]).range([0, w]);
		y = d3.scale.linear().domain(data.range).range([h, 0]);
		
		time = function(i) {
			var t = new Date(data.startTime);
			t.setTime(t.getTime() + i*data.fps*1000);
			return t.toLocaleTimeString();
		};
		
		line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  y(d); });
		
		vis = d3.select(el)
		  .append("svg")
		  	.attr("class","graph")
		    .attr("width", w + 2*p)
		    .attr("height", h + 2*p)
		    .on('mousedown',mousedown)			    
		  .append("g")
		    .attr("transform", "translate(" + 2*p + "," + p + ")");
		renderGrid();
		vis.append("path")
			.attr("d", line(data.points))
		    .attr("class", "graph-data")
		    .style("fill",fill)
		    .style("stroke",stroke)
		    .attr("id",label)
		
	};
  
	var formatDuration = function(d){
	var hours = d/3600;
	var minutes = (d % 3600)/60;
	var seconds = (d % 60);
	return (pad(hours) + ":" + pad(minutes) + ":" + pad(seconds));
};


	var mousedown = function() {

};

  	var mousemove = function(){
  		var coords = d3.svg.mouse(this)[0] - p;
    	index = Math.round(x.invert(d3.svg.mouse(this)[0] - p)),
        t  = time(index),
        mag = data.eda[index];	   
  	};	  

	var renderGrid = function() {
		var background = vis.append("svg:rect")
							.attr("class", "background")
							.style("fill","white")
							.attr("x",0)
							.attr("y",0)
							.attr("width",w)
							.attr("height",h);
	
	 //dynamicTimeTicks(vis,data,data,10);	 
	 var yrule = vis.selectAll("g.y")
	     .data(y.ticks(5))
	     .enter().append("svg:g")
	     .attr("class", "y");
	 
	 yrule.append("svg:line")
	     .attr("class", "grid")
	     .style("shape-rendering", "crispEdges")
	     .attr("x1", 0)
	     .attr("x2", w)
	     .attr("y1", y)
	     .attr("y2", y);
	 yrule.append("svg:text")
	     .attr("class", "yText")
	     .attr("x", -6)
	     .attr("y", y)
	     .attr("dy", ".35em")
	     .attr("text-anchor", "end")
	 	.text(function(d,i) {return d.toFixed(1).toString()});
	 //Now go add axis labels
	 
	 vis.append("svg:text")
	 	.attr("class", "axis-label")
	 	.attr("x", 0)
	 	.attr("y", h/2)
	 	.attr("dy", "0em")
	 	.attr("dx", "-"+2*p+"px")
	 	.attr("text-anchor", "left")
	 	.text(label);
	 /*
	 vis.append("svg:text")
	 	.attr("class", "title")
	 	.attr("x", w/2)
	 	.attr("y", 0)
	 	.attr("dy", "-"+p/4+"px")
	 	.attr("dx", 0)
	 	.attr("text-anchor", "middle")
	 	.text(title);
	 */		
};
	
	var dynamicTimeTicks = function (vis,data, event, numTicks) {
		d3.selectAll(".time-grid").remove();
		var startTime = new Date(event.startTime);
		var endTime = new Date(event.endTime);
		var duration = (endTime - startTime);
		var ticks = [];
		if((duration/1000) < 60*60){
			for(var i=0; i <= duration; i += duration/numTicks){
				ticks.push(i);
			}
		}
		else {
			ticks.push(0);
			var firstHour = new Date(event.startTime);
			firstHour.setHours(startTime.getHours()+1);
			firstHour.setMinutes(0);
			firstHour.setSeconds(0);
			if(startTime.getMinutes() > 30){
				firstHour.setHours(startTime.getHours()+2);
			}
			for(var t=firstHour; t < endTime; ){
				console.log((new Date(t)).toTimeString());
				var sign = (t > endTime) ? ">" : "<";
				console.log((t/1.0).toString() + sign + (endTime/1.0).toString());
				
				ticks.push(t-startTime);
				t.setHours(t.getHours()+1);
			}
			if((duration - ticks[ticks.length - 1])/1000 < 1800){
				ticks[ticks.length-1] = duration;
			}
			else {
				ticks.push(duration);
			}
		}
		console.log(ticks);
		for( var i=0; i < ticks.length; i++){
			var tickTime = new Date(startTime);
			var t = ticks[i];
			tickTime.setTime(tickTime.getTime() + t);
			vis.append("svg:line")
			    .attr("class", "time-grid")
			    .style("shape-rendering", "crisp-edges")
			    .attr("x1", x((t*data.fps)/1000))
			    .attr("x2", x((t*data.fps)/1000))
			    .attr("y1", 0)
			    .attr("y2", h);
			
			vis.append("svg:line")
			    .attr("class", "tick time-grid")
			    .style("shape-rendering", "crisp-edges")
			    .attr("x1", x((t*data.fps)/1000))
			    .attr("x2", x((t*data.fps)/1000))
			    .attr("y1", h)
			    .attr("y2", h+10);
			var anchor;
			if(i==0){
				anchor = "middle";
				var ts = formatDate(tickTime, true)
			} else if(i == (ticks.length - 1)){
				anchor = "middle";
				var ts = formatDate(tickTime, true)
			}
			else {
				anchor = "middle";
				var ts = formatDate(tickTime)
			}
			if(ts.indexOf("|") > -1){
				vis.append("svg:text")
					.attr("class", "time time-grid")
					.attr("x", x((t*data.fps)/1000))
					.attr("y", h)
					.attr("dy", "2em")
					.attr("dx", "0em")
					.attr("text-anchor", anchor)
					.text(ts.split("|")[0]);
				vis.append("svg:text")
					.attr("class", "time time-grid")
					.attr("x", x((t*data.fps)/1000))
					.attr("y", h)
					.attr("dy", "3em")
					.attr("dx", "0em")
					.attr("text-anchor", anchor)
					.text(ts.split("|")[1]);
				
			
			}
			else {
				vis.append("svg:text")
					.attr("class", "time time-grid")
					.attr("x", x((t*data.fps)/1000))
					.attr("y", h)
					.attr("dy", "2em")
					.attr("dx", "0em")
					.attr("text-anchor", anchor)
					.text(ts);
			}
		}
	};
	
	var pad = function(n) {
	n = Math.round(n);
	var padded = "";
	if(n < 10) {
		padded += "0";
	}
	padded += n.toString();
	return padded;
};

	var clip = function(s,len) {
	var str_len = len-3;
	if(s[str_len] != " "){
		var outs = s.slice(0, str_len);
		outs = s.slice(0,outs.lastIndexOf(" "));
	}else {
		var outs = s.slice(0, str_len);
	}
	outs += "...";
	return outs;		
}

	var formatDate = function (d,showDate) {
	var h = (d.getHours());
	if(h > 12){
		h -= 12;
		var p = "PM";
	} else {
		var p = "AM";
	}
	if(h==0){h = 12;}
	var m = d.getMinutes();
	var s = d.getSeconds();
	var time = (pad(h) + ":" + pad(m) + ":" + pad(s) + " " + p);
	if(showDate == true){
		return (time + "|" + pad(d.getMonth()+1) + "/" + pad(d.getDay()+1) + "/" +d.getFullYear());
	}
	else {
		return time;
	}
};

	var param = function( name ){
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
};	
	
	init(opts);
	return {addPoint:addPoint, setSize:setSize};
		
};