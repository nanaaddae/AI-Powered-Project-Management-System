from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/projects/', include('projects.urls')),  # ← Change from 'api/' to 'api/projects/'
    path('api/tickets/', include('tickets.urls')),    # ← Change from 'api/' to 'api/tickets/'
    path('api/', include('activity_log.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)