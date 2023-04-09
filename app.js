const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);
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

async function perform_query(query) {
    await client.connect();
    try {
        courses = await client.query(query);
        //console.log(courses);
    } catch (err) {
        console.error("error executing query:", err);
    } finally {
        //client.end();
    }
};

async function get_profs(courseName) {
    //await client.connect();
    try {
        courseInfo = await client.query("SELECT * FROM Professors WHERE courseid = " + "'" + courseName + "'");
        console.log(courseInfo);
    } catch (err) {
        console.error("error executing query:", err);
    } finally {
        //client.end();
    }
};

async function get_courseinfo(courseName) {
    //await client.connect();
    try {
        profs = await client.query("SELECT * FROM courses WHERE courseid = " + "'" + courseName + "'");
        console.log(profs);
    } catch (err) {
        console.error("error executing query:", err);
    } finally {
        client.end();
    }
};

perform_query("SELECT courseid FROM courses");


app.use(express.static(__dirname));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    console.log('i receive a GET request');

    res.json(courses)
});

app.post('/analyzer', (req, res) => {
    const result = req.body.myCourse; 
    res.redirect('/results?value=' + result);
});

app.get('/results', (req, res) => {
    const value = req.query.value;
    /*
    get_profs(value)
    get_courseinfo(value)
    delay(2000);
    res.json({profs: profs, courseinfo: courseInfo});
    */
    res.sendFile(__dirname + '/test.html');
  });

var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

});


