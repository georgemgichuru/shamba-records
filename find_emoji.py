import os, re

pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u27BF]')
with open('emoji_files.txt', 'w', encoding='utf-8') as out:
    for root, dirs, files in os.walk('e:/PROJECTS/shamba-records/coreui-free-react-admin-template/src'):
        for f in files:
            if f.endswith('.jsx') or f.endswith('.js'):
                path = os.path.join(root, f)
                try:
                    with open(path, 'r', encoding='utf-8') as file:
                        content = file.read()
                        if pattern.search(content):
                            out.write(path + '\n')
                except:
                    pass
