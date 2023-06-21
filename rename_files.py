import os
import re

# Укажите здесь путь к папке, где находятся ваши папки месяцев
base_dir = './src/content/beattiem'

# Словарь для сопоставления названий месяцев и их номеров
months = {
    'yanvar': '01',
    'fevral': '02',
    'mart': '03',
    'april': '04',
    'maj': '05',
    'iyun': '06',
    'iyul': '07',
    'avgust': '08',
    'sentyabr': '09',
    'oktyabr': '10',
    'noyabr': '11',
    'dekabr': '12'
}

# Функция для извлечения числовой части из имени файла
def get_number_from_filename(filename):
    match = re.search(r'\d+', filename)
    return int(match.group()) if match else None

# Перебираем все папки месяцев
for month in months.keys():
    # Путь к папке месяца
    month_dir = os.path.join(base_dir, month)
    # Получаем все файлы в папке месяца и сортируем их по числовой части в имени
    sorted_files = sorted([f for f in os.listdir(month_dir) if f.endswith(('.md', '.mdx'))], key=get_number_from_filename)
    # Перебираем все отсортированные файлы
    for index, filename in enumerate(sorted_files, start=1):
        # Определяем полный путь к файлу
        file_path = os.path.join(month_dir, filename)
        # Определяем новое имя файла
        new_filename = f"daily_{index:02d}-{months[month]}.md"
        # Определяем полный путь к новому файлу
        new_file_path = os.path.join(month_dir, new_filename)
        # Переименовываем файл
        os.rename(file_path, new_file_path)
