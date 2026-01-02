from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

router = DefaultRouter()
router.register(r'', TicketViewSet, basename='ticket')  # ← Empty string, not 'tickets'

urlpatterns = router.urls