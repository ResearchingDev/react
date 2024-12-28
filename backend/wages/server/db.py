import pymongo;

client = pymongo.MongoClient('mongodb://localhost:27017')
db = client['wages']
users_collection = db['wa_users']
users_role_collection = db['wa_user_roles']
login_activity_collection = db['wa_log_history']