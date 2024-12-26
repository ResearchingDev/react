from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import json
USER_DATA = {
    'email': 'user@example.com',
    'password': 'securepassword',
}
def home(request):
    return HttpResponse("Welcome to the homepage!")
@csrf_exempt  # This decorator allows handling POST requests without CSRF verification for simplicity (use it wisely)
def post_data(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body of the request
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Check if the email and password match the user data
            if email == USER_DATA['email'] and password == USER_DATA['password']:
                return JsonResponse({'message': 'Data matches!'}, status=200)
            else:
                return JsonResponse({'message': 'Data does not match!'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format!'}, status=400)
    else:
        return JsonResponse({'message': 'Invalid HTTP method!'}, status=405)

# GET data
def get_data(request):
    # Return the stored data (this could be from a database in a real application)
    return JsonResponse(USER_DATA, status=200)
