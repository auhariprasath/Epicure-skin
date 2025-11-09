from django.core.management.base import BaseCommand
import pandas as pd
from authentication.models import User, Doctor

class Command(BaseCommand):
    help = 'Import doctors from Excel file'

    def add_arguments(self, parser):
        parser.add_argument('excel_file', type=str, help='Path to Excel file')

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        
        try:
            df = pd.read_excel(excel_file)
            
            for _, row in df.iterrows():
                # Create user account for doctor
                email = f"{row['fam_dr_name'].replace(' ', '').lower()}@hospital.com"
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email,
                        'role': 'doctor'
                    }
                )
                # Set password as doctor name
                if created:
                    user.set_password(row['fam_dr_name'])
                    user.save()
                
                # Create doctor profile
                Doctor.objects.get_or_create(
                    user=user,
                    defaults={
                        'fam_dr_name': row['fam_dr_name'],
                        'fam_dr_edu': row['fam_dr_edu'],
                        'fam_dr_hospital': row['fam_dr_hospital'],
                        'fam_dr_hospital_location': row['fam_dr_hospital_location'],
                    }
                )
                
            self.stdout.write(self.style.SUCCESS(f'Successfully imported {len(df)} doctors'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))