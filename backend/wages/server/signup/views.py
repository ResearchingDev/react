from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

class SignupAPIView(APIView):
    def post(self, request, *args, **kwargs):
        print("Request data:", request.data)
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if username and email and password:
            try:
                user = User.objects.create_user(username=username, email=email, password=password)
                return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Invalid data!"}, status=status.HTTP_400_BAD_REQUEST)
