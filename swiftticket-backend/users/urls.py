from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('profile/', views.update_profile, name='update-profile'),
    path('update-info/', views.update_user_info, name='update-user-info'),
]