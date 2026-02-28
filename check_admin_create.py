import requests
BASE_URL = "http://127.0.0.1:8000/api"

def login(username, password):
    r = requests.post(f"{BASE_URL}/token/", json={"username":username,"password":password})
    if r.status_code == 200:
        return r.json()['access']
    print('login failed', r.status_code, r.text)
    return None

admin_token = login('admin','12345678')
print('admin_token', admin_token)
headers = {'Authorization': f'Bearer {admin_token}'}
newdata = {"username": "some_admin","password": "pwd12345","first_name": "Admin","last_name": "Nuevo","email": "adminnuevo@example.com","telefono": "+244000000000","rol": "admin"}

resp = requests.post(f"{BASE_URL}/usuarios/", json=newdata, headers=headers)
print('status', resp.status_code, resp.text)
