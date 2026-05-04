import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all \" to "
content = content.replace('\\"', '"')

# Fix missing closing parenthesis for setActivePage
content = content.replace("onClick={() => setActivePage('history'}", "onClick={() => setActivePage('history')}")
content = content.replace("onClick={() => setActivePage('settings'}", "onClick={() => setActivePage('settings')}")
content = content.replace("onClick={() => setActivePage('about'}", "onClick={() => setActivePage('about')}")
content = content.replace("onClick={() => setActivePage('translator'}", "onClick={() => setActivePage('translator')}")
content = content.replace("onClick={() => setActivePage('voice'}", "onClick={() => setActivePage('voice')}")
content = content.replace("onClick={() => setActivePage('image'}", "onClick={() => setActivePage('image')}")
content = content.replace("onClick={() => setActivePage('phrasebook'}", "onClick={() => setActivePage('phrasebook')}")

# Fix specific animationDelay string template issue
content = content.replace('`${i * 0.1}s", height:', '`${i * 0.1}s`, height:')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
