
-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-images', 'plant-images', true);

-- Allow anyone to upload to plant-images bucket
CREATE POLICY "Anyone can upload plant images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'plant-images');

-- Allow anyone to read plant images
CREATE POLICY "Anyone can read plant images" ON storage.objects FOR SELECT USING (bucket_id = 'plant-images');
