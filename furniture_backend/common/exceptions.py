from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Standardizes error responses across the entire API.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'error': response.data,
            'status_code': response.status_code
        }
        
        # If it's a validation error, we might want to flatten it or add a general message
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_data['message'] = 'Validation failed.'
        else:
            custom_data['message'] = response.data.get('detail', 'An error occurred.')

        response.data = custom_data

    return response
