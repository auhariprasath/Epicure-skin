from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
import jwt
from django.conf import settings

User = get_user_model()

@api_view(['GET'])
def config(request):
    return Response({'strategy': 'email'})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctors(request):
    from .models import Doctor
    
    doctors = Doctor.objects.all()
    doctors_data = []
    
    for doctor in doctors:
        doctors_data.append({
            '_id': str(doctor.id),
            'name': doctor.fam_dr_name,
            'specialization': 'Dermatologist',
            'bio': f'Practicing at {doctor.fam_dr_hospital}',
            'qualifications': [doctor.fam_dr_edu],
            'responseTime': '24 hours',
            'isAvailable': True,
            'avatar': '',
            'rating': 4.5,
            'hospital': doctor.fam_dr_hospital,
            'location': doctor.fam_dr_hospital_location,
            'education': doctor.fam_dr_edu
        })
    
    return Response({'doctors': doctors_data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_predictions(request):
    from .models import Prediction
    
    predictions = Prediction.objects.filter(user=request.user).order_by('-timestamp')
    predictions_data = []
    
    for pred in predictions:
        predictions_data.append({
            '_id': str(pred.id),
            'disease': pred.disease,
            'confidence': pred.confidence,
            'timestamp': pred.timestamp.isoformat(),
            'imageUrl': pred.image_url
        })
    
    return Response({'predictions': predictions_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'patient')
    
    if User.objects.filter(email=email).exists():
        return Response({'message': 'User already exists'}, status=400)
    
    user = User.objects.create_user(username=email, email=email, password=password)
    user.role = role
    user.save()
    
    token = jwt.encode({'sub': str(user.id), 'email': email}, 'secret', algorithm='HS256')
    
    return Response({
        '_id': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.email,
        'accessToken': token,
        'refreshToken': token,
        'isActive': True,
        'createdAt': user.date_joined,
        'lastLoginAt': user.last_login,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
        
        # For doctors: password is their name
        if user.role == 'doctor':
            from .models import Doctor
            try:
                doctor = Doctor.objects.get(user=user)
                if doctor.fam_dr_name == password:
                    token = jwt.encode({'sub': str(user.id), 'email': user.email}, 'secret', algorithm='HS256')
                    return Response({
                        '_id': user.id,
                        'email': user.email,
                        'role': user.role,
                        'name': doctor.fam_dr_name,
                        'accessToken': token,
                        'refreshToken': token,
                        'isActive': True,
                        'createdAt': user.date_joined,
                        'lastLoginAt': user.last_login,
                    })
            except Doctor.DoesNotExist:
                pass
        
        # For patients: password is their name
        elif user.role == 'patient':
            from .models import Patient
            try:
                patient = Patient.objects.get(user=user)
                if patient.name == password:
                    token = jwt.encode({'sub': str(user.id), 'email': user.email}, 'secret', algorithm='HS256')
                    return Response({
                        '_id': user.id,
                        'email': user.email,
                        'role': user.role,
                        'name': patient.name,
                        'accessToken': token,
                        'refreshToken': token,
                        'isActive': True,
                        'createdAt': user.date_joined,
                        'lastLoginAt': user.last_login,
                    })
            except Patient.DoesNotExist:
                pass
            
    except User.DoesNotExist:
        pass
    
    return Response({'message': 'Email or password is incorrect'}, status=400)