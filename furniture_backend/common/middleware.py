import logging
import time

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """
    Logs the request method, path, and duration.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        
        # Log only API requests
        if request.path.startswith('/api/'):
            logger.info(
                f"Method: {request.method} | "
                f"Path: {request.path} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.2f}s"
            )
            
        return response
