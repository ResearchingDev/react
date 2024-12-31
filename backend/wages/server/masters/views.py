from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  # Import datetime for timestamps
from server.db import users_role_collection # Import Mongo wa_users collection
from django.views.decorators.csrf import csrf_exempt
from ..serializers import RoleSerializer  # Import the serializer
import json

class RoleAddOrUpdate(APIView):
    def post(self, request):
        try:
            serializer = RoleSerializer(data=request.data)
            if serializer.is_valid():
                userrole = serializer.validated_data['userrole']
                status_input = serializer.validated_data['status']
                
                # Check if the role already exists
                existing_role = users_role_collection.find_one({"userrole": userrole})

                if existing_role:
                    # If the role exists, update it
                    updated_role = users_role_collection.update_one(
                        {"userrole": userrole},
                        {"$set": {"status": status_input}}
                    )
                    if updated_role.modified_count > 0:
                        return Response({"message": "Role updated successfully"})
                    else:
                        return Response({"message": "No changes made to the role"}, status=status.HTTP_304_NOT_MODIFIED)
                else:
                    # If the role does not exist, create a new one
                    new_role = {
                        "userrole": userrole,
                        "status": status_input
                    }
                    result = users_role_collection.insert_one(new_role)
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
        total_records = users_role_collection.count_documents({})
        records = list(
            users_role_collection.find({}, {"_id": 0})
                      .skip(skip)
                      .limit(rows_per_page)
        )
        return Response({
            "total": total_records,
            "data": records,
            "page": page,
            "per_page": rows_per_page,
        })
