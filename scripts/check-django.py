from pathlib import Path
import hashlib, json
root = Path(__file__).resolve().parents[1]
source = root.parent / 'bosque-vivo'
skip = {'.venv', 'node_modules', '__pycache__', 'work', 'staticfiles'}
before = json.loads((root / 'work/django-before.json').read_text(encoding='utf-8'))
after = {str(p.relative_to(source)).replace('\\', '/'): hashlib.sha256(p.read_bytes()).hexdigest() for p in source.rglob('*') if p.is_file() and not any(x in skip for x in p.relative_to(source).parts)}
differences = [name for name in before.keys() | after.keys() if before.get(name) != after.get(name)]
result = {'files_checked': len(after), 'changes': differences, 'excluded_runtime_directories': sorted(skip)}
(root / 'work/django-integrity.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result))
if differences:
    raise SystemExit(1)
