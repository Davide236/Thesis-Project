import time
import requests
import keyboard

URL_post = 'http://localhost:3000/live-data/'
URL_get = 'http://localhost:3000/data/live-data/'


def get_data(code):
    print('getting data')
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
    print("Press 'g' (until data is shown) to get data from the application\n")
    while True:
        try:
            if keyboard.is_pressed('g'):
                get_data(code)
                time.sleep(1)
            time.sleep(1)
            send_data(code)
        except:
            break
          
        
if __name__ == "__main__":
	main()