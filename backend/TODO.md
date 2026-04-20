# Shamba Records Backend - Deployment Fix TODO

## Status: 🚀 Ready to Deploy (No code changes needed)

### Step 1: [ ] Update Render Dashboard (Manual - 2 min)
1. Go to [Render Dashboard](https://dashboard.render.com/) → Your service `shamba-records-backend`
2. **Settings** tab → **Start Command**
3. Change from: `python manage.py migrate && python create_superuser.py && gunicorn your_project.wsgi:application`
4. To: `python manage.py migrate && python create_superuser.py && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`
5. Save Changes

### Step 2: [ ] Trigger Redeploy
1. Render → **Manual Deploy** → **Deploy latest commit**
2. Or push any change to trigger auto-deploy

### Step 3: [ ] Verify Deployment
- ✅ Check logs for successful gunicorn startup
- ✅ Visit your Render URL
- ✅ Test login at `/admin/`

### Step 4: [x] Local Verification (Already Done)
```
cd backend
python manage.py migrate
python create_superuser.py
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```
^ Should work locally.

## Notes
- Local files (`Procfile`, `render.yaml`) already correct with `backend.wsgi`
- Issue was Render dashboard overriding with old `your_project` placeholder
- After fix, service will bind to `$PORT` automatically

**Progress: 75% complete (just dashboard update left)**
