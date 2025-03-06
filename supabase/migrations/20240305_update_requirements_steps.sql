-- Update the requirements and how_to_steps structure to remove description fields
-- This is a schema change that will be applied to all existing and new collections

-- Create a function to update the JSON structure
CREATE OR REPLACE FUNCTION update_json_structure()
RETURNS void AS $$
DECLARE
  collection_record RECORD;
  updated_requirements JSONB;
  updated_steps JSONB;
BEGIN
  FOR collection_record IN SELECT id, requirements, how_to_steps FROM airdrop_collections LOOP
    -- Update requirements to remove description
    updated_requirements = '[]'::JSONB;
    FOR i IN 0..jsonb_array_length(collection_record.requirements)-1 LOOP
      updated_requirements = updated_requirements || jsonb_build_object(
        'id', collection_record.requirements->i->>'id',
        'title', collection_record.requirements->i->>'title'
      );
    END LOOP;
    
    -- Update how_to_steps to remove description
    updated_steps = '[]'::JSONB;
    FOR i IN 0..jsonb_array_length(collection_record.how_to_steps)-1 LOOP
      updated_steps = updated_steps || jsonb_build_object(
        'step', collection_record.how_to_steps->i->>'step',
        'title', collection_record.how_to_steps->i->>'title'
      );
    END LOOP;
    
    -- Update the record
    UPDATE airdrop_collections
    SET 
      requirements = updated_requirements,
      how_to_steps = updated_steps
    WHERE id = collection_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT update_json_structure();

-- Drop the function after use
DROP FUNCTION update_json_structure();

