-- Create the airdrop_collections table
CREATE TABLE public.airdrop_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.airdrop_collections ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own collections
CREATE POLICY "Users can view own collections" ON public.airdrop_collections
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own collections
CREATE POLICY "Users can insert own collections" ON public.airdrop_collections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own collections
CREATE POLICY "Users can update own collections" ON public.airdrop_collections
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own collections
CREATE POLICY "Users can delete own collections" ON public.airdrop_collections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_airdrop_collections_user_id ON public.airdrop_collections(user_id);
CREATE INDEX idx_airdrop_collections_created_at ON public.airdrop_collections(created_at);

