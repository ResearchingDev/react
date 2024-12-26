from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from .db import collection
class PostDataView(APIView):
    def post(self, request):
        try:
            data = request.data  
            email = data.get('email')
            password = data.get('password')
             if not email or not password:
                   return Response({'message': 'Email and password are required!'}, status=status.HTTP_400_BAD_REQUEST)
             user_data = collection.find_one({
                '$or': [
                    {'email': email},  # Match by email
                    {'username': email}  # Match by username
                ]
            })
            if user_data:
                if password == user_data['password']:
                     return Response({'message': 'Data matches!'}, status=status.HTTP_200_OK)
                else:
                     return Response({'message': 'Incorrect password!'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetDataView(APIView):
    def get(self, request):
        return Response(USER_DATA, status=status.HTTP_200_OK)
