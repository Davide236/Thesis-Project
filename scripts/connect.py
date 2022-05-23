import multiprocessing
import requests
import time
import PySimpleGUI as sg

URL_post = 'http://localhost:3000/live-data/'
URL_get = 'http://localhost:3000/data/live-data/'

student_answers = []
room = ''
flag = False
global average_value
average_value = 0

layout = [[sg.Text("The input formula has to be of the kind 'x1 = x(*|+|/|-)var',\n where 'x' is the data being collected by the sensors,\n 'var' corresponds to the answers from the student and\n 'x1' is the sensed data after the student aswers")],
          [sg.Text("Make sure to add space between terms in the formula", font=('Arial', 13, 'bold'))],
          [sg.Text("Add input formula:",font=('Arial', 13, 'bold')), sg.InputText(size=(20,0), key='formula_input'), sg.Button("Add formula")],
          [sg.Text('The room name has to be the same name used \n in the application to create the stream')],
          [sg.Text("Connect to room: ", font=('Arial', 13, 'bold')), sg.InputText(size=(20,0), key='room_input'), sg.Button("Connect", disabled=True)],
          [sg.Button("Retrieve Student Answers", disabled=True)],
          [sg.Text("List of student answers", font=('Arial', 10, 'bold'))],
          [sg.Table(values = student_answers, headings=['Student', 'Answer'], justification = 'left',
                    auto_size_columns=False, col_widths=[20,5], key = 'answer_histogram')]]

window = sg.Window('Chemical Twins', layout, size=(1500,1000))

    
def get_data():
    global average_value
    response = requests.get(url = URL_get + room)
    if response.status_code == 200:
        data = response.json()
        count = 0
        student_answers = []
        for d in data:
            average_value += float(d['answer'])
            count += 1
            student_answers.append([d['username'],d['answer']]) 
        average_value = average_value/count
        print(average_value)
        return student_answers
    else:
        print("\nHTTP request non completed. Try to enter a different code\n")
        return []

#Function that returns the recorded value of the experiment
def get_value():
    return 1


def resolve_formula(value):
    return average_value*value

def send_data():
    while True:
        time.sleep(2)
        headers = {"Content-Type": "application/json; charset=utf-8"}
        value = get_value()
        data = {'value': value}
        if flag:
            data['student_val'] = resolve_formula(value)
        response = requests.post(url = URL_post + room,headers=headers, json=data, timeout=1)
        if response.status_code != 200:
            print('Error in sending the data, status code: ' + response.status_code)

send_data_thread = multiprocessing.Process(target=send_data, args=())

send_twins_thread = multiprocessing.Process(target=send_data, args=())

while True:
    event, values = window.read()
    if event == sg.WIN_CLOSED:
        break
    if event == 'Add formula':
        print(values['formula_input'].split(' '))
        window['Add formula'].update(disabled=True)
        window['formula_input'].update(disabled=True)
        window['Connect'].update(disabled=False)
    if event == 'Connect':
        room = values['room_input']
        window['Connect'].update(disabled=True)
        window['room_input'].update(disabled=True)
        window['Retrieve Student Answers'].update(disabled=False)
        send_data_thread.start()
    if event == "Retrieve Student Answers":
        flag = True
        send_data_thread.terminate()
        window.Element('answer_histogram').Update(get_data())
        send_twins_thread.start()

if send_data_thread:
    send_data_thread.terminate()
if send_twins_thread:
    send_twins_thread.terminate()
window.close()
