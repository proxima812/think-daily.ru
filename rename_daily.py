import os
import re

# Специфицируйте путь к каталогу с файлами
directory = './src/content/alanonmm/dekabr/'

for filename in os.listdir(directory):
    if re.match('daily_\d{2}-12', filename):
        parts = filename.split('_')
        number_part = int(parts[1].split('-')[0])
        # Уменьшаем число на единицу
        new_number_part = str(number_part - 1).zfill(2)
        new_filename = f'daily_{new_number_part}-12'
        
        old_file = os.path.join(directory, filename)
        new_file = os.path.join(directory, new_filename)

        # Переименовываем файл
        os.rename(old_file, new_file)

# Добавляем расширение .md ко всем файлам в папке
for file_name in os.listdir(directory):
    if not file_name.endswith(".md"):
        # Получаем полный путь к файлу
        file_path = os.path.join(directory, file_name)
        
        # Переименовываем файл, добавляя расширение ".md"
        new_file_name = file_name + ".md"
        new_file_path = os.path.join(directory, new_file_name)
        
        # Используем функцию rename() для переименования файла
        os.rename(file_path, new_file_path)
        print(f"Файл {file_name} переименован в {new_file_name}")
