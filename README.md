# SmartSeason Field Management

Hey! This is my submission for the Shamba Records Software Internship. It's a field management dashboard built with Django and React, designed to help track crops, manage field agents, and automatically flag fields that might be falling behind schedule.
Find the frontend deployed on vercel at - https://shamba-records-xgbk.vercel.app/ 
Find the backend deployed on render at - https://shamba-records-c7mi.onrender.com/

## Demo Credentials
- **Username:** `ggichuru`
- **Password:** `Mw@ngi2006`

## How to Run It

### The Backend
I used Django for the API. To get it running locally:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python populate_dummy_data.py # this generates some test data and roles
python manage.py runserver
```

### The Frontend
I used a React template (CoreUI) and cleaned it up with Lucide icons for a better look.
```bash
cd coreui-free-react-admin-template
npm install
npm run dev
```

## A Few Notes on How It Works

- **Access:** Admins can see and assign everything. Field agents get a simpler "My Fields" view showing only what's assigned to them.
- **Smart Statuses:** I didn't want users to have to manually mark a crop as "At Risk". Instead, the backend compares the crop's current stage (Planted, Growing, etc.) with its planting date and expected harvest date. If it's been in a stage for way too long without progressing, or if it's past the target harvest time, it automatically flags it as at-risk or urgent.
- **Location:** Since agents are likely out in the field on their phones, the location field is just flexible text. It accepts plain text like "North Paddock" or simple GPS coordinates so they aren't forced to use a clunky map picker.

## What's Next?
If I had more time, I think it would be really cool to add some machine learning like predicting exact harvest dates based on the crop type and size, or auto-detecting anomalies in growth time from historical data.
