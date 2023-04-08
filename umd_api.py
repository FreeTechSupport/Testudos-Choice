import requests
import numpy
import math
import pandas as pd
import sql_commands


class Course(object):
    
    courseid = ""
    name = ""
    semester = ""
    professors = []
    course_description = ""
    average_gpa = 0
    median_gpa = ""
    mode_gpa = ""
    std_gpa = 0

    def __init__(self, semester, courseid):
        self.semester = semester
        self.courseid = courseid

        #if(information exists in database):
            #get information
        if(sql_commands.row_exists('Courses', 'courseid',courseid)):
            rows = sql_commands.execute_command('SELECT * FROM Courses WHERE courseid=\'%s\'' % (self.courseid))[0]

            
            self.courseid = rows[0]
            self.name = rows[1]
            self.semester = rows[2]
            self.professors = rows[3].split(',')
            self.course_description = rows[4]
            self.average_gpa = float(rows[5])
            self.median_gpa = rows[6]
            self.mode_gpa = rows[7]
            self.std_gpa = float(rows[8])

        else:
            self.update_course_information()

            professors_string = ','.join(str(x) for x in self.professors)

            try:
                sql_commands.commit_command(commands=['INSERT INTO Courses VALUES (\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',%s,\'%s\',\'%s\',%s)' % (self.courseid.replace("'","''"), self.name.replace("'","''"), self.semester, professors_string.replace("'","''"), self.course_description.replace("'","''"), self.average_gpa, self.median_gpa, self.mode_gpa, self.std_gpa)])
            except Exception as error:
                print('INSERT INTO Courses VALUES (\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',%s,\'%s\',\'%s\',%s)' % (self.courseid.replace("'","\\'"), self.name.replace("'","\\'"), self.semester.replace("'","\\'"), professors_string.replace("'","\\'"), self.course_description.replace("'","\\'"), self.average_gpa, self.median_gpa, self.mode_gpa, self.std_gpa))
                raise error





    #get professors
    def get_professors(self):
        query = {'course_id' : self.courseid, 'semester' : semester}

        response = (requests.get('https://api.umd.io/v1/professors', params=query).json())


        professors = []
        try:
            if('error_code' in response.keys() and (response['error_code'] == 404)):
                professors = []
                return professors
        except:
            pass
    
        for professor in response:
            professors.append(professor['name'])

        return professors

    def update_course_information(self):
        
        #update professors, course_description, name, and credits of course
        self.update_course_general()

        #calculates and updates the average, median, mode, and std of the gpa #of the course
        self.update_gpa_info()



    def update_course_general(self):
        '''update professors, course_description, name, and credits of course'''

        
        query = {'semester' : self.semester}

        response = requests.get('https://api.umd.io/v1/courses/%s' % (self.courseid), params=query).json()[0]
        
        self.professors = self.get_professors()
        self.course_description = response['description']
        self.name = response['name']
        self.credits = response['credits']

    def update_gpa_info(self):
        '''calculates and updates the average, median, mode, and std of the gpa of the course'''

        #update gpa information
        query = {'course' : self.courseid}

        try:
            response = requests.get('https://planetterp.com/api/v1/grades', params=query).json()
        except:
            print('%s skipped' % (self.courseid))
            return
        
        try:
            if(('error' in response.keys() and response['error'] == 'course not found')):
                print('%s skipped' % (self.courseid))
                return
        except:
            pass


        grades = {}

        for course in response:

            course.pop('course')
            course.pop('professor')
            course.pop('semester')
            course.pop('section')


            for grade in course:
                grade_num = letter_grade_to_gpa(grade)
                if(grade_num in grades.keys()):
                    grades[grade_num] += course[grade]
                else:
                    grades[grade_num] = course[grade]
        

        df = pd.DataFrame.from_dict({
            'NumPeople': grades.values(),
            'Grades': grades.keys()
        })

        df = df[~df['Grades'].isnull()]

        #set gpa data
        try:
            self.average_gpa = sum(df['NumPeople'] * df['Grades']) / df['NumPeople'].sum()
            
            if(pd.isnan(self.average_gpa)):
                self.average_gpa = 0.0

        except:
            self.average_gpa = 0.0
        
        #median
        try:
            cumsum = df['NumPeople'].cumsum()
            cutoff = df['NumPeople'].sum() / 2
            self.median_gpa = gpa_to_letter_grade(df[cumsum >= cutoff]['Grades'].iloc[0])
        except:
            self.median_gpa = 'NA'

        #mode
        try:
            self.mode_gpa = df['Grades'][df['NumPeople'].idxmax()]
        except:
            self.mode_gpa = 'NA'

        

        try:
            variance = numpy.average((df['Grades']-self.average_gpa)**2, weights=df['NumPeople'])
            self.std_gpa = math.sqrt(variance)
        except:
            self.std_gpa = 0






def letter_grade_to_gpa(grade):

    # Define a dictionary with letter grades and their respective GPA values
    grade_dict = {
        'A+': 4.0,
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'D-': 0.7,
        'F': 0.0,
        'W': None,
        'Other': None
    }

    return grade_dict[grade]

def gpa_to_letter_grade(gpa):
    # Define a dictionary with GPA ranges and their corresponding letter grades
    grade_dict = {
        (4.0, 5.0): 'A+',
        (3.7, 4.0): 'A',
        (3.3, 3.7): 'A-',
        (3.0, 3.3): 'B+',
        (2.7, 3.0): 'B',
        (2.3, 2.7): 'B-',
        (2.0, 2.3): 'C+',
        (1.7, 2.0): 'C',
        (1.3, 1.7): 'C-',
        (1.0, 1.3): 'D+',
        (0.0, 1.0): 'D',
        (-float('inf'), 0.0): 'F'
    }
    # Check if the GPA falls within one of the ranges and return the corresponding letter grade
    for key in grade_dict:
        if key[0] <= gpa < key[1]:
            return grade_dict[key]
    else:
        return None






        


#get current semester
semester = (requests.get('https://api.umd.io/v1/courses/semesters').json())[-1]

sql_commands.commit_command(commands=['CREATE TABLE IF NOT EXISTS Courses (courseid STRING, courseName STRING, semester STRING, professors STRING, course_description STRING, average_gpa FLOAT, median_gpa STRING, mode_gpa STRING, std_gpa FLOAT)'])

def main():

    #get course id
    courseid = "MATH140" #instead of math140 it will be the input from the html textbox

    Course(courseid=courseid, semester=semester)


def get_all_courses():

    query = {'page' : '1','per_page' : '100'}

    response = requests.get("https://api.umd.io/v1/courses/list", params=query).json()

    for course in response:
        courseid = course["course_id"]
        if(courseid):
            Course(courseid=courseid, semester=semester)
            print("done with %s" % (courseid))
        else:
            continue

    i = 1

    while(response != []):
        i = i+1
        query = {'page' : '%s' % (i),'per_page' : '100'}

        response = requests.get("https://api.umd.io/v1/courses/list", params=query).json()

        for course in response:
            courseid = course["course_id"]
            if(courseid):
                Course(courseid=courseid, semester=semester)
                print("done with %s" % (courseid))
            else:
                continue

get_all_courses()


    

