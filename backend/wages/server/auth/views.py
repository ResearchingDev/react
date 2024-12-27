import bcrypt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  # Import datetime for timestamps
from server.db import users_collection # Import Mongo wa_users collection
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator

#SignupAPIView method used to register user
class SignupAPIView(APIView):
    @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        first_name = request.data.get("first_name")
        user_name = request.data.get("user_name")
        email = request.data.get("email")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if first_name and user_name and email and password:
            try:
                #check username or email exists
                existing_users = list(users_collection.find({
                    "$or": [
                        {"user_name": user_name},
                        {"email": email}
                    ]
                }))
                
                signup_err = []
                for user in existing_users:
                    if user["user_name"] == user_name:
                        signup_err.append({"error": "Username already exists!", "field": "user_name"})
                    if user["email"] == email:
                        signup_err.append({"error": "Email already registered!", "field": "email"})

                if signup_err:
                    return Response(
                        {"errors": signup_err},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    # Hash the password before saving
                    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

                    # Create a new user dictionary to store in MongoDB
                    user_data = {
                        "first_name": first_name,
                        "user_name": user_name,
                        "email": email,
                        "password": hashed_password.decode('utf-8'),
                        "confirm_password": confirm_password,  # Store the hashed password as a string
                        'role_id':1,
                        'status':'Active',
                        "created_at": datetime.utcnow(),  # Add current timestamp
                    }
                    # Insert the user data into the MongoDB collection
                    result = users_collection.insert_one(user_data)
                    
                    # Convert ObjectId to string
                    user_data["_id"] = str(result.inserted_id)

                    return Response({"message": "User created successfully!", "data": user_data}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Invalid data!"}, status=status.HTTP_400_BAD_REQUEST)

#SigninAPIView method used to signin user  
class SigninAPIView(APIView):
    @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request):
        try:
            data = request.data  
            email = data.get('email')
            password = data.get('password')
            if not email or not password:
                   return Response({'message': 'Email and password are required!'}, status=status.HTTP_400_BAD_REQUEST)
            user_data = users_collection.find_one({
                '$or': [
                    {'email': email},  # Match by email
                    {'user_name': email}  # Match by username
                ]
            })
            if user_data:
                if bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
                     return Response({'message': 'Data matches!'}, status=status.HTTP_200_OK)
                else:
                     return Response({'message': 'Incorrect password!'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#CsrfAPIView method used to fetch csrf token details
def CsrfAPIView(request):
    return JsonResponse({'csrfToken': get_token(request)})    
