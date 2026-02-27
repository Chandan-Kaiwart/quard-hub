
-- Create enums
CREATE TYPE public.participant_category AS ENUM ('UG_STUDENT', 'PG_STUDENT', 'RESEARCH_SCHOLAR', 'FACULTY', 'PROFESSIONAL');
CREATE TYPE public.workshop_track AS ENUM ('QUANTUM_SECURITY', 'POST_QUANTUM', 'CRYPTOGRAPHY', 'AI_CYBERSECURITY', 'DARK_WEB', 'BLOCKCHAIN', 'MOBILE_FORENSICS', 'UAV_FORENSICS');
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE public.app_role AS ENUM ('admin', 'coordinator');

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  category participant_category NOT NULL,
  track_interest workshop_track NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  college_id_url TEXT,
  payment_screenshot_url TEXT,
  confirmation_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: Anyone can insert registrations (public form)
CREATE POLICY "Anyone can register" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- RLS: Only admins/coordinators can read registrations
CREATE POLICY "Admins can read registrations" ON public.registrations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator'));

-- RLS: Only admins can update registrations
CREATE POLICY "Admins can update registrations" ON public.registrations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS for user_roles: admins can read
CREATE POLICY "Admins can read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Public stats view
CREATE VIEW public.registration_stats AS
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE payment_status = 'VERIFIED') AS verified,
  COUNT(*) FILTER (WHERE payment_status = 'PENDING') AS pending,
  COUNT(*) FILTER (WHERE payment_status = 'REJECTED') AS rejected
FROM public.registrations;

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('registration-uploads', 'registration-uploads', true);

-- Storage policies
CREATE POLICY "Anyone can upload registration files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'registration-uploads');

CREATE POLICY "Anyone can read registration files" ON storage.objects
  FOR SELECT USING (bucket_id = 'registration-uploads');

CREATE POLICY "Admins can delete registration files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'registration-uploads' AND public.has_role(auth.uid(), 'admin'));
