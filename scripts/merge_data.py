#!/usr/bin/env python3
"""Merges generated data files into the main Selah data files."""

import json
import sys
from pathlib import Path

DATA = Path(__file__).parent.parent / 'src' / 'data'

def merge_json(existing_path, new_path, id_field='id'):
    existing = json.loads(existing_path.read_text())
    new_entries = json.loads(new_path.read_text())
    existing_ids = {e[id_field] for e in existing}
    added = [e for e in new_entries if e[id_field] not in existing_ids]
    merged = existing + added
    existing_path.write_text(json.dumps(merged, indent=2, ensure_ascii=False))
    return len(added), len(existing)

def main():
    tasks = [
        ('characters.json', 'new_chars_ot1.json'),
        ('characters.json', 'new_chars_ot2.json'),
        ('characters.json', 'new_chars_nt.json'),
        ('words.json',      'new_words.json'),
        ('locations.json',  'new_locations.json'),
    ]

    for target, source in tasks:
        target_path = DATA / target
        source_path = DATA / source
        if not source_path.exists():
            print(f'  SKIP {source} (not found)')
            continue
        added, before = merge_json(target_path, source_path)
        after = before + added
        print(f'  {target}: {before} → {after} (+{added} from {source})')

if __name__ == '__main__':
    print('Merging data files...')
    main()
    print('Done.')
