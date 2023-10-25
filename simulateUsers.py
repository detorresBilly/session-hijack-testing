import requests
import random
import faker
import typing
import time

base_url = "http://localhost:3000"

fake = faker.Faker()
num_users=100

valid_sessions=[
['66.110.245.101', 'Mozilla/5.0 (Android 7.0; Mobile; rv:38.0) Gecko/38.0 Firefox/38.0', '7181481144-2'],
['71.251.98.195', 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_1 like Mac OS X; br-FR) AppleWebKit/535.41.3 (KHTML, like Gecko) Version/3.0.5 Mobile/8B111 Safari/6535.41.3', '123461-3'],
['82.158.30.163', 'Mozilla/5.0 (Linux; Android 5.0.1) AppleWebKit/534.1 (KHTML, like Gecko) Chrome/36.0.861.0 Safari/534.1', '3907355777-4'],
['29.189.154.86', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 5.01; Trident/3.1)', '7181481145-5'],
['42.106.168.177', 'Opera/8.12.(X11; Linux i686; shs-CA) Presto/2.9.170 Version/12.00', '7181481146-6'],
['21.167.67.209', 'Mozilla/5.0 (X11; Linux x86_64; rv:1.9.5.20) Gecko/8165-12-24 02:23:27 Firefox/3.6.2', '7181481147-7']
]

class User:
    def __init__(self, attacker, ip_address, user_agent, session_id):
        self.attacker = attacker
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.session_id = session_id

def create_users_array(attacker_chance=0.05) -> list[User]:
    users = []

    for _ in range(num_users):
        is_attacker = random.choices([True, False], [attacker_chance, 1 - attacker_chance])[0]
        if(is_attacker):
            ip_address = fake.ipv4()
            user_agent = fake.user_agent()
            session_id = random.randint(111111111,999999999)
        else:
            session = random.choices(valid_sessions)[0]
            ip_address = session[0]
            user_agent = session[1]
            session_id = session[2]

        user = User(is_attacker, ip_address, user_agent, session_id)
        users.append(user)

    return users

#Send HTTP request, has higher chance to recurse with different info if user is attacker
def send_request(user: User):
    url = f"{base_url}/" 

    if user.attacker == True:
        valid_session = random.choices(["true", "false"], [0.02, 1 - 0.02])[0]
        if(valid_session):
            session = random.choices(valid_sessions)[0]
            user.session_id = session[2]

        headers = {"User-Agent": user.user_agent} 
        cookies = {
            "attacker": "true",
            "session_id": user.session_id,
            "ip_address": user.ip_address,
        }
        response = requests.get(url, headers=headers, cookies=cookies)
        
        #recurse
        if(random.random() > 0.1):
            #change info
            if(random.random() > 0.2):
                user.ip_address = fake.ipv4()
            if(random.random() > 0.2):
                user.user_agent = fake.user_agent()
            send_request(user)

    if user.attacker == False:
        valid_session = random.choices(["true", "false"], [1 - 0.05, 1])[0]
        if(valid_session):
            session = random.choices(valid_sessions)[0]
            user.ip_address = session[0]
            user.user_agent = session[1]
            user.session_id = session[2]
        
        headers = {"User-Agent": user.user_agent} 
        cookies = {
            "attacker": "false",
            "session_id": user.session_id,
            "ip_address": user.ip_address,
        }
        response = requests.get(url, headers=headers, cookies=cookies)

        #recurse
        if(random.random() > 0.7):
            #change info
            if(random.random() > 0.9):
                user.ip_address = fake.ipv4()
            if(random.random() > 0.95):
                user.user_agent = fake.user_agent()
            send_request(user)

        


users = create_users_array()

# Simulate legitimate user requests
for i in range(100):
    random_user = random.choice(users)
    send_request(random_user)
    time.sleep(1)
