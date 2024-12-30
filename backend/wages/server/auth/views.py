import bcrypt
import socket
import jwt
import secrets
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta  # Import datetime for timestamps
from server.db import users_collection # Import Mongo wa_users collection
from server.db import login_activity_collection # Import Mongo wa_log_history collection
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from user_agents import parse
from django.conf import settings
from django.core.mail import send_mail

    
#SignupAPIView method used to register user
class SignupAPIView(APIView):
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
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
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
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
                    user_id = str(user_data['_id'])
                    login_timestamp = datetime.now()
                    login_device = request.headers.get('User-Agent', 'Unknown device')
                    ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
                    location = socket.gethostbyaddr(ip_address)[0]
                    ua = parse(login_device)
                    browser_details = {
                        'browser': ua.browser.family,
                        'browser_version': ua.browser.version,
                        'os': ua.os.family,
                        'os_version': ua.os.version,
                        'device': ua.device.family
                    }
                    browser_details = browser_details
                    
                    login_entry = {
                    'user_id': user_id,
                    'login_timestamp': login_timestamp,
                    'login_device': login_device,
                    'ip_address' : ip_address,
                    'device_location' : location,
                    'browser_details' : browser_details,
                    'logout_timestamp' : '',
                    }

                    result_log = login_activity_collection.insert_one(login_entry)
                    log_history_id = str(result_log.inserted_id)
                    return Response({'message': 'Data matches!', 'user_id': user_id, 'log_history_id': log_history_id}, status=status.HTTP_200_OK)
                else:
                     return Response({'message': 'Incorrect password!'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

#CsrfAPIView method used to fetch csrf token details
def CsrfAPIView(request):
    return JsonResponse({'csrfToken': get_token(request)})  

class SignoutAPIView(APIView):
    def post(self, request):
        try:
            data = request.data
            log_history_id = data.get('log_history_id')  
            if log_history_id:
                log_history_id = ObjectId(log_history_id)
                logout_timestamp = datetime.now()
                login_activity_collection.update_one(
                    {'_id': log_history_id}, 
                    {'$set': {'logout_timestamp': logout_timestamp}}
                )
                return Response({'message': 'User logged out successfully!'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'No active session found for the user!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
#ForgetPasswordAPIView method used to send email notification for reset password
class ForgetPasswordAPIView(APIView):
    
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if email:
            try:
                # Find users by email
                existing_users = users_collection.find_one({"email": email})
                # If no users are found, that means email is not already registered
                if not existing_users:  # Email doesn't exist
                    return Response({"error": "Invalid email address"},status=status.HTTP_400_BAD_REQUEST)
                else:
                    # Generate a random secret key
                    secret_key = secrets.token_urlsafe(32)
                    # jwt token expiration
                    token_expiration_hr = 1
                    # Access the user's unique _id
                    user_id = str(existing_users['_id'])
                    # Generate JWT token with user info
                    payload = {
                        "user_id": user_id,
                        "exp": datetime.utcnow() + timedelta(hours=token_expiration_hr)
                    }
                    token = jwt.encode(payload, settings.JWT_SECRET_KEY , algorithm='HS256')
                    
                    # Construct the reset link
                    reset_link = f"{settings.DJANGO_PUBLIC_API_BASE_URL}/auth/reset/{token}"
                    
                    # Send the email
                    # send_mail(
                    #     'Password Reset Request',
                    #     f'Click the link to reset your password: {reset_link}',
                    #     settings.DEFAULT_FROM_EMAIL,
                    #     [email],
                    #     fail_silently=False,
                    # )
                    return Response({"message": "Password reset email sent successfully!","token":token}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    
#ResetPasswordAPIView method used to check unique code and update password
class ResetPasswordAPIView(APIView):
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        try:
            # Decode the JWT token to extract user information
            decoded_token = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token['user_id']
            
            # Find the user in MongoDB
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            
            if user:
                # Hash the new password before storing it
                hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
                
                # Update the user's password in MongoDB
                result = users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {
                        "$set": {
                            "password": hashed_password.decode('utf-8'),  # Store hashed password as a string
                            "confirm_password": new_password,  # Store plain password (NOT recommended for production)
                            "updated_at": datetime.utcnow(),  # Add current timestamp
                        }
                    }
                )
                if result.modified_count > 0:
                    return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Failed to update password"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
