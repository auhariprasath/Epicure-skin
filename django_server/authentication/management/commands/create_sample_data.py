from django.core.management.base import BaseCommand
from authentication.models import User, Patient, Prediction

class Command(BaseCommand):
    help = 'Create sample prediction data for testing'

    def handle(self, *args, **options):
        # Create a sample user if not exists
        user, created = User.objects.get_or_create(
            email='patient@example.com',
            defaults={'username': 'patient@example.com', 'role': 'patient'}
        )
        if created:
            user.set_password('patient123')
            user.save()
        
        # Create patient profile
        patient, created = Patient.objects.get_or_create(
            user=user,
            defaults={
                'name': 'John Doe',
                'age': 30,
                'gender': 'male',
                'mail_id': 'patient@example.com'
            }
        )
        
        # Create sample predictions
        predictions_data = [
            {'disease': 'Melanoma', 'confidence': 87.5, 'image_url': 'https://example.com/image1.jpg'},
            {'disease': 'Psoriasis', 'confidence': 72.3, 'image_url': 'https://example.com/image2.jpg'},
            {'disease': 'Eczema', 'confidence': 65.8, 'image_url': 'https://example.com/image3.jpg'},
        ]
        
        for pred_data in predictions_data:
            Prediction.objects.get_or_create(
                user=user,
                disease=pred_data['disease'],
                defaults={
                    'confidence': pred_data['confidence'],
                    'image_url': pred_data['image_url'],
                    'body_part': 'Arm',
                    'symptoms': 'Itching and redness',
                    'duration': '2 weeks'
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully'))