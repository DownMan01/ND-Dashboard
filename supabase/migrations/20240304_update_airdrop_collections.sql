-- Drop existing table if it exists
DROP TABLE IF EXISTS public.airdrop_collections;

-- Create the updated airdrop_collections table
CREATE TABLE public.airdrop_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    name TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    backers TEXT[], -- Array of backer names
    chain TEXT NOT NULL,
    cost DECIMAL(10, 2), -- Cost in USD
    stage TEXT DEFAULT 'upcoming' CHECK (stage IN ('active', 'upcoming', 'ended')),
    requirements JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of requirement objects
    how_to_steps JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of step objects
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.airdrop_collections ENABLE ROW LEVEL SECURITY;

-- Create policies (same as before)
CREATE POLICY "Users can view own collections" ON public.airdrop_collections
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON public.airdrop_collections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON public.airdrop_collections
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON public.airdrop_collections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_airdrop_collections_user_id ON public.airdrop_collections(user_id);
CREATE INDEX idx_airdrop_collections_created_at ON public.airdrop_collections(created_at);
CREATE INDEX idx_airdrop_collections_stage ON public.airdrop_collections(stage);
CREATE INDEX idx_airdrop_collections_chain ON public.airdrop_collections(chain);

-- Insert sample data
INSERT INTO public.airdrop_collections (
    name,
    subtitle,
    image_url,
    description,
    backers,
    chain,
    cost,
    stage,
    requirements,
    how_to_steps,
    user_id
) VALUES (
    'Arbitrum Odyssey',
    'Join the Arbitrum ecosystem exploration campaign',
    'https://example.com/arbitrum-odyssey.png',
    'Arbitrum Odyssey is a comprehensive campaign designed to help users explore and engage with various protocols in the Arbitrum ecosystem. Participants can earn rewards by completing different tasks and interactions with selected protocols.',
    ARRAY['Arbitrum Foundation', 'Arbitrum DAO', 'Various DeFi protocols'],
    'Arbitrum',
    0.00,
    'active',
    '[
        {
            "id": 1,
            "title": "Ethereum Wallet",
            "description": "Must have an Ethereum wallet (e.g., MetaMask)"
        },
        {
            "id": 2,
            "title": "Minimum Balance",
            "description": "Must have at least 0.01 ETH for gas fees"
        },
        {
            "id": 3,
            "title": "Bridge Requirement",
            "description": "Must bridge assets to Arbitrum One"
        },
        {
            "id": 4,
            "title": "Transaction History",
            "description": "Must have at least one transaction on Arbitrum"
        }
    ]',
    '[
        {
            "step": 1,
            "title": "Set Up Wallet",
            "description": "Install MetaMask and set up an Ethereum wallet"
        },
        {
            "step": 2,
            "title": "Add Arbitrum Network",
            "description": "Add Arbitrum One network to your MetaMask"
        },
        {
            "step": 3,
            "title": "Bridge Assets",
            "description": "Bridge ETH from Ethereum to Arbitrum using the official bridge"
        },
        {
            "step": 4,
            "title": "Complete Tasks",
            "description": "Interact with specified protocols on the platform"
        },
        {
            "step": 5,
            "title": "Claim Rewards",
            "description": "Verify tasks and claim your rewards through the dashboard"
        }
    ]',
    '6f21c789-2e37-4c48-b338-47c42c1b1801' -- Replace with actual user_id
),
(
    'Layer Zero Airdrop',
    'Cross-chain interoperability protocol token distribution',
    'https://example.com/layerzero.png',
    'LayerZero is launching a token airdrop for users who have participated in cross-chain activities using their protocol. Early adopters and active users will be rewarded based on their interaction history.',
    ARRAY['LayerZero Labs', 'Stargate Finance', 'Multiple VCs'],
    'Multiple',
    0.00,
    'upcoming',
    '[
        {
            "id": 1,
            "title": "Cross-chain Activity",
            "description": "Must have used LayerZero for cross-chain transactions"
        },
        {
            "id": 2,
            "title": "Volume Requirement",
            "description": "Minimum $100 in transaction volume"
        },
        {
            "id": 3,
            "title": "Time Requirement",
            "description": "Must have used the protocol before 2024"
        },
        {
            "id": 4,
            "title": "Wallet Age",
            "description": "Wallet must be at least 3 months old"
        }
    ]',
    '[
        {
            "step": 1,
            "title": "Connect Wallet",
            "description": "Connect your wallet to LayerZero platform"
        },
        {
            "step": 2,
            "title": "Verify Activity",
            "description": "Check your eligibility based on past activities"
        },
        {
            "step": 3,
            "title": "Complete KYC",
            "description": "Complete the required KYC process if eligible"
        },
        {
            "step": 4,
            "title": "Sign Message",
            "description": "Sign a message to verify wallet ownership"
        },
        {
            "step": 5,
            "title": "Claim Tokens",
            "description": "Claim your tokens once the airdrop is live"
        }
    ]',
    '6f21c789-2e37-4c48-b338-47c42c1b1801' -- Replace with actual user_id
),
(
    'Celestia Token Launch',
    'Modular blockchain data availability layer token distribution',
    'https://example.com/celestia.png',
    'Celestia is distributing tokens to early supporters and users who have participated in their testnet activities. The airdrop rewards users who have helped test and validate the network.',
    ARRAY['Celestia Labs', 'Celestia Foundation'],
    'Celestia',
    0.00,
    'ended',
    '[
        {
            "id": 1,
            "title": "Testnet Participation",
            "description": "Must have participated in Celestia testnet"
        },
        {
            "id": 2,
            "title": "Node Operation",
            "description": "Must have run a Celestia node"
        },
        {
            "id": 3,
            "title": "Validation Activity",
            "description": "Must have validated transactions"
        },
        {
            "id": 4,
            "title": "Community Engagement",
            "description": "Must have participated in governance"
        }
    ]',
    '[
        {
            "step": 1,
            "title": "Check Eligibility",
            "description": "Verify your participation in testnet activities"
        },
        {
            "step": 2,
            "title": "Create Wallet",
            "description": "Create a Celestia compatible wallet"
        },
        {
            "step": 3,
            "title": "Connect Wallet",
            "description": "Connect your wallet to the airdrop platform"
        },
        {
            "step": 4,
            "title": "Verify Identity",
            "description": "Complete the verification process"
        },
        {
            "step": 5,
            "title": "Claim Airdrop",
            "description": "Claim your TIA tokens"
        }
    ]',
    '6f21c789-2e37-4c48-b338-47c42c1b1801' -- Replace with actual user_id
);

