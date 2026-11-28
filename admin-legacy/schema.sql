-- Supabase Database Schema for Portfolio Admin Panel
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    problem TEXT,
    outcome TEXT,
    technologies TEXT[] DEFAULT '{}',
    github_url TEXT,
    demo_url TEXT,
    thumbnail_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (single row for site settings)
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    portfolio_title TEXT DEFAULT 'Kamaldeep | Digital Marketing with AI',
    site_description TEXT DEFAULT 'Digital Marketing with AI Portfolio',
    github_url TEXT DEFAULT 'https://github.com/kamalsheokand615-debug',
    linkedin_url TEXT DEFAULT 'https://www.linkedin.com/in/kamal-sheokand-615-',
    contact_email TEXT DEFAULT 'kamalsheokand615@gmail.com',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies for projects (public read for published, admin full access)
CREATE POLICY "Public can view published projects" ON projects
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can manage all projects" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for settings (public read, admin write)
CREATE POLICY "Public can view settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage settings" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Storage bucket for project images (run in Storage section)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies
-- CREATE POLICY "Public can view portfolio images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'portfolio-images');
-- CREATE POLICY "Admin can upload portfolio images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin can update portfolio images" ON storage.objects
--     FOR UPDATE USING (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin can delete portfolio images" ON storage.objects
--     FOR DELETE USING (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Demo admin user (optional - create via Supabase Auth UI instead)
-- Go to Authentication > Users > Add User
-- Email: admin@demo.com
-- Password: demo123
-- Confirm email: true