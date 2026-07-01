import json
try:
    with open('swagger.json') as f:
        data = json.load(f)
        for key in data.get('paths', {}).keys():
            if 'management' in key:
                print(key)
                print(json.dumps(data['paths'][key], indent=2))
        
        # if paths doesn't exist, search the whole thing quickly
        if not data.get('paths'):
            print("No paths found")
except Exception as e:
    print(e)
