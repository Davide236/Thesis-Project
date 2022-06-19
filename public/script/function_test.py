import requests
import time
from mock_serial import MockSerial
from serial import Serial

# This file has the functions to be tested, with some changes since the 
# test does not include an active connection to Arduino

def get_data(room):
    student_answers = []
    URL_get = 'https://chemical-twins.herokuapp.com/data/live-data/'
    try:
        response = requests.get(url = URL_get + room)
        if response.status_code == 200:
            data = response.json()
            for d in data:
                student_answers.append([d['username'],d['answer']]) 
        return student_answers
    except:
        return []


def get_sensor_value():
    device = MockSerial()
    device.open()
    arduino = Serial(device.port)
    stub = device.stub(
        receive_bytes=b'1',
        send_bytes=b'5'
    )
    arduino.write(bytes('1', 'utf-8'))
    time.sleep(1)
    data_bytes = arduino.read() 
    data_decoded = data_bytes.decode() 
    data_cleaned = data_decoded.rstrip()
    arduino.close()
    device.close()
    if data_cleaned:
        data = float(data_cleaned)
        return data
    return 0


def send_data(room):
    URL_post = 'https://chemical-twins.herokuapp.com/live-data/'
    headers = {"Content-Type": "application/json; charset=utf-8"}
    value = 5
    data = {'value': value}
    try:
        requests.post(url = URL_post + room,headers=headers, json=data, timeout=1)
        return 1
    except:
        return 0


def find_student_value(student, student_answers):
    for values in student_answers:
        if values[0] == student:
            return values[1]
    return 0