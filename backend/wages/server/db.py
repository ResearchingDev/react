import pymongo;

client = pymongo.MongoClient('mongodb://localhost:27017')
db = client['wages']
users_collection = db['wa_users']
users_role_collection = db['wa_user_roles']
login_activity_collection = db['wa_log_history']
leave_type_collection = db['wa_leave_type']
holiday_collection = db['wa_holiday']
wa_modules = db['wa_modules']
