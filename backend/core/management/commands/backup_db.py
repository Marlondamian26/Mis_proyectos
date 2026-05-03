from django.core.management.base import BaseCommand
from django.core.management import call_command
import os

class Command(BaseCommand):
    help = 'Create a database backup and save it to a file'

    def handle(self, *args, **options):
        # Create backup directory if it doesn't exist
        backup_dir = 'backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        # Use dbbackup to create a backup
        filename = f"{backup_dir}/backup.sql"
        with open(filename, 'w') as f:
            call_command('dbbackup', stdout=f)
        
        self.stdout.write(self.style.SUCCESS(f'Backup created at {filename}'))