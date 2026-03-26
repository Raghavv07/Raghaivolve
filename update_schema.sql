-- Add estimated_duration column to strategies table
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS estimated_duration text;

-- Add analysis column to strategies table (JSONB for flexibility)
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS analysis jsonb;

-- Optional: Update existing rows with default values if needed
-- UPDATE public.strategies SET estimated_duration = 'Unknown' WHERE estimated_duration IS NULL;
