import time
import requests
import json

URL = 'http://localhost:3000/data/live-data/'

# Still not sure which kind of data could be sent back to the code and how
# I could use it.
def get_data(code):
    response = requests.get(url = URL + code)
    if response.status_code == 200:
        print(response.json())
    else:
        print("\nHTTP request non completed. Try to enter a different code\n")

def send_data(code):
    headers = {"Content-Type": "application/json; charset=utf-8"}
    data = {'experiment': 'exp1',
            'sensor':'temp',
            'values':1}
    response = requests.post(url = URL + code,headers=headers, json=data, timeout=1)


def main():
    print("Enter the given code: ")
    code = input()
    print("Press 's' to stop the code\n")
    try:
        count = 0
        while True:
            count += 1
            time.sleep(1)
            send_data(code)
            if (count%10 == 0):
                get_data(code)         
    except KeyboardInterrupt:
        print("Press Ctrl-C to terminate while statement")
        pass
        
        
        
if __name__ == "__main__":
	main()