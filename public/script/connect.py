import multiprocessing
import requests
import time
import PySimpleGUI as sg
import sys

#Import sensor data
from sensor import get_value

sys.tracebacklimit = None

# Get and post address for sending and retrieving data

URL_post = 'https://chemical-twins.herokuapp.com/live-data/'
URL_get = 'https://chemical-twins.herokuapp.com/data/live-data/'

# Global variables used in the program
student_answers = []
room = ''
formula = None
allowed_terms = ['x', 'var', '(', ')', '+', '-', '*', '/']

# Layout of the GUI for the user
layout = [[sg.Text('The room name has to be the same name used \n in the application to create the stream')],
          [sg.Text("Connect to room: ", font=('Arial', 13, 'bold')), sg.InputText(size=(20,0), key='room_input'), sg.Button("Connect")],
          [sg.Button("Retrieve Student Answers", disabled=True)],
          [sg.Text("List of student answers", font=('Arial', 10, 'bold'))],
          [sg.Table(values = student_answers, headings=['Student', 'Answer'], justification = 'left',
                    auto_size_columns=False, col_widths=[20,5], key = 'answer_histogram')],
          [sg.Text("Use student answer (input name):", font=('Arial', 13, 'bold')), sg.InputText(size=(20,0), key='student_name'), sg.Button("Use", disabled=True)]]

# Initialize the window
window = sg.Window('Chemical Twins', layout, size=(1500,1000))



# Function which gets data (students' answers) from the application during a live stream  
def get_data():
    global student_answers
    try:
        response = requests.get(url = URL_get + room)
        # If the response is good (200) then we calculate the average value amongst all the answers
        if response.status_code == 200:
            data = response.json()
            for d in data:
                # Array of student + answer to display to the user
                student_answers.append([d['username'],d['answer']]) 
            return student_answers
    except:
        print("\nHTTP request non completed. Try to enter a different code and make sure that you have an active stream\n")
        return []


# Function used to send data to the application every 2 seconds
def send_data():
    while True:
        time.sleep(2)
        headers = {"Content-Type": "application/json; charset=utf-8"}
        value = get_value()
        data = {'value': value}
        try:
            requests.post(url = URL_post + room,headers=headers, json=data, timeout=1)
        except:
            print("\nHTTP request non completed. Try to enter a different code and make sure that you have an active stream\n")

def find_student_value(student):
    print(student_answers)
    print(student)
    for values in student_answers:
        print(values)
        if values[0] == student:
            return values[1]
    print('No student found')
    return 0


def change_lights(value):
    print(value)
    
# Create two threads for sending data
send_data_thread = multiprocessing.Process(target=send_data, args=())

# Check for input in the GUI
while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED:
        break
    # The user tries to connect to the room
    if event == 'Connect':
        room = values['room_input']
        window['Retrieve Student Answers'].update(disabled=False)
        print('Current room: ' + room)
        # Start the thread for sending the data
        send_data_thread.start()
    if event == "Retrieve Student Answers":
        # Get data from the application
        window.Element('answer_histogram').Update(get_data())
        window['Use'].update(disabled=False)
    if event == "Use":
        print("Change value")
        student = values['student_name']
        value = find_student_value(student)
        if value:
            change_lights(value)
        #send_twins_thread.start()

# If the threads are still active then we terminate them
if send_data_thread.is_alive():
    send_data_thread.terminate()

window.close()
