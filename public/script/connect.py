import multiprocessing
import requests
import time
import PySimpleGUI as sg
import sys
import serial

#Create Serial port object to connect to arduino
arduino = serial.Serial(port='/dev/ttyACM0', baudrate=115200, timeout=.1)

sys.tracebacklimit = None

# Get and post address for sending and retrieving data

URL_post = 'https://chemical-twins.herokuapp.com/live-data/'
URL_get = 'https://chemical-twins.herokuapp.com/data/live-data/'

# Global variables used in the program
student_answers = []
room = ''
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

# Function which gets data from the arduino sensor and formats it
def get_sensor_value():
    # Send data to arduino
    arduino.write(bytes('1', 'utf-8'))
    time.sleep(1)
    # read a byte string
    data_bytes = arduino.readline() 
    # decode byte string into Unicode         
    data_decoded = data_bytes.decode() 
    # remove \n and \r 
    data_cleaned = data_decoded.rstrip()
    if data_cleaned:
        # Turn data into floating point
        data = float(data_cleaned)
        return data
    # If there is an error in getting the data
    return 0

# Function used to send data to the application every 2 seconds
def send_data():
    while True:
        time.sleep(2)
        headers = {"Content-Type": "application/json; charset=utf-8"}
        value = get_sensor_value()
        data = {'value': value}
        try:
            requests.post(url = URL_post + room,headers=headers, json=data, timeout=1)
        except:
            print("\nHTTP request non completed. Try to enter a different code and make sure that you have an active stream\n")

# Let the creator decide to take one of the students answers
def find_student_value(student):
    for values in student_answers:
        if values[0] == student:
            return values[1]
    print('No student found')
    return 0


def change_lights(value):
    # Send data to arduino
    arduino.write(bytes(str(value), 'utf-8'))
    
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
        change_lights(value)

# If the threads is still active then we terminate it
if send_data_thread.is_alive():
    send_data_thread.terminate()

window.close()
