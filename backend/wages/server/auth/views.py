import bcrypt
import jwt
import secrets
import requests
import os
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta  # Import datetime for timestamps
from server.db import users_collection # Import Mongo wa_users collection
from server.db import users_role_collection # Import Mongo wa_user_roles collection
from server.db import login_activity_collection # Import Mongo wa_log_history collection
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from user_agents import parse
from django.conf import settings
from django.core.mail import send_mail

#get_public_ip method used to fetch public ip adress if login as local device
def get_public_ip():
    response = requests.get('https://api64.ipify.org?format=json')
    return response.json()['ip']
#get_ip method used to fetch ip address details
def get_ip(request):
    """ Get client IP address even behind proxy or local development """
    ip_address = ''
    
    if request.META.get('HTTP_X_FORWARDED_FOR'):
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR').split(',')[0]
    
    elif request.META.get('HTTP_CLIENT_IP'):
        ip_address = request.META.get('HTTP_CLIENT_IP')
    
    else:
        ip_address = request.META.get('REMOTE_ADDR')

    # Handle localhost during development
    if ip_address == '127.0.0.1' or ip_address == '::1':
        ip_address = get_public_ip()  # Replace with a real IP (e.g., from external API)
    
    return ip_address
def get_location(ip):
    """ Fetch location from geoplugin.net using IP """
    try:
        response = requests.get(f"http://www.geoplugin.net/json.gp?ip={ip}")
        ipdat = response.json()

        if ipdat.get('geoplugin_city') and ipdat.get('geoplugin_region'):
            location = f"{ipdat['geoplugin_city']}, {ipdat['geoplugin_region']}, {ipdat['geoplugin_countryName']}, {ipdat['geoplugin_countryCode']}"
        else:
            location = "Location not found"
        
        return location
    except Exception as e:
        return f"Error: {str(e)}"
    
#checkGetUserRoleExists method used to Check Admin User Role Exists - If not insert and get details
def checkGetUserRoleExists():
    """ Check Admin User Role Exists - If not insert and get details"""
    # Check if the role exists
    existing_userrole = users_role_collection.find_one({"vrole_name": "Admin"})
    
    if existing_userrole:
        # If role exists, return the existing role ID
        return str(existing_userrole['_id'])
    else:
        # Role doesn't exist - Insert new role
        new_role = {
            "vrole_name": "Admin",
            "estatus":"Active",
            "tdeleted_status":0,
            "dcreated_at": datetime.now(),
            "dupdated_at": datetime.now(),
        }
        result = users_role_collection.insert_one(new_role)
        return str(result.inserted_id)
      
#SignupAPIView method used to register user
class SignupAPIView(APIView):
    # @method_decorator(csrf_protect, name='post')  # Apply CSRF protection
    def post(self, request, *args, **kwargs):
        first_name = request.data.get("first_name")
        user_name = request.data.get("user_name")
        email = request.data.get("email")
        password = request.data.get("password")
        phone_number = request.data.get("phone_number")
        
        if first_name and user_name and email and password:
            try:
                #check username or email exists
                existing_users = list(users_collection.find({
                    "$or": [
                        {"vuser_name": user_name},
                        {"vemail": email},
                        {"vphone_number": phone_number},
                    ]
                }))
                
                signup_err = []
                for user in existing_users:
                    if user["vuser_name"] == user_name:
                        signup_err.append({"error": "Username already exists!", "field": "user_name"})
                    if user["vemail"] == email:
                        signup_err.append({"error": "Email already registered!", "field": "email"})
                    if user["vphone_number"] == phone_number:
                        signup_err.append({"error": "Phone number already exists!", "field": "phone_number"})

                if signup_err:
                    return Response(
                        {"errors": signup_err},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    # Hash the password before saving
                    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                    user_role_id = checkGetUserRoleExists()
                    # Create a new user dictionary to store in MongoDB
                    user_data = {
                        'irole_id':user_role_id,
                        "vfirst_name": first_name,
                        "vuser_name": user_name,
                        "vpassword": hashed_password.decode('utf-8'),
                        "vemail": email,
                        "vphone_number": phone_number,
                        'estatus':'Active',
                        'tdeleted_status':0,
                        "dcreated_at": datetime.utcnow(),  # Add current timestamp
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
                    {'vemail': email},  # Match by email
                    {'vuser_name': email}  # Match by username
                ]
            })
            if user_data:
                if bcrypt.checkpw(password.encode('utf-8'), user_data['vpassword'].encode('utf-8')):
                    user_id = str(user_data['_id'])
                    login_timestamp = datetime.now()
                    login_device = request.headers.get('User-Agent', 'Unknown device')
                    ip_address = get_ip(request)
                    location = get_location(ip_address) #socket.gethostbyaddr(ip_address)[0]
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
                    'iuser_id': user_id,
                    'dlogin_date': login_timestamp,
                    'dlogout_date' : '',
                    'vlogin_device': login_device,
                    'vip_address' : ip_address,
                    'vlogin_location' : location,
                    'vbrowser_details' : browser_details,
                    }

                    result_log = login_activity_collection.insert_one(login_entry)
                    log_history_id = str(result_log.inserted_id)
                    user_full_name = f'{user_data.get("vfirst_name", "")} {user_data.get("vlast_name", "")}'.strip()
                    userrole_details = users_role_collection.find_one({"_id": ObjectId(user_data["irole_id"])})
                    user_role_name = userrole_details.get('vrole_name')
                    
                     # Profile image handling
                    user_images = user_data.get('vprofile_image')  # /uploads/sfub8axq_6452543ca1cc7_1683117116.png
                    user_image_path = ""
                    if user_images:
                        # Construct the full path for the profile image
                        image_path = os.path.join(settings.BASE_DIR_MEDIA, user_images.lstrip('/'))
                        image_path_exists = os.path.exists(image_path)
                        if(image_path_exists):
                            user_image_path = user_images
                    return Response({'message': 'Data matches!', 'user_id': user_id,'log_history_id': log_history_id,'user_full_name':user_full_name,'user_role_name':user_role_name,'user_image_path':user_image_path}, status=status.HTTP_200_OK)
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
                    {'$set': {'dlogout_date': logout_timestamp}}
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
                existing_users = users_collection.find_one({"vemail": email})
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
                        "iuser_id": user_id,
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
            user_id = decoded_token['iuser_id']
            
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
                            "vpassword": hashed_password.decode('utf-8'),  # Store hashed password as a string
                            "dupdated_at": datetime.utcnow(),  # Add current timestamp
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
  
