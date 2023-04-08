import requests
from umd_api import *

class Course(Object):
    courseid = ""
    semester = ""
    professors = []
    course_description = ""
    average_gpa = 0

    def __init__(self, semester, courseid):
        self.semester = semester
        self.courseid = courseid

        self.professors = self.get_professors()
        self.course_description = self.get_course_description()

        print(self.course_description)

    #get professors
    def get_professors(self):
        query = {'course_id' : self.courseid, 'semester' : semester}

        response = (requests.get('https://api.umd.io/v1/professors', params=query).json())

        professors = []
        for professor in response:
            professors.append(professor['name'])

        return professors

    def get_course_description(self):
        
        query = {'course_id' : self.courseid}

        response = requests.get('https://api.umd.io/v1/courses/%s' % (self.courseid)).json()

        self.course_description = response['description']

        


#get current semester
semester = (requests.get('https://api.umd.io/v1/courses/semesters').json())[-1]






def main():
    #get course id
    courseid = "MATH140" #instead of math140 it will be the input from the html textbox

    print(Course(courseid))

