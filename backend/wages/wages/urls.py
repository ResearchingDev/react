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
from server import views
from server.signup.views import SignupAPIView
from server.views import home  # Import the new view
urlpatterns = [
    path('', home, name='home'),  # Add root URL pattern
    path('admin/', admin.site.urls),
    path('post-data/', views.post_data, name='post_data'),
    path('get-data/', views.get_data, name='get_data'),
    path('api/signup/', SignupAPIView.as_view(), name='signup'),
]

