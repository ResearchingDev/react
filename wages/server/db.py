import pymongo;

client = pymongo.MongoClient('mongodb://localhost:27017')
db = client['wages']
collection = db['wa_users']