"""Read-only export. Never imports Django or opens accounts/session tables."""
import json, sqlite3, shutil, hashlib
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = root.parent / 'bosque-vivo'
out = root / 'work' / 'import'
out.mkdir(parents=True, exist_ok=True)
connection = sqlite3.connect((source / 'db.sqlite3').as_uri() + '?mode=ro', uri=True)
connection.row_factory = sqlite3.Row
tables = {'species': 'flora_species', 'specimens': 'flora_specimen', 'photos': 'flora_speciesphoto'}
data = {name: [dict(row) for row in connection.execute(f'SELECT * FROM {table}')] for name, table in tables.items()}
connection.close()
(out / 'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
paths = {row.get(key) for rows in data.values() for row in rows for key in ['photo', 'image', 'model_3d'] if row.get(key)}
for relative in paths:
    file = (source / 'media' / relative).resolve()
    if not file.is_relative_to((source / 'media').resolve()):
        raise ValueError('Media path outside source')
    if not file.is_file():
        raise FileNotFoundError(relative)
    target = out / 'media' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(file, target)
print(json.dumps({'exported': {key: len(rows) for key, rows in data.items()}, 'media_files': len(paths), 'accounts_exported': False}))
