import os
import psycopg2
import time

conn = psycopg2.connect(os.environ["DATABASE_URL"])

def table_exists(table_name):
    '''checks if the table exists in the database'''

    try:
        execute_command(commands=["SELECT * FROM %s" % (table_name)])
        return True
    except:
        conn.rollback()
        return False

def row_exists(table_name, row_name, row_value):

    commands = []

    try:
        rows =execute_command("SELECT * FROM %s WHERE %s=\'%s\'" % (table_name, row_name, row_value))

        #if nothing is found, return false
        if(rows == []):
            return False

        return True
    except Exception as error:
        print(error)
        conn.rollback()
        return False

def execute_command(command):
    with conn.cursor() as cur:
        cur.execute(command)
        rows = cur.fetchall()
    return rows

def commit_command(commands = []):
        with conn.cursor() as cur:
            for command in commands:
                cur.execute("%s" % (command))
        
        try:
            conn.commit()
        except Exception as error:
            conn.rollback()
            raise error
    
''' n = 0
max_retries = 5
while True:
    n = n+1
    if n == max_retries:
        raise Exception("did not succeed within N retries")
    try:

        # add logic here to run all your statements
        print(commands)
        with conn.cursor() as cur:
            for command in commands:
                print(command)
                cur.execute("%s" % (command))
            
        
        conn.commit()
        break
    except Exception as error:
        if hasattr(error,'code'):
            if(error.code != "40001"):
                raise error
        else:
            print(error)
            # This is a retry error, so we roll back the current transaction
            # and sleep for a bit before retrying. The sleep time increases
            # for each failed transaction.  Adapted from
            # https://colintemple.com/2017/03/java-exponential-backoff/
            with conn.cursor() as cur:
                cur.execute('ROLLBACK')
            #sleep_ms = int(((2**n) * 100) + math.random( 100 - 1 ) + 1)
            #time.sleep(100) # Assumes your sleep() takes milliseconds '''