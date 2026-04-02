from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from usuarios.models import Doctor, Enfermera, Paciente, Especialidad, Horario, Cita

User = get_user_model()

class Command(BaseCommand):
    help = 'Limpia todos los datos de la base de datos'

    def handle(self, *args, **options):
        self.stdout.write('Limpiando todos los datos...')
        
        # Eliminar en orden para evitar problemas de foreign key
        Cita.objects.all().delete()
        self.stdout.write('  Citas eliminadas')
        
        Horario.objects.all().delete()
        self.stdout.write('  Horarios eliminados')
        
        # Eliminar perfiles primero
        Doctor.objects.all().delete()
        self.stdout.write('  Doctores eliminados')
        
        Enfermera.objects.all().delete()
        self.stdout.write('  Enfermeras eliminadas')
        
        Paciente.objects.all().delete()
        self.stdout.write('  Pacientes eliminados')
        
        Especialidad.objects.all().delete()
        self.stdout.write('  Especialidades eliminadas')
        
        # Eliminar usuarios (excepto superusers del sistema)
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write('  Usuarios eliminados')
        
        self.stdout.write('Todos los datos han sido eliminados')
        
        # Contar quedados
        remaining_users = User.objects.count()
        self.stdout.write(f'Usuarios restantes en la base de datos: {remaining_users}')
