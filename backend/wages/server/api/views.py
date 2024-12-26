from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
USER_DATA = {
    'email': 'user@example.com',
    'password': 'securepassword',
}
class PostDataView(APIView):
    def post(self, request):
        try:
            data = request.data  
            email = data.get('email')
            password = data.get('password')
            if email == USER_DATA['email'] and password == USER_DATA['password']:
                return Response({'message': 'Data matches!'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Data does not match!'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetDataView(APIView):
    def get(self, request):
        return Response(USER_DATA, status=status.HTTP_200_OK)
