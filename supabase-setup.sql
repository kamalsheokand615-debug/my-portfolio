-- Kamaldeep portfolio + admin panel ke liye Supabase setup.
-- Supabase Dashboard > SQL Editor me ek baar run karein.
-- (Kit ke schema.sql ko dobara run karne ki zarurat nahi.)

-- 1) Basic privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.site_settings, public.skills, public.projects,
  public.certifications, public.coding_profiles, public.blogs
  TO anon, authenticated;

GRANT INSERT ON public.messages TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings, public.skills,
  public.projects, public.certifications, public.coding_profiles,
  public.blogs, public.messages
  TO authenticated;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2) Admin check: sirf ye email admin ho sakta hai
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT coalesce(auth.jwt() ->> 'email', '') = 'kamalsheokand615@gmail.com'
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 3) Read policies (public) + write policies (admin)
DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_write_site_settings" ON public.site_settings;
CREATE POLICY "admin_write_site_settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_skills" ON public.skills;
CREATE POLICY "public_read_skills" ON public.skills FOR SELECT USING (visible = true);
DROP POLICY IF EXISTS "admin_write_skills" ON public.skills;
CREATE POLICY "admin_write_skills" ON public.skills FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_projects" ON public.projects;
CREATE POLICY "public_read_projects" ON public.projects FOR SELECT USING (visible = true);
DROP POLICY IF EXISTS "admin_write_projects" ON public.projects;
CREATE POLICY "admin_write_projects" ON public.projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_certifications" ON public.certifications;
CREATE POLICY "public_read_certifications" ON public.certifications FOR SELECT USING (visible = true);
DROP POLICY IF EXISTS "admin_write_certifications" ON public.certifications;
CREATE POLICY "admin_write_certifications" ON public.certifications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_coding_profiles" ON public.coding_profiles;
CREATE POLICY "public_read_coding_profiles" ON public.coding_profiles FOR SELECT USING (visible = true);
DROP POLICY IF EXISTS "admin_write_coding_profiles" ON public.coding_profiles;
CREATE POLICY "admin_write_coding_profiles" ON public.coding_profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_blogs" ON public.blogs;
CREATE POLICY "public_read_blogs" ON public.blogs FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "admin_write_blogs" ON public.blogs;
CREATE POLICY "admin_write_blogs" ON public.blogs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4) Contact form messages
DROP POLICY IF EXISTS "anyone_can_send_message" ON public.messages;
CREATE POLICY "anyone_can_send_message" ON public.messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_messages" ON public.messages;
CREATE POLICY "admin_read_messages" ON public.messages FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "admin_update_messages" ON public.messages;
CREATE POLICY "admin_update_messages" ON public.messages FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_messages" ON public.messages;
CREATE POLICY "admin_delete_messages" ON public.messages FOR DELETE USING (public.is_admin());

-- 5) Image storage bucket 'media'
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
CREATE POLICY "media_admin_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());
DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'media' AND public.is_admin());
DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND public.is_admin());

-- 6) Site settings row (agar nahi hai)
INSERT INTO public.site_settings (id, name, tagline, bio, email, primary_color)
VALUES (1, 'Kamaldeep', 'Digital Marketer with AI,SEO Specialist,Video Editor,AI Content Creator',
        'I mix digital marketing with the power of AI to build smarter content, better SEO and campaigns that actually get noticed.',
        'kamalsheokand615@gmail.com', '#2563eb')
ON CONFLICT (id) DO NOTHING;
