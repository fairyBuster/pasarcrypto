# -*- coding: utf-8 -*-
import json

s = json.load(open('_api-schema.json', encoding='utf-8'))
paths = [p for p in s['paths'] if 'balance-statistics' in p]
print('PATHS:', paths)
for p in paths:
    get = s['paths'][p]['get']
    schema = get['responses']['200']['content']['application/json']['schema']
    print('\n', p, '->', json.dumps(schema)[:300])

names = [n for n in s['components']['schemas'] if 'tatistic' in n or 'AllTime' in n or 'all_time' in n]
print('\nSCHEMAS:', names)
for n in names:
    props = s['components']['schemas'][n].get('properties', {})
    print('\n', n, len(props))
    for key, value in props.items():
        print('  -', key, '|', value.get('type'))
