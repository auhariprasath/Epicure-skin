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
    from .models import Appointment, Doctor
    from rest_framework import status
    
    if not getattr(request, 'user', None) or request.user.is_anonymous:
        return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # If user is a doctor, show ALL appointments across all doctors (managed by admins)
    # If user is a patient, show appointments where the patient is the requester
    if request.user.role == 'doctor':
        # Doctors see all appointments
        appointments = Appointment.objects.all().order_by('-created_at')
    else:
        # Patient: show their own appointment requests
        appointments = Appointment.objects.filter(patient=request.user).order_by('-created_at')
    
    appointments_data = []
    for apt in appointments:
        # Get patient name from Patient profile if available, otherwise use email
        patient_name = apt.patient.email
        patient_age = None
        patient_gender = None
        try:
            from .models import Patient
            patient_profile = Patient.objects.get(user=apt.patient)
            if patient_profile.name:
                patient_name = patient_profile.name
            patient_age = patient_profile.age
            patient_gender = patient_profile.gender
        except Exception:
            pass
        
        appointments_data.append({
            '_id': str(apt.id),
            'doctorId': str(apt.doctor.id),
            'doctorName': apt.doctor.fam_dr_name,
            'patientName': patient_name,
            'patientAge': patient_age,
            'patientGender': patient_gender,
            'doctorAvatar': '',
            'date': apt.date.isoformat(),
            'time': apt.time.strftime('%I:%M %p'),
            'status': apt.status,
            'disease': apt.prediction.disease if apt.prediction else 'General Consultation',
            'confidence': apt.prediction.confidence if apt.prediction else 0,
            'patientEmail': apt.patient.email if apt.patient else 'Unknown'
        })
    
    return Response({'appointments': appointments_data})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def cancel_appointment(request, appointment_id):
    from .models import Appointment
    from rest_framework import status

    # Require authentication
    if not getattr(request, 'user', None) or request.user.is_anonymous:
        return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({'message': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

    # Authorization: allow if request.user is the patient, or any doctor user, the assigned doctor user, or staff
    is_patient = appointment.patient and appointment.patient == request.user
    # Allow any authenticated user with role 'doctor' to cancel (doctors manage appointments centrally)
    is_doctor = getattr(request.user, 'role', None) == 'doctor'
    # Also allow the specifically assigned doctor user
    is_assigned_doctor = False
    try:
        is_assigned_doctor = appointment.doctor and appointment.doctor.user == request.user
    except Exception:
        is_assigned_doctor = False

    if not (is_patient or is_doctor or is_assigned_doctor or request.user.is_staff):
        return Response({'message': 'Not authorized to cancel this appointment'}, status=status.HTTP_403_FORBIDDEN)

    # Soft-cancel: update status to 'cancelled'
    appointment.status = 'cancelled'
    appointment.save()

    return Response({'success': True, 'message': 'Appointment cancelled successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_appointment(request, appointment_id):
    """Doctors can confirm a pending appointment."""
    from .models import Appointment, Doctor
    from rest_framework import status

    if not getattr(request, 'user', None) or request.user.is_anonymous:
        return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({'message': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

    # Authorization: allow if user is a doctor (any doctor can confirm centralized appointments),
    # or if user is staff, or assigned doctor
    is_doctor_role = getattr(request.user, 'role', None) == 'doctor'
    is_assigned_doctor = False
    try:
        assigned_doc = Doctor.objects.get(user=request.user)
        is_assigned_doctor = appointment.doctor == assigned_doc
    except Exception:
        is_assigned_doctor = False

    if not (is_doctor_role or is_assigned_doctor or request.user.is_staff):
        return Response({'message': 'Not authorized to confirm this appointment'}, status=status.HTTP_403_FORBIDDEN)

    # Update status to confirmed
    appointment.status = 'confirmed'
    appointment.save()

    return Response({'success': True, 'message': 'Appointment confirmed', 'status': 'confirmed'})


@api_view(['POST'])
@permission_classes([AllowAny])
def update_appointment_status(request, appointment_id):
    """Update appointment status. Doctors can set to confirmed/completed, patients can cancel."""
    from .models import Appointment, Doctor
    from rest_framework import status

    if not getattr(request, 'user', None) or request.user.is_anonymous:
        return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({'message': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if not new_status or new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
        return Response({'message': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    # Authorization checks
    is_patient = appointment.patient == request.user
    # Treat any user with role 'doctor' as a doctor manager
    is_doctor = getattr(request.user, 'role', None) == 'doctor'
    # Also allow if user is assigned doctor
    try:
        doctor = Doctor.objects.get(user=request.user)
        if appointment.doctor == doctor:
            is_doctor = True
    except Doctor.DoesNotExist:
        pass

    # Patients can only cancel; doctors can confirm or mark as completed
    if is_patient and new_status != 'cancelled':
        return Response({'message': 'Patients can only cancel appointments'}, status=status.HTTP_403_FORBIDDEN)
    elif is_doctor and new_status == 'cancelled':
        return Response({'message': 'Doctors cannot cancel; only patients can'}, status=status.HTTP_403_FORBIDDEN)
    elif not (is_patient or is_doctor or request.user.is_staff):
        return Response({'message': 'Not authorized to update this appointment'}, status=status.HTTP_403_FORBIDDEN)

    appointment.status = new_status
    appointment.save()

    return Response({
        'success': True,
        'message': f'Appointment status updated to {new_status}',
        'status': new_status,
        '_id': str(appointment.id)
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def create_appointment(request):
    from .models import Appointment, Doctor, Prediction, Patient
    from datetime import datetime, date, time
    from rest_framework import status

    # Require authenticated user
    if not getattr(request, 'user', None) or request.user.is_anonymous:
        return Response({'message': 'Authentication required to request an appointment'}, status=status.HTTP_401_UNAUTHORIZED)

    doctor_id = request.data.get('doctorId')
    report_id = request.data.get('reportId')
    preferred_date = request.data.get('preferredDate')
    preferred_time = request.data.get('preferredTime')

    try:
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        doctor = Doctor.objects.first()

    # Ensure patient profile exists and has required contact info
    try:
        patient_profile = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'message': 'Please complete your patient profile (name and contact) before requesting an appointment.'}, status=status.HTTP_400_BAD_REQUEST)

    if not patient_profile.name or not patient_profile.mail_id:
        return Response({'message': 'Please complete your patient profile (name and contact) before requesting an appointment.'}, status=status.HTTP_400_BAD_REQUEST)

    # Get prediction if exists
    prediction = None
    if report_id:
        try:
            prediction = Prediction.objects.first()
        except:
            pass

    # Create appointment
    appointment = Appointment.objects.create(
        patient=request.user,
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
    import traceback

    try:
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'patient')

        if User.objects.filter(email=email).exists():
            return Response({'message': 'User already exists'}, status=400)

        user = User.objects.create_user(email=email, password=password)
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
    except Exception as e:
        # Print full traceback to console for debugging
        traceback.print_exc()
        # Return minimal error message to client (don't leak internals)
        return Response({'message': str(e) or 'Registration error'}, status=500)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def upsert_patient_profile(request):
    """GET: return the authenticated user's Patient profile if exists.
       POST: create or update the Patient profile for the authenticated user.
       Expects (POST): { name: string, age?: int, gender?: string, mail_id?: string }
    """
    from .models import Patient
    from rest_framework import status

    if not getattr(request, 'user', None) or request.user.is_anonymous:
        return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    # Handle GET: return existing patient profile
    if request.method == 'GET':
        try:
            patient = Patient.objects.get(user=request.user)
            return Response({
                'name': patient.name,
                'age': patient.age,
                'gender': patient.gender,
                'mail_id': patient.mail_id,
            })
        except Patient.DoesNotExist:
            return Response({'message': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    # Handle POST: create/update profile
    name = request.data.get('name')
    age = request.data.get('age')
    gender = request.data.get('gender')
    mail_id = request.data.get('mail_id') or request.user.email

    if not name or not mail_id:
        return Response({'message': 'Name and contact email are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            # Provide safe defaults for required fields when creating
            create_kwargs = {
                'user': request.user,
                'name': name,
                'mail_id': mail_id,
            }
            # Age and gender may be missing; set sensible defaults to avoid DB errors
            try:
                create_kwargs['age'] = int(age) if age is not None else 0
            except Exception:
                create_kwargs['age'] = 0
            create_kwargs['gender'] = gender if gender else 'other'
            patient = Patient.objects.create(**create_kwargs)

        # Update fields on existing patient
        patient.name = name
        if age is not None:
            try:
                patient.age = int(age)
            except Exception:
                pass
        if gender:
            patient.gender = gender
        patient.mail_id = mail_id
        patient.save()

        return Response({'success': True, 'message': 'Profile saved'})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'message': 'Failed to save profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import authenticate
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'message': 'Email and password are required'}, status=400)
    
    try:
        # Authenticate using email (USERNAME_FIELD is 'email' in custom User model)
        user = authenticate(username=email, password=password)
        
        if user is None:
            return Response({'message': 'Email or password is incorrect'}, status=400)
        
        # Get user's name based on role
        name = user.email
        if user.role == 'doctor':
            from .models import Doctor
            try:
                doctor = Doctor.objects.get(user=user)
                name = doctor.fam_dr_name
            except Doctor.DoesNotExist:
                pass
        elif user.role == 'patient':
            from .models import Patient
            try:
                patient = Patient.objects.get(user=user)
                name = patient.name
            except Patient.DoesNotExist:
                pass
        
        # Generate tokens
        token = jwt.encode({'sub': str(user.id), 'email': user.email}, 'secret', algorithm='HS256')
        
        return Response({
            '_id': user.id,
            'email': user.email,
            'role': user.role,
            'name': name,
            'accessToken': token,
            'refreshToken': token,
            'isActive': True,
            'createdAt': user.date_joined,
            'lastLoginAt': user.last_login,
        })
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'message': 'Email or password is incorrect'}, status=400)