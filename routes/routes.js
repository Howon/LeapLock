module.exports = function (app){
	app.get('/', function (req, res) {
		res.render('layout', {title : "Hello World"})
	})
}