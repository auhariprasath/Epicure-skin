from django.contrib import admin
from .models import User, Patient, Doctor, Prediction, Report, Appointment, Message

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active')
    search_fields = ('email',)

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'age', 'gender', 'mail_id')
    list_filter = ('gender',)
    search_fields = ('name', 'mail_id')

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('fam_dr_name', 'fam_dr_edu', 'fam_dr_hospital', 'fam_dr_hospital_location')
    search_fields = ('fam_dr_name', 'fam_dr_hospital')

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('disease', 'confidence', 'user', 'timestamp')
    list_filter = ('disease',)
    search_fields = ('disease', 'user__email')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('patient_name', 'patient', 'prediction', 'created_at')
    search_fields = ('patient_name', 'patient__email')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date', 'time', 'status')
    list_filter = ('status', 'date')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')