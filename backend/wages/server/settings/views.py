from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  
from server.db import leave_type_collection 
from server.db import users_collection # Import Mongo wa_users collection
from ..serializers import LeaveSerializer  # Import the serializer
from bson import ObjectId
import json

class LeaveTypeAddOrUpdate(APIView):
    def post(self, request):
        try:
            serializer = LeaveSerializer(data=request.data)
            if serializer.is_valid():
                leavetype = serializer.validated_data['leavetype']
                status_input = serializer.validated_data['status']
                data = request.data  
                # Check if '_id' is present (optional)
                role_id = data.get('_id')  # This will return None if '_id' is not present
                # Check if the role already exists
                if role_id and role_id!='':
                    _id = request.data.get('_id')
                    # If the role exists, update it
                    duplicate_user_role = list(leave_type_collection.find({
                        "$or": [
                            {"vleave_type": leavetype}
                        ],
                        "_id": {"$ne": ObjectId(_id)}
                    }))
                    u_role_err = []
                    for user_role_v in duplicate_user_role:
                        if user_role_v["vleave_type"] == leavetype:
                           u_role_err.append({"error": "Leave type already exists!", "field": "leavetype"})
                    if u_role_err:
                        return Response(
                            {"errors": u_role_err},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        updated_role = leave_type_collection.update_one(
                            {"_id": ObjectId(_id)},  # Ensure item_id is converted to ObjectId
                            {
                                "$set": {
                                    "vleave_type": leavetype,
                                    "estatus": status_input,
                                    "dupdated_at": datetime.utcnow()  # Add current timestamp inside $set
                                }
                            }
                        )
                        if updated_role.modified_count > 0:
                            return Response({"message": "Leave Type updated successfully"})
                        else:
                            return Response({"message": "No changes made to the role"}, status=status.HTTP_304_NOT_MODIFIED)
                else:
                    existing_user_role = list(leave_type_collection.find({
                        "$or": [
                            {"vleave_type": leavetype},
                        ]
                    }))
                    user_role_err = []
                    for user_role in existing_user_role:
                     if user_role["vleave_type"] == leavetype:
                        user_role_err.append({"error": "Leave Type already exists!", "field": "leavetype"})
                    if user_role_err:
                        return Response(
                            {"errors": user_role_err},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        # If the role does not exist, create a new one
                        new_role = {
                            "vleave_type": leavetype,
                            "estatus": status_input,
                            "tdeleted_status": 0,
                            "dcreated_at": datetime.utcnow(),  # Add current timestamp
                            "dupdated_at": "",
                        }
                        result = leave_type_collection.insert_one(new_role)
                        return Response(
                            {
                                "message": "Leave Type Created successfully",
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

class LeaveTypeListView(APIView):
    def get(self, request):
        # Pagination parameters
        page = int(request.GET.get("page", 1))
        rows_per_page = int(request.GET.get("per_page", 10))
        skip = (page - 1) * rows_per_page
        # Fetch data with pagination
        total_records = leave_type_collection.count_documents({"tdeleted_status": "0"})
        records = list(
            leave_type_collection.find({"tdeleted_status": {"$ne": 1}})
                      .skip(skip)
                      .limit(rows_per_page)
        )
        for record in records:
            record["_id"] = str(record["_id"])
        return Response({
            "total": total_records,
            "data": records,
            "page": page,
            "per_page": rows_per_page,
        })
    
class DeleteLeaveType(APIView):
    def delete(self, request, item_id):
        users_with_role = list(users_collection.find({'irole_id': item_id}))
        if len(users_with_role) > 0:
            return Response({"message": "Role is already assigned to user"}, status=204)
        else:
            updated_role = leave_type_collection.update_one(
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