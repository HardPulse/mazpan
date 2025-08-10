import subprocess
import time
import random
import os

# Список слов для генерации случайных имен
words = ['alpha', 'beta', 'gamma', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliett']
numbers = [str(i) for i in range(100)]

# Генерация случайного имени хоста
def generate_random_hostname(prefix):
    word = random.choice(words)
    number = random.choice(numbers)
    return f"{prefix}-{word}{number}"

# Путь к файлу .env
env_file_path = r"D:\Avtoreger\data\zenka\KZ2\aaa\app\frontend\.env"

# Генерация случайных имен для хостов
hostname1 = generate_random_hostname("he5tg25la")
hostname2 = generate_random_hostname("h3255tg5la")

# 1. Запуск первой команды loophole с рандомным hostname1
cmd1 = f'cmd /k D:\\Avtoreger\\data\\zenka\\KZ2\\aaa\\serv\\loophole.exe http 8007 --hostname {hostname1}'
subprocess.Popen(cmd1, shell=True)

# Задержка 1 секунда
time.sleep(5)

# 2. Обновление файла .env с новым hostname1
with open(env_file_path, 'r') as file:
    content = file.read()

# Заменяем старый URL на новый
new_url = f"REACT_APP_BACKEND_URL=https://{hostname1}.loophole.site"
if "REACT_APP_BACKEND_URL" in content:
    updated_content = content.split('\n')
    for i, line in enumerate(updated_content):
        if line.startswith("REACT_APP_BACKEND_URL"):
            updated_content[i] = new_url
    updated_content = '\n'.join(updated_content)
else:
    updated_content = content + '\n' + new_url

# Сохраняем изменения в файл
with open(env_file_path, 'w') as file:
    file.write(updated_content)

# Задержка 5 секунд
time.sleep(5)

# 3. Запуск второй команды loophole с рандомным hostname2
cmd2 = f'cmd /k D:\\Avtoreger\\data\\zenka\\KZ2\\aaa\\serv\\loophole.exe http 3007 --hostname {hostname2}'
subprocess.Popen(cmd2, shell=True)

# Задержка 10 секунд
time.sleep(10)

# 4. Запуск backend
cmd3 = r'cd /d D:\Avtoreger\data\zenka\KZ2\aaa\app\backend && start "Backend" cmd /k uvicorn server:app --host 0.0.0.0 --port 8007 --reload'
subprocess.Popen(cmd3, shell=True)

# Задержка 7 секунд
time.sleep(7)

# 5. Запуск frontend
cmd4 = r'cd /d D:\Avtoreger\data\zenka\KZ2\aaa\app\frontend && set PORT=3007 && start "Frontend" cmd /k npm start'
subprocess.Popen(cmd4, shell=True)