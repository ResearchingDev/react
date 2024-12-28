import bcrypt
import geoip2.database
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime  # Import datetime for timestamps
from server.db import users_collection # Import Mongo wa_users collection
from server.db import login_activity_collection # Import Mongo wa_users collection
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from user_agents import parse

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
                     location = self.get_device_location(ip_address)
                     browser_details = self.get_browser_details(login_device)
                     login_entry = {
                             'user_id': user_id,
                             'login_timestamp': login_timestamp,
                             'login_device': login_device,
                             'ip_address' : ip_address,
                             'device_location' : location,
                             'browser_details' : browser_details,
                             'logout_timestamp' : '',
                        }
                        login_activity_collection.insert_one(login_entry)
                     return Response({'message': 'Data matches!', 'user_id': user_id}, status=status.HTTP_200_OK)
                else:
                     return Response({'message': 'Incorrect password!'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
           
def get_device_location(self, ip_address):
       try:
         reader = geoip2.database.Reader('GeoLite2-City.mmdb')
         response = reader.city(ip_address)
         city = response.city.name if response.city.name else 'Unknown city'
         country = response.country.name if response.country.name else 'Unknown country'
         region = response.subdivisions.most_specific.name if response.subdivisions else 'Unknown region'
         return f"{city}, {region}, {country}"
    except Exception as e:
        return {'city': 'Unknown', 'country': 'Unknown', 'region': 'Unknown', 'coordinates': 'Unknown'}

def get_browser_details(self, user_agent):
    try:
        ua = parse(user_agent)
        browser_details = {
            'browser': ua.browser.family,
            'browser_version': ua.browser.version,
            'os': ua.os.family,
            'os_version': ua.os.version,
            'device': ua.device.family
        }
        return browser_details
    except Exception as e:
        return {'browser': 'Unknown', 'os': 'Unknown', 'device': 'Unknown'}

#CsrfAPIView method used to fetch csrf token details
def CsrfAPIView(request):
    return JsonResponse({'csrfToken': get_token(request)})  

#ForgetPasswordAPIView method used to send email notification for reset password
class ForgetPasswordAPIView(APIView):
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if email:
            try:
                # Find users by email
                existing_users = list(users_collection.find({"email": email}))
                # If no users are found, that means email is not already registered
                if not existing_users:  # Email doesn't exist
                    return Response({"error": "Invalid email address"},status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"message": "Password reset email sent successfully!"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    
#ResetPasswordAPIView method used to check unique code and update password
class ResetPasswordAPIView(APIView):
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        password = request.data.get("password")
        try:
            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  
