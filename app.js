const { Client } = require("pg");

const port = 8084;
var express = require('express');
var bodyParser = require('body-parser')
var app = express()

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

app.get('/results', async (req, res) => {
    const value = req.query.value;
    console.log(value);

    let data = null;
    await query("SELECT * FROM courses WHERE courseid = " + "'" + value + "'").then(courses => 
        query("SELECT * FROM Professors WHERE courseid = " + "'" + value + "'").then(profs =>

            
            processCourseAndProfs(courses, profs)

            //get descriptions of professors and classes and comparisons by making a series of chatgpt queries
                

            
    ))

    
        
    //console.log(data);

 



    //res.sendFile(__dirname + '/test.html');
  });

async function processCourseAndProfs(courses, profs) {

    console.log(courses.rows);
    //console.log(profs.rows);

    //Store name of class
    courseid = courses.rows[0].courseid;
    coursename = courses.rows[0].coursename
    course_description = courses.rows[0].course_description
    course_median_gpa = courses.rows[0].median_gpa
    course_professors = courses.rows[0].professors.split(',')

    console.log(profs.rows[0])
    

    //get descriptions of professors and classes and comparisons by making a series of chatgpt queries
    let reviews = "";
    let prompt = "";
    let super_prompt = "";
    let counter = 0;
    console.log("Profs: " + course_professors)
    await course_professors.forEach(prof => {

        profs.rows.forEach(elem => {

            if(prof == elem.professor && courseid == elem.courseid){
              counter++;
              if(reviews.length < 2000) {
                reviews += counter + ". " + elem.review + " /n"
              }
              else{
                let response = GPT35Turbo("Write 10 key phrases in list form related to professor " + prof + " and how he conducts the class").then(res => {console.log("hi"); return res});
                prompt += response
                console.log(prompt)
                reviews = ""
                //
                /*(GPT35Turbo("Write 10 key phrases in list form related to professor " + prof + " and how he conducts the class").then(response => {prompt += response}));
                console.log("The prompt: " + prompt)
                reviews = "";
                counter = 0;
                */
              }
            }
    
        })

        //use the key phrases to get a description
        super_prompt += GPT35Turbo("using these key phrases about professor " + prof + ", give me a 100 word description on the professor's notable points and quality \n\n" + prompt).then(response => {return response});
        console.log(super_prompt)



    })
    

    //make chatgpt use the previous query result to determine the best professor

    //make chatgpt use information about the class to make a rating out of 5 

}




const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);



async function GPT35Turbo(message) {

    var GPT35TurboMessage = [
        {
          role: "user",
          content: message,
        },
      ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: GPT35TurboMessage,
    });
  
    return (response.data.choices[0].message.content);
  };

  async function gptResponse(prof) {
    let response = await GPT35Turbo("Write 10 key phrases in list form related to professor " + prof + " and how he conducts the class");
    console.log(response);
    return response;
  }



var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

});


