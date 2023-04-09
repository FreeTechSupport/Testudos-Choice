const { Client } = require("pg");

const port = 8084;
var express = require('express');
var bodyParser = require('body-parser')
var app = express()
let result = ""


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

query("CREATE TABLE IF NOT EXISTS course_evaluations (courseid STRING, courseName STRING, course_description STRING, course_median_gpa STRING, professors STRING, course_analysis STRING)")

app.use(express.static(__dirname));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    console.log('i receive a GET request');

    query("SELECT courseid FROM courses").then(courses => res.json(courses));
});

app.post('/analyzer', (req, res) => {
    result = req.body.myCourse; 
    res.sendFile(__dirname + "/test.html")
});

app.get('/results', async (req, res) => {
    //console.log(value);

    let data = null;
    let courses = await query("SELECT * FROM courses WHERE courseid = " + "'" + result + "'");
    let profs = await query("SELECT * FROM Professors WHERE courseid = " + "'" + result + "'");
    let response = await processCourseAndProfs(courses, profs)
    res.json(response);
    /*
    await query("SELECT * FROM courses WHERE courseid = " + "'" + value + "'").then(courses => 
        query("SELECT * FROM Professors WHERE courseid = " + "'" + value + "'").then(profs =>

            
            processCourseAndProfs(courses, profs)

            //get descriptions of professors and classes and comparisons by making a series of chatgpt queries
                

            
    ))

    
        
    //console.log(data);

 



    //res.sendFile(__dirname + '/test.html');*/
  });

async function processCourseAndProfs(courses, profs) {

    //console.log(courses.rows);
    //console.log(profs.rows);

    //check if row exists
    //console.log(courses)
    course_page = await query("SELECT * FROM course_evaluations WHERE courseid=" + "'" + courses.rows[0].courseid + "'")

    course_page = course_page.rows


    if(course_page.length != 0){

        course_page = course_page[0]
        
        console.log("here?")
       return {courseid:course_page.courseid, coursename: course_page.coursename, course_description: course_page.course_description, course_median_gpa: course_page.course_median_gpa, professors: course_page.professors, course_analysis:course_page.course_analysis}
    }
    
    

    //Store name of class
    courseid = courses.rows[0].courseid;
    coursename = courses.rows[0].coursename
    course_description = courses.rows[0].course_description
    course_median_gpa = courses.rows[0].median_gpa
    course_professors_string = courses.rows[0].professors
    course_professors = course_professors_string.split(',')

    //console.log(profs.rows[0])
    

    //get descriptions of professors and classes and comparisons by making a series of chatgpt queries
    let reviews = "";
    let prompt = "";
    let super_prompt = "";
    let counter = 0;
    let flag = false
    console.log("Profs: " + course_professors)
    //console.log(profs.rows)
    for(const prof of course_professors) {
        
        for(const elem of profs.rows) {
            if(prof == elem.professor && courseid == elem.courseid){
                flag = true
                counter++;
                if(reviews.length < 2000) {
                  reviews += counter + ". " + elem.review + " \n"
                }
                else{

                  let res = await GPT35Turbo("Based on the course description: " + course_description + " and using the reviews listed below Write 10 key phrases in list form related to professor " + prof + " and how they conducts the class. If there are no reviews, do not give key phrases and simply note the lack of information about the professor " + "\n " + reviews);
                  prompt += res;
                  reviews = "";
                  //
                  /*(GPT35Turbo("Write 10 key phrases in list form related to professor " + prof + " and how he conducts the class").then(response => {prompt += response}));
                  console.log("The prompt: " + prompt)
                  reviews = "";
                  counter = 0;
                  */
                }
              }

            
              

        }

        if(flag == false){
            super_prompt += "There is no reviews for professor " + prof + " for this class and thus it is hard to determine the professor's teaching quality."
           
        } else {

            let res = await GPT35Turbo("Based on the course description: " + course_description + " and using the reviews listed below Write 10 key phrases in list form related to professor " + prof);
            prompt += res;

            super_prompt += await GPT35Turbo("using the key phrases about professor " + prof + ", give me a 100 word description on the professor's skill or lack thereof in teaching the class. If there is a lack of reviews for a professor, take that into consideration. \n\n" + prompt) + "\n\n";
            //console.log(super_prompt);
        }






    }

    course_analysis_prompt = "course description: " + course_description + "\n\n median gpa of the class: " + course_median_gpa + "\n\n Description of Professors: " + super_prompt + "\n\n give me an analysis of the course and its professors, along with recommendations on which professor should be targeted and which should be avoided. Give me an objective response."

    course_analysis = await GPT35Turbo(course_analysis_prompt);
    console.log(course_analysis);

    //console.log({courseid:courseid, coursename: coursename, course_description: course_description, course_median_gpa: course_median_gpa, professors: course_professors, course_analysis:course_analysis})

    console.log("here1")
    console.log(course_analysis.replace("'","''"))
    console.log("here2")

    quer = "INSERT INTO course_evaluations VALUES (\'" + courseid +"\', \'" + coursename.replace("\'","''") + "\', \'" + course_description.replace("'","''") + "\', \'" + course_median_gpa + "\', \'" + course_professors_string.replace("'","''") + "\', \'" + course_analysis.replace("'","''") + "\')";

    console.log(quer);

    try {
        await query("INSERT INTO course_evaluations VALUES (\'" + courseid +"\', \'" + coursename.replace("'","") + "\', \'" + course_description.replace("'","") + "\', \'" + course_median_gpa + "\', \'" + course_professors_string.replace("'","") + "\', \'" + course_analysis.replace("'","") + "\')");
    }
    catch {
        console.log("insert error o well :(")
    }

    return {courseid:courseid, coursename: coursename, course_description: course_description, course_median_gpa: course_median_gpa, professors: course_professors_string, course_analysis:course_analysis}


    /*course_professors.forEach(prof => {

        profs.rows.forEach(elem => {

            if(prof == elem.professor && courseid == elem.courseid){
              counter++;
              if(reviews.length < 2000) {
                reviews += counter + ". " + elem.review + " /n"
              }
              else{
                async () => (await GPT35Turbo("Using the reviews listed below Write 10 key phrases in list form related to professor " + prof + " and how he conducts the class " + "\n " + reviews)).then(res => prompt += res);
                reviews = ""
                //
                /*(GPT35Turbo("Write 10 key phrases in list form related to professor " + prof + " and how he conducts the class").then(response => {prompt += response}));
                console.log("The prompt: " + prompt)
                reviews = "";
                counter = 0;
                
              }
            }
    
        })

        //use the key phrases to get a description
        super_prompt += GPT35Turbo("using these key phrases about professor " + prof + ", give me a 100 word description on the professor's skill or lack thereof in teaching the class \n\n" + prompt);
        console.log(super_prompt);



    })*/
    

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



var server = app.listen(port, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

});


