# -*- coding: utf-8 -*-
import json

s = json.load(open('_api-schema.json', encoding='utf-8'))
c = s['components']['schemas']
for name in ['Bank', 'UserBankList', 'WithdrawalSettings']:
    print('\n===', name)
    for key, value in c[name].get('properties', {}).items():
        kind = value.get('type') or value.get('$ref')
        print('  -', key, '|', kind)
