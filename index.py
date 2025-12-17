# Aliyun Function Compute entry file
# This file contains the handler function that FC will invoke

import json
from urllib.parse import parse_qs
from main import app

def handler(event, context):
    """
    FC handler function
    Args:
        event: FC event object
        context: FC context object
    Returns:
        Response object that FC expects
    """
    # Parse FC event
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    path = event.get('path', '/')
    http_method = event.get('httpMethod', 'GET')
    query_params = event.get('queryParameters', {})
    body = event.get('body', '')
    
    # Convert to WSGI environment
    env = {
        'REQUEST_METHOD': http_method,
        'PATH_INFO': path,
        'QUERY_STRING': '&'.join([f'{k}={v}' for k, v in query_params.items()]),
        'CONTENT_TYPE': headers.get('content-type', ''),
        'CONTENT_LENGTH': str(len(body)),
        'HTTP_HOST': headers.get('host', ''),
        'HTTP_USER_AGENT': headers.get('user-agent', ''),
        'HTTP_ACCEPT': headers.get('accept', ''),
        'HTTP_ACCEPT_ENCODING': headers.get('accept-encoding', ''),
        'HTTP_ACCEPT_LANGUAGE': headers.get('accept-language', ''),
        'HTTP_CONNECTION': headers.get('connection', ''),
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': headers.get('x-forwarded-proto', 'http'),
        'wsgi.input': type('WSGIInput', (), {
            'read': lambda self, size=-1: body.encode('utf-8')
        })(),
        'wsgi.errors': None,
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }
    
    # Add all other headers to env
    for header_name, header_value in headers.items():
        if header_name not in ['content-type', 'content-length']:
            env_name = f'HTTP_{header_name.upper().replace("-", "_")}'
            env[env_name] = header_value
    
    # Call WSGI app
    captured_status = None
    captured_headers = None
    
    def start_response(status, response_headers, exc_info=None):
        nonlocal captured_status, captured_headers
        captured_status = status
        captured_headers = response_headers
        return lambda data: None
    
    response_data = app(env, start_response)
    
    # Convert to FC response format
    response_status = int(captured_status.split(' ')[0]) if captured_status else 500
    response_headers = {k: v for k, v in captured_headers} if captured_headers else {}
    response_body = b''.join(response_data).decode('utf-8')
    
    return {
        'statusCode': response_status,
        'headers': response_headers,
        'body': response_body
    }