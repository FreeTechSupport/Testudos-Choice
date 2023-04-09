const { Client } = require("pg");

const port = 8084;
var express = require('express');
var bodyParser = require('body-parser')
var app = express()
let courses = [];
let profs = [];
let courseInfo = [];

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function query(query) {
    const client = new Client(process.env.DATABASE_URL);
  
    await client.connect();
  
    try {
      const res = await client.query(query);
      return res;
    } finally {
      await client.end();
    }
  }


app.use(express.static(__dirname));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    console.log('i receive a GET request');

    query("SELECT courseid FROM courses").then(courses => res.json(courses));
});

app.post('/analyzer', (req, res) => {
    const result = req.body.myCourse; 
    res.redirect('/results?value=' + result);
});

app.get('/results', (req, res) => {
    const value = req.query.value;

    query("SELECT * FROM courses WHERE courseid = " + "'" + value + "'").then(courses => 
        query("SELECT * FROM Professors WHERE courseid = " + "'" + value + "'").then(profs => res.json({profs: profs, courseinfo: courseInfo})));
    /*
    get_profs(value)
    get_courseinfo(value)
    delay(2000);
    res.json({profs: profs, courseinfo: courseInfo});
    */
    //res.sendFile(__dirname + '/test.html');
  });

var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

});


