from django.contrib import admin
from django.urls import path

from apps.accounts.views import admin_dashboard, current_user, health_check, login_user, logout_user, register_user
from apps.administration.views import admin_settings
from apps.analytics.views import analytics_summary
from apps.businesses.views import business_onboarding
from apps.campaigns.views import campaign_delivery_list, campaign_invitation_list, campaign_list
from apps.influencers.views import influencer_onboarding
from apps.leads.views import lead_list
from apps.messaging.views import conversation_list, message_list
from apps.notifications.views import notification_list
from apps.payments.views import payment_list
from apps.reviews.views import review_list
from apps.services.views import influencer_list, package_list, service_list

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/public/services/", service_list, name="public-services"),
    path("api/public/influencers/", influencer_list, name="public-influencers"),
    path("api/auth/register/", register_user, name="register-user"),
    path("api/auth/login/", login_user, name="login-user"),
    path("api/auth/logout/", logout_user, name="logout-user"),
    path("api/auth/me/", current_user, name="current-user"),
    path("api/business/onboarding/", business_onboarding, name="business-onboarding"),
    path("api/influencer/onboarding/", influencer_onboarding, name="influencer-onboarding"),
    path("api/services/", service_list, name="services"),
    path("api/packages/", package_list, name="packages"),
    path("api/campaigns/", campaign_list, name="campaigns"),
    path("api/campaigns/invitations/", campaign_invitation_list, name="campaign-invitations"),
    path("api/campaigns/deliveries/", campaign_delivery_list, name="campaign-deliveries"),
    path("api/leads/", lead_list, name="leads"),
    path("api/messages/conversations/", conversation_list, name="conversations"),
    path("api/messages/", message_list, name="messages"),
    path("api/notifications/", notification_list, name="notifications"),
    path("api/reviews/", review_list, name="reviews"),
    path("api/payments/", payment_list, name="payments"),
    path("api/analytics/summary/", analytics_summary, name="analytics-summary"),
    path("api/admin/settings/", admin_settings, name="admin-settings"),
    path("api/admin/dashboard/", admin_dashboard, name="admin-dashboard"),
]
