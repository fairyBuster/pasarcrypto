# -*- coding: utf-8 -*-
import json

s = json.load(open('_api-schema.json', encoding='utf-8'))
get = s['paths']['/api/transactions/']['get']
params = get.get('parameters', [])
print('QUERY PARAMS:', [(p['name'], p['in']) for p in params])
schema = get['responses']['200']['content']['application/json']['schema']
print('RESPONSE SCHEMA:', json.dumps(schema)[:400])

name = schema['$ref'].split('/')[-1]
sch = s['components']['schemas'][name]
print('LIST FIELDS:', list(sch.get('properties', {}).keys()))
items = sch['properties']['results']['items']
item_name = items['$ref'].split('/')[-1]
item = s['components']['schemas'][item_name]
print('ITEM:', item_name, list(item['properties'].keys()))
for key, value in item['properties'].items():
    print(' -', key, json.dumps(value)[:180])

