from django.urls import path
from .views import *
urlpatterns = [
    path('signup/', signup,name="signup"),
    path('login/', login,name="login"),
    path('add_expense/', add_expense,name="add_expense"),
    path('manage_expense/<int:user_id>/', manage_expense,name="manage_expense"),
    path('update_expense/<int:expense_id>/', update_expense, name="update_expense"),
    path('delete_expense/<int:expense_id>/', delete_expense, name="delete_expense"),
    path('change_password/<int:user_id>/', change_password, name="change_password"),
    path('ai_suggestions/<int:user_id>/', ai_suggestions, name="ai_suggestions"),
    path('ai_chat/<int:user_id>/', ai_chat, name="ai_chat"),
    path('upload-statement/', upload_statement, name="upload_statement"),
    path('add_multiple_expenses/', add_multiple_expenses, name="add_multiple_expenses"),
    path('stock-update/',stock_update,name="stock_update"),
    
]