import multiprocessing
import requests
import time
import PySimpleGUI as sg
import sys

sys.tracebacklimit = None

# Get and post address for sending and retrieving data
URL_post = 'http://localhost:3000/live-data/'
URL_get = 'http://localhost:3000/data/live-data/'

# Global variables used in the program
student_answers = []
room = ''
flag = False
average_value = 0
formula = None
allowed_terms = ['x', 'var', '(', ')', '+', '-', '*', '/']

# Layout of the GUI for the user
layout = [[sg.Text("The input formula has to be of the kind 'x(*|+|/|-)var',\n where 'x' is the data being collected by the sensors,\n 'var' corresponds to the answers from the student.\n The combination of the two should evaluate to a new measure x1 which is going to be sent\n back to the application as a new graph")],
          [sg.Text("Make sure to add space between terms in the formula", font=('Arial', 13, 'bold'))],
          [sg.Text("Add input formula:",font=('Arial', 13, 'bold')), sg.InputText(size=(20,0), key='formula_input'), sg.Button("Add formula")],
          [sg.Text('The room name has to be the same name used \n in the application to create the stream')],
          [sg.Text("Connect to room: ", font=('Arial', 13, 'bold')), sg.InputText(size=(20,0), key='room_input'), sg.Button("Connect", disabled=True)],
          [sg.Button("Retrieve Student Answers", disabled=True)],
          [sg.Text("List of student answers", font=('Arial', 10, 'bold'))],
          [sg.Table(values = student_answers, headings=['Student', 'Answer'], justification = 'left',
                    auto_size_columns=False, col_widths=[20,5], key = 'answer_histogram')]]

# Initialize the window
window = sg.Window('Chemical Twins', layout, size=(1500,1000))


# Function which gets data (students' answers) from the application during a live stream  
def get_data():
    global average_value
    try:
        response = requests.get(url = URL_get + room)
        # If the response is good (200) then we calculate the average value amongst all the answers
        if response.status_code == 200:
            data = response.json()
            count = 0
            student_answers = []
            for d in data:
                average_value += float(d['answer'])
                count += 1
                # Array of student + answer to display to the user
                student_answers.append([d['username'],d['answer']]) 
            average_value = average_value/count
            return student_answers
    except:
        print("\nHTTP request non completed. Try to enter a different code and make sure that you have an active stream\n")
        return []

#Function that returns the recorded value of the experiment
def get_value():
    return 1

# Function which checks if the input formula is
def check_formula():
    tokens = formula.split(' ')
    # Check if the tokens are amongs the terms allowed
    for tok in tokens:
        if not tok in allowed_terms:
            return False
    try:
    # Try to evaluate the formula once to see if it's valid
        eval(formula, {'x': 1, 'var': 1})
        return True
    except:
        return False

# Function used to resolve a formula and return its value
def resolve_formula(value):
    return eval(formula, {'x': value, 'var': average_value})


# Function used to send data to the application every 2 seconds
def send_data():
    while True:
        time.sleep(2)
        headers = {"Content-Type": "application/json; charset=utf-8"}
        value = get_value()
        data = {'value': value}
        # If flag is true then we also send data from the student answer
        if flag:
            data['student_val'] = resolve_formula(value)
        try:
            requests.post(url = URL_post + room,headers=headers, json=data, timeout=1)
        except:
            print("\nHTTP request non completed. Try to enter a different code and make sure that you have an active stream\n")

# Create two threads for sending data
send_data_thread = multiprocessing.Process(target=send_data, args=())

send_twins_thread = multiprocessing.Process(target=send_data, args=())

# Check for input in the GUI
while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED:
        break
    # The user adds a formula
    if event == 'Add formula':
        formula = values['formula_input']
        # Check if the formula is valid
        if not check_formula():
            print('Error in parsing the formula, please try again to imput a different one')
            continue
        window['Connect'].update(disabled=False)
        print('Current formula: ' + formula)
    if event == 'Connect':
        room = values['room_input']
        window['Retrieve Student Answers'].update(disabled=False)
        print('Current room: ' + room)
        # Start the thread for sending the data
        send_data_thread.start()
    if event == "Retrieve Student Answers":
        flag = True
        send_data_thread.terminate()
        # Get data from the application
        window.Element('answer_histogram').Update(get_data())
        # Start new thread to send both datas, from sensors and from students
        send_twins_thread.start()

# If the threads are still active then we terminate them
if send_data_thread:
    send_data_thread.terminate()
if send_twins_thread:
    send_twins_thread.terminate()

window.close()
