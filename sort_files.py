import fileinput
import os
import re
import shutil

# Укажите здесь путь к папке, где находятся ваши файлы и папки месяцев
base_dir = './src/content/'

# Задаем количество файлов, которое должно попасть в каждую папку
months = {
    'yanvar': 31,
    'fevral': 29,
    'mart': 31,
    'april': 30,
    'maj': 31,
    'iyun': 30,
    'iyul': 31,
    'avgust': 31,
    'sentyabr': 30,
    'oktyabr': 31,
    'noyabr': 30,
    'dekabr': 31
}

# Получаем список всех файлов и папок в базовом каталоге
all_files_and_folders = os.listdir(base_dir)

# Фильтруем список, оставляем только файлы (исключаем папки)
files = [f for f in all_files_and_folders if os.path.isfile(os.path.join(base_dir, f))]

# Функция для извлечения числовой части из имени файла
def get_number_from_filename(filename):
    match = re.search(r'\d+', filename)
    return int(match.group()) if match else 0

# Сортируем файлы по числовой части в их имени
files.sort(key=get_number_from_filename)

index = 0

for month, num_files in months.items():
    for _ in range(num_files):
        try:
            # Пытаемся переместить файл
            shutil.move(os.path.join(base_dir, files[index]), os.path.join(base_dir, month, files[index]))
            index += 1
        except IndexError:
            # Здесь мы попадаем, если в списке файлов больше нет элементов
            print(f"Не хватает файлов для заполнения месяца {month}. Обработка завершена на файле номер {index}.")
            break
        except Exception as e:
            # Здесь мы попадаем, если произошла какая-то другая ошибка
            print(f"Произошла ошибка при перемещении файла: {e}")
            break

# Перебираем все папки месяцев
for month, num_files in months.items():
    # Путь к папке месяца
    month_dir = os.path.join(base_dir, month)
    # Перебираем все файлы в папке месяца
    for filename in os.listdir(month_dir):
        # Определяем полный путь к файлу
        file_path = os.path.join(month_dir, filename)
        # Если это файл и он имеет расширение .md или .mdx
        if os.path.isfile(file_path) and filename.endswith(('.md', '.mdx')):
            with fileinput.FileInput(file_path, inplace=True) as file:
                for line in file:
                    # Заменяем "pubDate: 2023-05-04" на "pubDate: 2023-05-04\nmoth: [название папки месяца]"
                    print(line.replace('pubDate: 2023-05-04', f'pubDate: 2023-05-04\nmoth: "{month}"'), end='')
#### Возращает все файлы в обратно

# import os
# import shutil

# # Укажите здесь путь к папке, где находятся ваши папки месяцев с файлами
# base_dir = './src/content/aadays'

# months = ['yanvar', 'fevral', 'mart', 'april', 'maj', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

# for month in months:
#     month_dir = os.path.join(base_dir, month)
#     files = os.listdir(month_dir)
#     for file in files:
#         shutil.move(os.path.join(month_dir, file), os.path.join(base_dir, file))