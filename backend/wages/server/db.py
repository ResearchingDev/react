import pymongo;

client = pymongo.MongoClient('mongodb://localhost:27017')
db = client['wages']
users_collection = db['wa_users']
users_role_collection = db['wa_user_roles']