# Portfolio Admin Panel with Supabase

## Setup Instructions

### 1. Run Database Schema
Go to your Supabase Dashboard → SQL Editor and run the contents of `admin/schema.sql`

This creates:
- `projects` table with all necessary fields
- `settings` table for site configuration
- Row Level Security policies
- Auto-updating `updated_at` triggers

### 2. Configure Authentication
In Supabase Dashboard → Authentication → Providers:
- Enable **Email** provider
- Disable "Confirm email" for development (or configure SMTP)

Create an admin user:
- Go to Authentication → Users → Add User
- Email: `admin@yourdomain.com`
- Password: your secure password
- Auto-confirm: Yes

### 3. Storage Bucket (Optional - for image uploads)
In Supabase Dashboard → Storage:
- Create bucket named `portfolio-images`
- Set to Public
- Run the storage policies from schema.sql

### 4. Access Admin Panel
- Open `/admin/login.html` in browser
- Login with your admin credentials
- Manage projects at `/admin/`

## Features

### Projects Management
- ✅ Create, edit, delete projects
- ✅ Draft/Published status
- ✅ Featured projects
- ✅ Sort ordering
- ✅ Technologies tags
- ✅ GitHub & Demo links
- ✅ Thumbnail images
- ✅ Problem/Outcome fields

### Settings
- ✅ Portfolio title
- ✅ Site description
- ✅ Social links (GitHub, LinkedIn)
- ✅ Contact email

### Portfolio Integration
The main portfolio (`/portfolio/index.html`) now fetches published projects from Supabase automatically.

## File Structure
```
admin/
├── index.html          # Admin dashboard
├── login.html          # Login page
├── supabase-config.js  # Supabase client config
├── schema.sql          # Database schema
```

## Security Notes
- RLS policies restrict public access to published projects only
- Admin operations require authenticated user
- Never commit the anon key to public repos in production
- Consider using environment variables for production

## Customization
Edit `supabase-config.js` to change credentials.
Modify the admin UI in `index.html` and `login.html`.