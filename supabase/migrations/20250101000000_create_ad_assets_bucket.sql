/*
          # Create Storage Bucket for Ad Assets
          This migration creates a new public storage bucket named 'ad_assets' to store user-uploaded images for ad generation. It also sets up Row Level Security (RLS) policies to allow public read access and authenticated user upload access, which is suitable for this application's architecture where the anon key is used.

          ## Query Description: [This operation sets up the necessary storage infrastructure. It is safe to run and will not affect existing data. It simply adds a new bucket and access policies.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Creates bucket: storage.buckets(id='ad_assets')
          - Creates policies on: storage.objects
          
          ## Security Implications:
          - RLS Status: Enabled on storage.objects by default.
          - Policy Changes: Yes, adds new policies for the 'ad_assets' bucket.
          - Auth Requirements: Uploads are restricted to users with a valid JWT (including the anon key). Reads are public.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

-- Create a public bucket "ad_assets" if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad_assets', 'ad_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow anonymous users to view images in the "ad_assets" bucket.
CREATE POLICY "Public Read Access for ad_assets"
ON storage.objects FOR SELECT
TO anon
USING ( bucket_id = 'ad_assets' );

-- Create a policy to allow anonymous users to upload images to the "ad_assets" bucket.
-- This is suitable for this app's use case where the anon key is used for all interactions.
CREATE POLICY "Anon Upload Access for ad_assets"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'ad_assets' );
