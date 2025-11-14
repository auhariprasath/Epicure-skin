from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class SimpleJWTAuthentication(BaseAuthentication):
    """Very small JWT auth implementation to decode tokens issued by the project.

    Expects an Authorization: Bearer <token> header where the token was created
    with the same secret used in the views (HS256, secret).
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid token')

        user_id = payload.get('sub')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        try:
            # sub was encoded as string in the project, so cast to int if possible
            try:
                lookup_id = int(user_id)
            except Exception:
                lookup_id = user_id

            user = User.objects.get(id=lookup_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

        return (user, token)
