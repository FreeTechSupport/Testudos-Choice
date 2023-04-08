import sql_commands
import psycopg2
import requests



#Creating the table
#there are 4 columns: Professor, CourseID, Rating, Review.

sql_commands.commit_command(commands = ["CREATE TABLE IF NOT EXISTS Professors (Professor STRING, CourseID STRING, Rating FLOAT, Review STRING)"])
rows = sql_commands.execute_command('SELECT professors FROM Courses')


arr = [val[0].split(',') for val in rows]


course_set = set()
for professor in arr:
    course_set.update(professor)


#get other data from planetterp
query = {'name' : "Larry Herman"}

for x in course_set:

    query = {'name' : x, 'reviews' : 'true'}
    response = requests.get('https://planetterp.com/api/v1/professor', params=query).json()

    try:
        if(response['error'] == 'professor not found'):
            print(x + " is not found")
            continue
    except:
        pass
    #print(response)
   
    info = response['reviews']

    for x in info:
        review = str(x['review'] or 'None')
        rate = float(response['average_rating'] or 0.0)
        prof = str(x['professor'] or 'None')
        course = str(x['course'] or 'None')

        sql_commands.commit_command(commands=["INSERT INTO Professors VALUES ('%s', '%s', '%s', '%s')" % (prof.replace("'","''"), course.replace("'","''"), rate, review.replace("'","''") )])
        print('review for ' + prof)
