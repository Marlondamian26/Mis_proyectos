import requests

try:
    r = requests.get('http://127.0.0.1:8000/api/usuario-actual/')
    print('status', r.status_code)
    print(r.text[:200])
except Exception as e:
    print('error', e)
