process(); 

  async function process(){
    let profs = []
    let courses = [];
    let response = await fetch('/results');
    let responseJson = await response.json();

  //courses.push(responseJson.courseinfo.rows[0]);
  console.log(responseJson)
  /*for (var i = 0; i < responseJson.profs.rows.length; i++) {
    profs.push(responseJson.profs.rows[i]);
  }*/
  course_info = responseJson
  let courseid = course_info.courseid;
  let coursename = course_info.coursename;
  let course_description = course_info.course_description;
  let course_median_gpa = course_info.course_median_gpa; 
  let course_profs = course_info.professors;
  let course_analysis = course_info.course_analysis



  document.querySelector("#CourseName").textContent = courseid + "-" + coursename;
  document.querySelector("#CourseDesc").textContent = course_description;
  document.querySelector("#CourseMedianGPA").textContent = course_median_gpa;
  document.querySelector("#CourseProfs").textContent = course_profs;
  document.querySelector("#Analysis").textContent = course_analysis;

    // show main content
    if (mainContent) {
      mainContent.style.display = "block";
    }
  
    // hide loading screen
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
}
