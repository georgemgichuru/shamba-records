import os
import sys
import django
import random
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from faker import Faker
from rich.console import Console
from rich.progress import track
from rich.panel import Panel
from rich.prompt import Prompt

from fields.models import Field
from accounts.models import User

fake = Faker()
console = Console()

CROP_TYPES = ['Maize', 'Wheat', 'Beans', 'Rice', 'Potatoes', 'Sorghum', 'Cassava', 'Sunflowers']
LOCATIONS = ['Nakuru', 'Eldoret', 'Kitale', 'Meru', 'Nyeri', 'Bomet', 'Narok', 'Kakamega']
COMPASS = ['North Paddock', 'South Paddock', 'East Block', 'West Block', 'Central Fields', 'Lower Slopes']

def create_users(num_agents=5):
    console.print(f"\n[cyan]Creating {num_agents} Field Agents...[/cyan]")
    agents = list(User.objects.filter(role='agent'))
    new_agents_needed = max(0, num_agents - len(agents))
    
    if new_agents_needed > 0:
        for _ in track(range(new_agents_needed), description="Creating Users"):
            username = fake.user_name()
            # Handle potential duplicates
            while User.objects.filter(username=username).exists():
                username = fake.user_name() + str(random.randint(1, 100))
                
            user = User.objects.create_user(
                username=username,
                email=fake.email(),
                password='password123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role='agent',
                phone_number=fake.phone_number()
            )
            agents.append(user)
    else:
        console.print(f"[yellow]Already have {len(agents)} agents. Skipping creation.[/yellow]")
    
    # Ensure there's an admin if not exists
    if not User.objects.filter(role='admin').exists() and not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123', role='admin')
        console.print("[green]Created default admin account (admin / admin123)[/green]")
    
    return agents

def create_fields(agents, num_fields=30):
    console.print(f"\n[cyan]Creating {num_fields} Fields...[/cyan]")
    stages = [choice[0] for choice in Field.STAGE_CHOICES]
    
    for _ in track(range(num_fields), description="Creating Fields"):
        crop_type = random.choice(CROP_TYPES)
        location = f"{random.choice(COMPASS)}, {random.choice(LOCATIONS)}"
        current_stage = random.choice(stages)
        
        # Timeline logic
        days_ago = random.randint(10, 150)
        planting_date = timezone.now().date() - timedelta(days=days_ago)
        
        expected_harvest_date = planting_date + timedelta(days=random.randint(90, 150))
        
        Field.objects.create(
            name=f"{crop_type} Field {fake.bothify(text='??-####').upper()}",
            crop_type=crop_type,
            planting_date=planting_date,
            expected_harvest_date=expected_harvest_date,
            current_stage=current_stage,
            location=location,
            area_hectares=round(random.uniform(0.5, 50.0), 2),
            assigned_agent=random.choice(agents) if agents else None,
            notes=fake.paragraph() if random.choice([True, False]) else ''
        )

def run():
    console.print(Panel.fit("[bold green]Shamba Records - Dummy Data Generator[/bold green]\nPopulating database with fake data using [cyan]Faker[/cyan] & [magenta]Rich[/magenta]!"))
    
    try:
        num_users = int(Prompt.ask("How many agents should exist minimum?", default="5"))
        num_fields = int(Prompt.ask("How many dummy fields to generate?", default="20"))
        
        if Prompt.ask("Clear existing Fields first?", choices=["y", "n"], default="n") == "y":
            deleted, _ = Field.objects.all().delete()
            console.print(f"[yellow]Deleted {deleted} existing fields.[/yellow]")
            
        agents = create_users(num_users)
        create_fields(agents, num_fields)
        
        console.print("\n[bold green]✅ Database population complete![/bold green]")
        console.print("You can login with [cyan]admin[/cyan] / [cyan]admin123[/cyan] if it was just created.")
    except KeyboardInterrupt:
        console.print("\n[red]Operation cancelled by user.[/red]")
        sys.exit(0)

if __name__ == '__main__':
    run()
