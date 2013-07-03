var LastFM = function(opts){
	var user = opts.user || "oliver_ws";
	var key = opts.apikey || "5285674721e01f221e2284a4fce0649b";
	var template_url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=<user>&api_key=<api_key>&limit=1&format=json";
	var url = template_url.replace("<user>", user).replace("<api_key>",key);
	var id = user + "-" + "lastfm";
	var interval = opts.interval || 10;
	var timer;
	var element;
	var init = function(el) {
		var parent = $(el);
		var element = $("<span>").attr("id",id)
		element.append($("<img>"));
		element.append($("<h4>"));
		parent.append(element);
		update();
		start();
	};
	
	var start = function() {
		timer = setInterval(this.update, opts.interval*1000);
	};
	
	var end = function() { clearInterval(timer);}
	
	var update = function() {
		$.getJSON(url,function(res) {
			var me = $("#"+id);
			if(!res.hasOwnProperty("error")){
				console.log(res);
				var track = res.recenttracks.track;
				var artist = track.artist["#text"];
				var name = track.name;
				var img = track.image[1]["#text"];
				$(me).find("img").attr("src",img);
				$(me).find("h4").html(name + "<br />" + artist);
			}		
		});
	
	}


	init(opts.el);
	return {start:start, end:end, update:update};
};