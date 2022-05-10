import time
import requests
import keyboard
import json

URL_post = 'http://localhost:3000/live-data/'
URL_get = 'http://localhost:3000/data/live-data/'
# Still not sure which kind of data could be sent back to the code and how
# I could use it.
def get_data(code):
    response = requests.get(url = URL_get + code)
    if response.status_code == 200:
        print(response.json())
    else:
        print("\nHTTP request non completed. Try to enter a different code\n")

def send_data(code):
    headers = {"Content-Type": "application/json; charset=utf-8"}
    data = {'experiment': 'exp1',
            'sensor':'temp',
            'values':1}
    response = requests.post(url = URL_post + code,headers=headers, json=data, timeout=1)
    if response.status_code != 200:
        print('Error in sending the data, status code: ' + response.status_code)


def main():
    print("Enter the name of the room: ")
    code = input()
    print("Press 'Ctrl-C' to stop the code\n")
    print("Press 'g' to get data from the application\n")
    try:
        while True:
            time.sleep(1)
            send_data(code)
            if keyboard.read_key() == "g":
                get_data(code)        
    except KeyboardInterrupt:
        print("Press Ctrl-C to terminate while statement")
        pass
        
        
        
if __name__ == "__main__":
	main()