from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  # Import datetime for timestamps
from server.db import users_role_collection # Import Mongo wa_users collection
from server.db import users_collection # Import Mongo wa_users collection
from server.db import wa_modules # Import Mongo wa_modules collection
from server.db import user_role_rights # Import Mongo user_role_rights collection
from django.views.decorators.csrf import csrf_exempt
from ..serializers import RoleSerializer  # Import the serializer
from bson import ObjectId
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings
import random
import string
import json

class RoleAddOrUpdate(APIView):
    def post(self, request):
        try:
            serializer = RoleSerializer(data=request.data)
            if serializer.is_valid():
                userrole = serializer.validated_data['userRole']
                status_input = serializer.validated_data['status']
                data = request.data  # Get the incoming data
                # Check if '_id' is present (optional)
                role_id = data.get('_id')  # This will return None if '_id' is not present
                permissions = data.get('permissions', {})
                # Check if the role already exists
                if role_id and role_id!='':
                    _id = request.data.get('_id')
                    # If the role exists, update it
                    duplicate_user_role = list(users_role_collection.find({
                        "$or": [
                            {"vrole_name": userrole}
                        ],
                        "_id": {"$ne": ObjectId(_id)}
                    }))
                    u_role_err = []
                    for user_role_v in duplicate_user_role:
                        if user_role_v["vrole_name"] == userrole:
                           u_role_err.append({"error": "User Role already exists!", "field": "userRole"})
                    if u_role_err:
                        return Response(
                            {"errors": u_role_err},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        updated_role = users_role_collection.update_one(
                            {"_id": ObjectId(_id)},  # Ensure item_id is converted to ObjectId
                            {
                                "$set": {
                                    "vrole_name": userrole,
                                    "estatus": status_input,
                                    "dupdated_at": datetime.utcnow()  # Add current timestamp inside $set
                                }
                            }
                        )
                        if updated_role.modified_count > 0:
                            user_role_rights.delete_many({"iUserRoleId": _id})
                            new_role_id = _id
                        else:
                            return Response({"message": "No changes made to the role"}, status=status.HTTP_304_NOT_MODIFIED)
                else:
                    existing_user_role = list(users_role_collection.find({
                        "$or": [
                            {"vrole_name": userrole},
                        ]
                    }))
                    user_role_err = []
                    for user_role in existing_user_role:
                     if user_role["vrole_name"] == userrole:
                        user_role_err.append({"error": "User Role already exists!", "field": "userRole"})
                    if user_role_err:
                        return Response(
                            {"errors": user_role_err},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        # If the role does not exist, create a new one
                        new_role = {
                            "vrole_name": userrole,
                            "estatus": status_input,
                            "tdeleted_status": 0,
                            "dcreated_at": datetime.utcnow(),  # Add current timestamp
                            "dupdated_at": "",
                        }
                        result = users_role_collection.insert_one(new_role)
                        new_role_id = result.inserted_id
                        
            # Insert permissions (only once)
            print(f"Inserted {permissions} permission entries")
            permission_entries = [
                {
                    "iUserRoleId": new_role_id,
                    "iModuleId": str(module_id),
                    "isAll": int(bool(sections.get("isAll"))),
                    "isList": int(bool(sections.get("isList"))),
                    "isView": int(bool(sections.get("isView"))),
                    "isAdd": int(bool(sections.get("isAdd"))),
                    "isUpdate": int(bool(sections.get("isUpdate"))),
                    "isDelete": int(bool(sections.get("isDelete"))),
                    "isExport": int(bool(sections.get("isExport"))),
                    "dAddedDate": datetime.utcnow()
                }
                for module_id, sections in permissions.items()
            ]
            
            if permission_entries:
                user_role_rights.insert_many(permission_entries)
                if role_id and role_id!='':
                    return Response({"message": "Role updated successfully","role_id": new_role_id})
                else:
                    return Response(
                            {
                                "message": "Role Created successfully",
                                "role_id": str(result.inserted_id)
                            },
                            status=status.HTTP_201_CREATED
                        )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid JSON payload"},
                status=status.HTTP_400_BAD_REQUEST
            )

class RecordListView(APIView):
    def get(self, request):
        # Pagination parameters
        page = int(request.GET.get("page", 1))
        rows_per_page = int(request.GET.get("per_page", 10))
        skip = (page - 1) * rows_per_page
        # Fetch data with pagination
        total_records = users_role_collection.count_documents({"tdeleted_status": "0"})
        records = list(
            users_role_collection.find({"tdeleted_status": {"$ne": 1}}, {"vrole_name":1,"estatus":1})
                      .skip(skip)
                      .limit(rows_per_page)
        )
        # wa_module_list = list(
        #     wa_modules.find({"iSysRecDeleted": {"$ne": 1}})
        # )

        pipeline = [
    {
        # Step 1: Match and fetch modules where 'iSysRecDeleted' is not 1
        "$match": {
            "iSysRecDeleted": { "$ne": 1 }
        }
    },
    {
        # Step 2: Use $lookup to join with the user_role_rights collection
        "$lookup": {
            "from": "user_role_rights",  # The target collection
            "let": { "moduleId": "$iModuleId","roleId": "$iUserRoleId" },  # Variables from the modules collection
            "pipeline": [
                {
                    "$match": {
                        "$expr": {
                            "$and": [
                                { "$eq": ["$iModuleId", "$$moduleId"] },
                                { "$eq": ["$iUserRoleId", "$$roleId"] },
                                { "$eq": ["$iSysRecDeleted", 0] }
                            ]
                        }
                    }
                },
                {
                    "$project": {  # Select only the relevant fields to return
                        "isAll": 1,
                        "isList": 1,
                        "isView": 1,
                        "isAdd": 1,
                        "isUpdate": 1,
                        "isDelete": 1,
                        "isExport": 1
                    }
                }
            ],
            "as": "roleRights"  # Name of the field to store the joined results
        }
    },
    {
        # Step 3: Unwind the 'roleRights' array so we can add its data to each module
        "$unwind": {
            "path": "$roleRights",  # Unwind the array
            "preserveNullAndEmptyArrays": True  # Ensure we keep the module even if no rights are found
        }
    },
    {
        "$addFields": {
            "isAll": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isAll", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            },
            "isList": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isList", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            },
            "isView": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isView", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            },
            "isAdd": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isAdd", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            },
            "isUpdate": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isUpdate", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            },
            "isDelete": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isDelete", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            },
            "isExport": {
                "$cond": {
                    "if": { "$eq": [{ "$ifNull": ["$roleRights.isExport", False] }, True] },
                    "then": 1,
                    "else": 0
                }
            }
        }
    },
    {
        # Step 5: Optionally, sort the results by 'iSequenceNo'
        "$sort": { "iSequenceNo": 1 }
    }
]

        # Execute the aggregation pipeline on your MongoDB collection
        wa_module_list = list(wa_modules.aggregate(pipeline))
        for record in records:
            record["_id"] = str(record["_id"])
        for module in wa_module_list:
            module["_id"] = str(module["_id"])
        return Response({
            "total": total_records,
            "data": records,
            "modules": wa_module_list,
            "page": page,
            "per_page": rows_per_page,
        })
    
class ProfileList(APIView):
    def get(self, request):
        try:
            # Assuming the username is stored in the session
            Id = request.GET.get('id')
            if not Id:
                return Response({'error': 'User not logged in'}, status=401)
            object_id = ObjectId(Id)
            # Find the user profile from MongoDB
            user_profile = users_collection.find_one({'_id': object_id})
            
            if not user_profile:
                return Response({'error': 'User profile not found'}, status=404)

            # Prepare the response data
            response_data = {
                'vfirst_name': user_profile['vfirst_name'],
                'vuser_name': user_profile.get('vuser_name'),
                'vemail': user_profile.get('vemail'),
                'vphone_number': user_profile.get('vphone_number'),
                'profile_picture': user_profile.get('vprofile_image')
            }

            return Response(response_data)

        except Exception as e:
            return Response({'error': f'Error fetching profile: {str(e)}'}, status=500)
    

class ProfileAddOrUpdate(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        user_id = request.data.get('id')  # The MongoDB Object ID
        username = request.data.get('username')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        phone_number = request.data.get('vphone_number', None)
        file = request.data.get('file')

        if not user_id:
            return Response({'error': 'ID is required'}, status=400)

        # Validate ObjectId
        try:
            object_id = ObjectId(user_id)
        except Exception as e:
            return Response({'error': 'Invalid ID format'}, status=400)
        
        duplicate_user = list(users_collection.find({
            "$or": [
                {"vuser_name": username},
                {"vemail": email},
                {"vphone_number": phone_number}
            ],
            "_id": {"$ne": ObjectId(user_id)}
        }))
        u_err = []
        for user in duplicate_user:
            if user["vuser_name"] == username:
                u_err.append({"error": "Username already exists!", "field": "username"})
            if user["vemail"] == email:
                u_err.append({"error": "Email already exists!", "field": "email"})
            if user["vphone_number"] == phone_number:
                u_err.append({"error": "Phone number already exists!", "field": "phone_number"})
        if u_err:
            return Response(
                {"errors": u_err},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Prepare update data
            update_data = {}
            if username:
                update_data['vuser_name'] = username
            if email:
                update_data['vemail'] = email
            if first_name:
                update_data['vfirst_name'] = first_name
            if phone_number:
                update_data['vphone_number'] = phone_number

            # If a new file is uploaded, save and update the path
            if file:
                original_file_name = file.name
                extension = original_file_name.split('.')[-1]
                new_file_name = f"{generate_random_filename()}_{original_file_name.split('.')[0]}.{extension}"
                file_path = default_storage.save(f'{new_file_name}', file)
                file_url = f'{settings.MEDIA_URL}{file_path}'
                update_data['vprofile_image'] = file_url

            # Update in MongoDB
            result = users_collection.update_one({'_id': object_id}, {'$set': update_data})
            user_image_path = ""
            if file and update_data['vprofile_image']:
                user_image_path = update_data['vprofile_image']
            if result.matched_count == 0:
                return Response({'error': 'User not found'}, status=404)

        return Response({'message': 'Profile Updated Successfully','user_image_path':user_image_path}, status=200)

def generate_random_filename(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

class DeleteItemView(APIView):
    def delete(self, request, item_id):
        users_with_role = list(users_collection.find({'irole_id': item_id}))
        if len(users_with_role) > 0:
            return Response({"message": "Role is already assigned to user"}, status=204)
        else:
            updated_role = users_role_collection.update_one(
                {"_id": ObjectId(item_id)},  # Ensure item_id is converted to ObjectId
                {
                    "$set": {
                        "tdeleted_status": 1,
                        "dupdated_at": datetime.utcnow()  # Add current timestamp inside $set
                    }
                }
            )
            if updated_role.modified_count > 0:
                return Response({"message": "Role deleted successfully."}, status=200)
            else:
                return Response({"error": "Role not found."}, status=404)
            
class GetMenuList(APIView):
    def get(self, request):
        menus = list(wa_modules.find({}, {"_id": 1, "vModuleName": 1, "tModuleUrl": 1, "iParentId": 1, "tIcon": 1}))

        # Convert ObjectId to string
        for menu in menus:
            menu["_id"] = str(menu["_id"])
        
        return Response({"menus": menus}, status=200)