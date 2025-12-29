-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General OPD',
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'urgent')),
  left_eye_image_url TEXT,
  right_eye_image_url TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  decision TEXT CHECK (decision IN ('normal', 'abnormal', 'urgent', 'refer')),
  findings TEXT,
  condition TEXT,
  ai_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view patients
CREATE POLICY "All authenticated users can view patients" 
ON public.patients 
FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow technicians to insert patients
CREATE POLICY "Authenticated users can insert patients" 
ON public.patients 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy to allow updates (for reviews)
CREATE POLICY "Authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
TO authenticated
USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for patient images
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-images', 'patient-images', true);

-- Create storage policies for patient images
CREATE POLICY "Anyone can view patient images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'patient-images');

CREATE POLICY "Authenticated users can upload patient images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'patient-images');

-- Enable realtime for patients table
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;