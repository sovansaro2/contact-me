-- Create the avatar bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for "avatar" bucket
-- Public users can read avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatar' );

-- Authenticated users can upload their own avatar
CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatar' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can update their own avatar
CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatar' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own avatar
CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatar' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
