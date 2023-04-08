
const port = 8080
var express = require('express')
var app = express()

app.use(express.static(__dirname));

var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

})


