import os
import re

dir_path = r"d:\HR Recruitment\frontend\src"

for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # For backticks, first do a simple string replacement
            # it will replace `http://localhost:8000/api...` with `${process...}/api...`
            content = content.replace("`http://localhost:8000", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}")
            
            # For single quotes
            content = re.sub(r"'http://localhost:8000(.*?)'", r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}\1`", content)
            
            # For double quotes
            content = re.sub(r'"http://localhost:8000(.*?)"', r"`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}\1`", content)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Replacement complete.")
