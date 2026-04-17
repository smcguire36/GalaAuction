import json
import csv

# Load all three JSON files
files = [
    'Gala-2026-Items-Page1.json',
    'Gala-2026-Items-Page2.json',
    'Gala-2026-Items-Page3.json'
]

# Collect all items
all_items = []

for filename in files:
    with open(filename, 'r') as f:
        data = json.load(f)
        all_items.extend(data)

# Extract the required fields and write to CSV
with open('Gala-2026-Items.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['Title', 'BidIncrement', 'Number', 'StartingBid']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    # Write header
    writer.writeheader()
    
    # Write rows
    for item in all_items:
        writer.writerow({
            'Title': item.get('Title', ''),
            'BidIncrement': item.get('BidIncrement', ''),
            'Number': item.get('Number', ''),
            'StartingBid': item.get('StartingBid', '')
        })

print(f"CSV file created successfully with {len(all_items)} items")
