import bcrypt
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  # Import datetime for timestamps
from server.db import users_collection # Import Mongo wa_users collection
from server.db import users_role_collection # Import Mongo wa_users collection
from django.conf import settings
from django.core.files.storage import default_storage
import random
import string
import json
from rest_framework.parsers import MultiPartParser, FormParser
#UserAPIView method used to create user
class UserAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        user_name = request.data.get("user_name")
        email = request.data.get("email")
        password = request.data.get("password")
        profile_image = request.FILES.get("profile_image")
        user_role = request.data.get("user_role")
        user_status = request.data.get("status")
        if first_name and user_name and email and password:
            try:
                #check username or email exists
                existing_users = list(users_collection.find({
                    "$or": [
                        {"vuser_name": user_name},
                        {"vemail": email}
                    ]
                }))
                user_err = []
                for user in existing_users:
                    if user["vuser_name"] == user_name:
                        user_err.append({"error": "Username already exists!", "field": "user_name"})
                    if user["vemail"] == email:
                        user_err.append({"error": "Email already registered!", "field": "email"})
                if user_err:
                    return Response(
                        {"errors": user_err},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    # Hash the password before saving
                else:
                 hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                   # If a new file is uploaded, save and update the path
                if profile_image:
                    original_file_name = profile_image.name
                    extension = original_file_name.split('.')[-1]
                    new_file_name = f"{generate_random_filename()}_{original_file_name.split('.')[0]}.{extension}"
                    file_path = default_storage.save(f'uploads/{new_file_name}', profile_image)
                    file_url = f'{settings.MEDIA_URL}{file_path}'
                    profile_picture = file_url
                # Create a new user dictionary to store in MongoDB
                user_data = {
                    "irole_id":user_role,
                    "vfirst_name": first_name,
                    "vlast_name": last_name,
                    "vuser_name": user_name,
                    "vpassword": hashed_password.decode('utf-8'),
                    "vemail": email,
                    "vprofile_image": profile_picture,
                    "estatus":user_status,
                    "tdeleted_status": 0,
                    "dcreated_at": datetime.utcnow(),  # Add current timestamp
                    "dupdated_at": None,
                }
                    # Insert the user data into the MongoDB collection
                result = users_collection.insert_one(user_data)
                    # Convert ObjectId to string
                user_data["_id"] = str(result.inserted_id)

                return Response({"message": "User created successfully!", "data": user_data}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Invalid data!"}, status=status.HTTP_400_BAD_REQUEST)
    
def generate_random_filename(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))   
 
class UserListView(APIView):
    def get(self, request):
        try:
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 10))
            skip = (page - 1) * per_page
            query_filter = {"tdeleted_status": 0}
            # Fetch data from MongoDB
            users = users_collection.find(query_filter).skip(skip).limit(per_page)
            total = users_collection.count_documents({})

            # Convert the cursor to a list and ensure _id is a string
            user_list = []
            for user in users:
                user['_id'] = str(user['_id'])  # Convert ObjectId to string
                user_list.append(user)

            return Response({
                "data": user_list,
                "total": total,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserDeleteView(APIView):
    def delete(self, request, user_id):
        try:
            result = users_collection.update_one( 
                {"_id": ObjectId(user_id)},
                {"$set": {"tdeleted_status": 1}}
            )
            if result.modified_count == 1:
                return Response({"message": "User deleted successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UserEditAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        user_name = request.data.get("user_name")
        email = request.data.get("email")
        password = request.data.get("password")
        profile_image = request.FILES.get("profile_image")
        user_role = request.data.get("user_role")
        user_status = request.data.get("status")
        if first_name and user_name and email:
            try:
                existing_user = users_collection.find_one({"vuser_name": user_name})
                hashed_password = existing_user["vpassword"]  # Use the existing password if no new one is provided
                if password:
                    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                   # If a new file is uploaded, save and update the path
                if profile_image:
                    original_file_name = profile_image.name
                    extension = original_file_name.split('.')[-1]
                    new_file_name = f"{generate_random_filename()}_{original_file_name.split('.')[0]}.{extension}"
                    file_path = default_storage.save(f'{new_file_name}', profile_image)
                    file_url = f'{settings.MEDIA_URL}{file_path}'
                    profile_picture = file_url
                edit_user_data = {
                    "irole_id":user_role,
                    "vfirst_name": first_name,
                    "vlast_name": last_name,
                    "vuser_name": user_name,
                    "vpassword": hashed_password,
                    "vemail": email,
                    "vprofile_image": profile_picture,
                    "estatus":user_status,
                    "tdeleted_status": 0,
                    "dupdated_at": datetime.utcnow(),
                }
                if existing_user:
                    # If the role exists, update it
                    update_result = users_collection.update_one(
                        {"_id": ObjectId(existing_user["_id"])},
                        {"$set": edit_user_data}
                    )
                    if update_result.modified_count > 0:
                        return Response({"message": "User updated successfully"})
                    else:
                        return Response({"message": "No changes made to the role"}, status=status.HTTP_304_NOT_MODIFIED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Invalid data!"}, status=status.HTTP_400_BAD_REQUEST)
    
class UserRolesAPIView(APIView):
    def get(self, request):
        # Fetch data with pagination
        records = list(
            users_role_collection.find({"tdeleted_status": {"$ne": 1}}, {})
        )
        for record in records:
            record["_id"] = str(record["_id"])
        return Response({
            "data": records,
        })