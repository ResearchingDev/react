"""
URL configuration for wages project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from server.auth.views import SignupAPIView, SigninAPIView, CsrfAPIView, ForgetPasswordAPIView, ResetPasswordAPIView, SignoutAPIView
from server.users.views import UserAPIView,UserListView,UserDeleteView
from server.masters.views import RoleAddOrUpdate, RecordListView, ProfileList, ProfileAddOrUpdate, DeleteItemView
from server.views import home  # Import the new view
urlpatterns = [
    path('', home, name='home'),  # Add root URL pattern
    path('admin/', admin.site.urls),
    path('api/signup/', SignupAPIView.as_view(), name='signup'), # Signup API
    path('api/signin/', SigninAPIView.as_view(), name='signin'), # Signin API
    path('api/csrf-token/', CsrfAPIView, name='csrf_token'), # CSRF Token API
    path('api/forgot-password/', ForgetPasswordAPIView.as_view(), name='forgot_password'), # Forget Password API
    path('api/reset-password/', ResetPasswordAPIView.as_view(), name='reset_password'), # Reset Password API
    path('api/manageuserrole/', RoleAddOrUpdate.as_view(), name='manageuserrole'), # Manage User Roles API
    path('api/records/', RecordListView.as_view(), name='record-list'),
    path('api/signout/', SignoutAPIView.as_view(), name='signout'), # Signout API
    path('api/add-user/', UserAPIView.as_view(), name='add_user'), # Add User API
    path('api/user-list/', UserListView.as_view(), name='user_list'),# List User API
    path('api/delete-user/<str:user_id>/', UserDeleteView.as_view(), name='delete_user'),# Delete User API
    path('api/profile/', ProfileList.as_view(), name='profile-list'),
    path('api/updateprofile/', ProfileAddOrUpdate.as_view(), name='updateprofile'), # Manage User Roles API
    path('api/delete-item/<str:item_id>/', DeleteItemView.as_view(), name='delete-item'),
    
]

