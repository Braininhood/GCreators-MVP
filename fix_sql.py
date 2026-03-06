import re

# Read the SQL file
with open('d:/GCreators_MVP/IMPORT_ALL_DATA_COMPLETE.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix arrays - convert '["item1","item2"]'::jsonb to ARRAY['item1','item2']::text[]
def fix_array(match):
    array_str = match.group(1)
    items = re.findall(r'"([^"]+)"', array_str)
    if items:
        items_formatted = ','.join([f"'{item}'" for item in items])
        return f"ARRAY[{items_formatted}]::text[]"
    return "ARRAY[]::text[]"

# Pattern for arrays
content = re.sub(r"'(\[[^\]]*\])'::jsonb", fix_array, content)

# Write the fixed file
with open('d:/GCreators_MVP/IMPORT_ALL_DATA_COMPLETE_FIXED.sql', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed SQL file created!")
