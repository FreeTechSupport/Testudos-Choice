const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);
const port = 8083;
var express = require('express');
var app = express()
let courses = [];

(async () => {
  await client.connect();
  try {
    courses = await client.query("SELECT courseId FROM courses");
    console.log(courses);
  } catch (err) {
    console.error("error executing query:", err);
  } finally {
    client.end();
  }
})();

app.use(express.static(__dirname));

app.get('/courseList', function(req, res) {
    console.log('i receive a GET request');

    res.json(courses)
  });

var server = app.listen(8083, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

});


