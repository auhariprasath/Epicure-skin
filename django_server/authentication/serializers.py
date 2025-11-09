from rest_framework import serializers
from .models import Doctor, Patient

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'fam_dr_name', 'fam_dr_edu', 'fam_dr_hospital', 'fam_dr_hospital_location']

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'name', 'age', 'gender', 'mail_id']