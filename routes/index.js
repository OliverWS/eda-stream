
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.writeHead({"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers":"X-Requested-With",
	   "Access-Control-Allow-Methods":"GET, PUT, POST, DELETE"}
	);

  res.render('index', { title: 'Express' });
};