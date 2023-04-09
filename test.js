//let course = document.querySelector("#value").textContent;
process(); 
async function process(){
  let profs = []
  let courses = [];
  let response = await fetch('/results');
  let responseJson = await response.json();
  courses.push(responseJson.courseinfo.rows[0]);
  console.log(responseJson)
  for (var i = 0; i < responseJson.profs.rows.length; i++) {
    profs.push(responseJson.profs.rows[i]);
  }
  let courseid = courses[0].courseid;
  let coursename = courses[0].coursename;
  let course_description = courses[0].course_description;
  let course_median_gpa = courses[0].median_gpa; 
  let course_profs = courses[0].professors;

  document.querySelector("#CourseName").textContent = courseid + "-" + coursename;
  document.querySelector("#CourseDesc").textContent = course_description;
  document.querySelector("#CourseMedianGPA").textContent = course_median_gpa;
  document.querySelector("#CourseProfs").textContent = course_profs;
}



