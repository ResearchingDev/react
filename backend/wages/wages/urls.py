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
from server.users.views import UserAPIView,UserListView,UserDeleteView,UserEditAPIView,UserRolesAPIView
from server.masters.views import RoleAddOrUpdate, RecordListView, ProfileList, ProfileAddOrUpdate, DeleteItemView
from server.settings.leave_type.views import LeaveTypeAddOrUpdate,LeaveTypeListView,DeleteLeaveType
from server.settings.holiday.views import HolidayAddOrUpdate,HolidayListView,DeleteHoliday
from server.views import home  # Import the new view
from django.conf import settings
from django.conf.urls.static import static
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
    path('api/edit-user/', UserEditAPIView.as_view(), name='edit-user'),
    path('api/user-roles/', UserRolesAPIView.as_view(), name='user-roles'),
    path('api/leave-type/', LeaveTypeAddOrUpdate.as_view(), name='leave-type'), # Manage Leave API - Add/Update
    path('api/leave-type-list/', LeaveTypeListView.as_view(), name='leave-type-list'), # List Leave API
    path('api/leave-type/delete/<str:item_id>/', DeleteLeaveType.as_view(), name='delete-leave-type'), # Delete Leave API
    path('api/holiday/', HolidayAddOrUpdate.as_view(), name='holiday'), # Manage Holiday API - Add/Update
    path('api/holiday-list/', HolidayListView.as_view(), name='holiday-list'), # List Holiday API
    path('api/holiday/delete/<str:item_id>/', DeleteHoliday.as_view(), name='delete-holiday'), # Delete Holiday API
]

if settings.DEBUG:  # Ensures this only applies during development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

