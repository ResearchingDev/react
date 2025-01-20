from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  
from server.db import holiday_collection 
from ...serializers import HolidaySerializer  # Import the serializer
from bson import ObjectId
import json

class HolidayAddOrUpdate(APIView):
    def post(self, request):
        try:
            serializer = HolidaySerializer(data=request.data)
            if serializer.is_valid():
                holiday = serializer.validated_data['holiday']
                status_input = serializer.validated_data['status']
                data = request.data  
                # Check if '_id' is present (optional)
                role_id = data.get('_id')  # This will return None if '_id' is not present
                # Check if the role already exists
                if role_id and role_id!='':
                    _id = request.data.get('_id')
                    # If the role exists, update it
                    duplicate_user_role = list(holiday_collection.find({
                        "$or": [
                            {"vholiday": holiday}
                        ],
                        "_id": {"$ne": ObjectId(_id)}
                    }))
                    u_holiday_err = []
                    for user_role_v in duplicate_user_role:
                        if user_role_v["vholiday"] == holiday:
                           u_holiday_err.append({"error": "Holiday already exists!", "field": "holiday"})
                    if u_holiday_err:
                        return Response(
                            {"errors": u_holiday_err},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        updated_role = holiday_collection.update_one(
                            {"_id": ObjectId(_id)},  # Ensure item_id is converted to ObjectId
                            {
                                "$set": {
                                    "vholiday": holiday,
                                    "estatus": status_input,
                                    "dupdated_at": datetime.utcnow()  # Add current timestamp inside $set
                                }
                            }
                        )
                        if updated_role.modified_count > 0:
                            return Response({"message": "Holiday updated successfully"})
                        else:
                            return Response({"message": "No changes made to the role"}, status=status.HTTP_304_NOT_MODIFIED)
                else:
                    existing_holiday = list(holiday_collection.find({
                        "$or": [
                            {"vholiday": holiday},
                        ]
                    }))
                    holiday_err = []
                    for holiday in existing_holiday:
                     if holiday["vholiday"] == holiday:
                        holiday_err.append({"error": "Holiday already exists!", "field": "holiday"})
                    if holiday_err:
                        return Response(
                            {"errors": holiday_err},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        # If the role does not exist, create a new one
                        new_role = {
                            "vholiday": holiday,
                            "estatus": status_input,
                            "tdeleted_status": 0,
                            "dcreated_at": datetime.utcnow(),  # Add current timestamp
                            "dupdated_at": "",
                        }
                        result = holiday_collection.insert_one(new_role)
                        return Response(
                            {
                                "message": "Holiday Created successfully",
                                "holiday_id": str(result.inserted_id)
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

class HolidayListView(APIView):
    def get(self, request):
        # Pagination parameters
        page = int(request.GET.get("page", 1))
        rows_per_page = int(request.GET.get("per_page", 10))
        skip = (page - 1) * rows_per_page
        # Fetch data with pagination
        total_records = holiday_collection.count_documents({"tdeleted_status": "0"})
        records = list(
            holiday_collection.find({"tdeleted_status": {"$ne": 1}})
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
    
class DeleteHoliday(APIView):
    def delete(self, request, item_id):
        leave_list = list(holiday_collection.find({'_id': item_id}))
        if len(leave_list) > 0:
            return Response({"message": "Holiday is already assigned to user"}, status=204)
        else:
            updated_holiday = holiday_collection.update_one(
                {"_id": ObjectId(item_id)},  # Ensure item_id is converted to ObjectId
                {
                    "$set": {
                        "tdeleted_status": 1,
                        "dupdated_at": datetime.utcnow()  # Add current timestamp inside $set
                    }
                }
            )
            if updated_holiday.modified_count > 0:
                return Response({"message": "Holiday deleted successfully."}, status=200)
            else:
                return Response({"error": "Holiday not found."}, status=404)