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
    
    # Get all predictions for demo purposes
    predictions = Prediction.objects.all().order_by('-timestamp')
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

@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctor_by_id(request, doctor_id):
    from .models import Doctor
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        doctor_data = {
            '_id': str(doctor.id),
            'name': doctor.fam_dr_name,
            'specialization': 'Dermatology',
            'bio': f'Practicing at {doctor.fam_dr_hospital}, {doctor.fam_dr_hospital_location}',
            'qualifications': [doctor.fam_dr_edu],
            'responseTime': '24 hours',
            'isAvailable': True,
            'avatar': '',
            'rating': 4.5,
            'reviewCount': 150,
            'experience': 10,
            'hospital': doctor.fam_dr_hospital,
            'location': doctor.fam_dr_hospital_location,
            'education': doctor.fam_dr_edu
        }
        return Response(doctor_data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_appointments(request):
    from .models import Appointment
    
    # Get all appointments for demo purposes
    appointments = Appointment.objects.all().order_by('-date')
    appointments_data = []
    
    for apt in appointments:
        appointments_data.append({
            '_id': str(apt.id),
            'doctorId': str(apt.doctor.id),
            'doctorName': apt.doctor.fam_dr_name,
            'doctorAvatar': '',
            'date': apt.date.isoformat(),
            'time': apt.time.strftime('%I:%M %p'),
            'status': apt.status,
            'disease': apt.prediction.disease if apt.prediction else 'General Consultation',
            'confidence': apt.prediction.confidence if apt.prediction else 0
        })
    
    return Response({'appointments': appointments_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def create_appointment(request):
    from .models import Appointment, Doctor, Prediction
    from datetime import datetime, date, time
    
    doctor_id = request.data.get('doctorId')
    report_id = request.data.get('reportId')
    preferred_date = request.data.get('preferredDate')
    preferred_time = request.data.get('preferredTime')
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        doctor = Doctor.objects.first()
    
    # Get user
    if request.user.is_anonymous:
        try:
            patient_user = User.objects.first()
        except:
            patient_user = User.objects.create_user(
                email='demo@example.com',
                username='demo@example.com',
                password='demo123'
            )
    else:
        patient_user = request.user
    
    # Get prediction if exists
    prediction = None
    if report_id:
        try:
            prediction = Prediction.objects.first()
        except:
            pass
    
    # Create appointment
    appointment = Appointment.objects.create(
        patient=patient_user,
        doctor=doctor,
        prediction=prediction,
        date=date.today(),
        time=time(10, 0),
        status='pending'
    )
    
    return Response({
        '_id': str(appointment.id),
        'status': 'pending',
        'message': 'Appointment request sent successfully. The doctor will respond within 24 hours.'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_messages(request):
    from .models import Message
    from django.db import models
    
    # Get all messages for demo purposes
    messages = Message.objects.all().order_by('-timestamp')
    
    messages_data = []
    for msg in messages:
        messages_data.append({
            '_id': str(msg.id),
            'senderId': str(msg.sender.id),
            'senderName': msg.sender.email,
            'receiverId': str(msg.receiver.id),
            'receiverName': msg.receiver.email,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat(),
            'isRead': msg.is_read
        })
    
    return Response({'messages': messages_data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_conversations(request):
    from .models import Doctor
    
    # Get all doctors as potential conversations
    doctors = Doctor.objects.all()[:5]
    conversations_data = []
    
    for doctor in doctors:
        conversations_data.append({
            '_id': str(doctor.id),
            'doctorId': str(doctor.id),
            'doctorName': doctor.fam_dr_name,
            'doctorAvatar': '',
            'lastMessage': 'Start a conversation',
            'lastMessageTime': '2024-01-01T00:00:00Z',
            'unreadCount': 0
        })
    
    return Response({'conversations': conversations_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request):
    from .models import Message, Doctor
    
    doctor_id = request.data.get('doctorId')
    content = request.data.get('content')
    
    # Get sender
    if request.user.is_anonymous:
        try:
            sender = User.objects.first()
        except:
            sender = User.objects.create_user(
                email='demo@example.com',
                username='demo@example.com',
                password='demo123'
            )
    else:
        sender = request.user
    
    # Get receiver (doctor)
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        receiver = doctor.user
    except Doctor.DoesNotExist:
        doctor = Doctor.objects.first()
        receiver = doctor.user
    
    # Create message
    message = Message.objects.create(
        sender=sender,
        receiver=receiver,
        content=content,
        is_read=False
    )
    
    return Response({
        'success': True,
        'message': 'Message sent successfully'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_reports(request):
    from .models import Report
    
    # Get all reports for demo purposes
    reports = Report.objects.all().order_by('-created_at')
    reports_data = []
    
    for report in reports:
        reports_data.append({
            '_id': str(report.id),
            'predictionId': str(report.prediction.id),
            'disease': report.prediction.disease,
            'confidence': report.prediction.confidence,
            'timestamp': report.created_at.isoformat(),
            'pdfUrl': report.pdf_url
        })
    
    return Response({'reports': reports_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    return Response({'success': True, 'data': {'accessToken': 'token', 'refreshToken': 'token'}})

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_report(request):
    from .models import Report, Prediction, Patient
    import uuid
    
    # Remove authentication check for now
    # if request.user.is_anonymous:
    #     return Response({'error': 'Authentication required'}, status=401)
    
    prediction_id = request.data.get('predictionId')
    
    # Get patient info
    if not request.user.is_anonymous:
        try:
            patient_profile = Patient.objects.get(user=request.user)
            patient_name = patient_profile.name
            patient_age = patient_profile.age
            patient_gender = patient_profile.gender
        except Patient.DoesNotExist:
            patient_name = request.user.email
            patient_age = 25
            patient_gender = 'Unknown'
    else:
        patient_name = 'Demo User'
        patient_age = 30
        patient_gender = 'Unknown'
    
    # Create or get prediction
    try:
        if prediction_id.isdigit():
            prediction = Prediction.objects.get(id=prediction_id)
        else:
            # Create a mock prediction for demo
            # Get a real user for prediction
            if request.user.is_anonymous:
                try:
                    real_user = User.objects.first()
                    if not real_user:
                        real_user = User.objects.create_user(
                            email='demo@example.com',
                            username='demo@example.com',
                            password='demo123'
                        )
                except:
                    real_user = User.objects.create_user(
                        email='demo@example.com',
                        username='demo@example.com', 
                        password='demo123'
                    )
            else:
                real_user = request.user
                
            prediction = Prediction.objects.create(
                user=real_user,
                disease='Melanoma',
                confidence=87.5,
                image_url='https://via.placeholder.com/150',
                body_part='Arm',
                symptoms='Sample symptoms',
                duration='2 weeks'
            )
    except Prediction.DoesNotExist:
        # Create a mock prediction
        # Get a real user for prediction
        if request.user.is_anonymous:
            # Get any existing user or create one
            try:
                real_user = User.objects.first()
                if not real_user:
                    real_user = User.objects.create_user(
                        email='demo@example.com',
                        username='demo@example.com',
                        password='demo123'
                    )
            except:
                real_user = User.objects.create_user(
                    email='demo@example.com',
                    username='demo@example.com', 
                    password='demo123'
                )
        else:
            real_user = request.user
            
        prediction = Prediction.objects.create(
            user=real_user,
            disease='Melanoma',
            confidence=87.5,
            image_url='https://via.placeholder.com/150',
            body_part='Arm',
            symptoms='Sample symptoms',
            duration='2 weeks'
        )
    
    # Create report
    report = Report.objects.create(
        patient=real_user,
        prediction=prediction,
        patient_name=patient_name,
        patient_age=patient_age,
        patient_gender=patient_gender,
        pdf_url=f'/reports/report_{prediction.id}.pdf'
    )
    
    return Response({
        '_id': str(report.id),
        'predictionId': str(prediction.id),
        'patientName': patient_name,
        'patientAge': patient_age,
        'patientGender': patient_gender,
        'disease': prediction.disease,
        'confidence': prediction.confidence,
        'timestamp': report.created_at.isoformat(),
        'pdfUrl': report.pdf_url
    })

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
        
        # For patients: password is their name or email
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
                # If no patient profile, allow login with email as password
                if user.email == password:
                    token = jwt.encode({'sub': str(user.id), 'email': user.email}, 'secret', algorithm='HS256')
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
            
    except User.DoesNotExist:
        pass
    
    return Response({'message': 'Email or password is incorrect'}, status=400)