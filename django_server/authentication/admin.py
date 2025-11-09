from django.contrib import admin
from .models import User, Patient, Doctor

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