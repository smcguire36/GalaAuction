#!/usr/bin/env python3
import csv,sys,os,tempfile

if len(sys.argv) < 2:
    print('Usage: trim_itemname.py <path-to-csv>')
    sys.exit(2)

path = sys.argv[1]

# Try common encodings
encodings = ['utf-8', 'utf-8-sig', 'cp1252']
rows = None
for enc in encodings:
    try:
        with open(path, newline='', encoding=enc) as f:
            reader = csv.reader(f)
            rows = list(reader)
        encoding_used = enc
        break
    except Exception:
        rows = None

if rows is None:
    print('ERROR: Could not read file with common encodings')
    sys.exit(3)

if not rows:
    print('EMPTY')
    sys.exit(0)

header = rows[0]
# Find ItemName column (case-insensitive, ignore spaces)
idx = None
for i,h in enumerate(header):
    if h is None:
        continue
    if h == 'ItemName' or h.replace(' ','').lower() == 'itemname':
        idx = i
        break

if idx is None:
    print('COLUMN_NOT_FOUND')
    sys.exit(4)

changed = 0
for r in rows[1:]:
    if idx < len(r):
        new = r[idx].strip()
        if new != r[idx]:
            r[idx] = new
            changed += 1

# Write back using same encoding
dirn = os.path.dirname(path)
fd, tmp = tempfile.mkstemp(dir=dirn, text=True)
os.close(fd)
try:
    with open(tmp, 'w', newline='', encoding=encoding_used) as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    os.replace(tmp, path)
except Exception as e:
    try:
        os.remove(tmp)
    except Exception:
        pass
    print('ERROR_WRITE', str(e))
    sys.exit(5)

print('DONE', changed)
