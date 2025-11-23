const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DUMMY_AUCTION = {
    title: 'Vintage Leica M3 Camera',
    description: 'A pristine condition Leica M3 from 1954. Includes original 50mm Summicron lens and leather case. Fully functional and serviced recently. A collector\'s dream.',
    start_price: 1500000,
    current_price: 1500000, // Start at start_price, let bids update it
    min_increment: 50000,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Ends in 24 hours
    status: 'active',
};

// Bids in chronological order (Oldest -> Newest)
const DUMMY_BIDS = [
    { bidder_name: 'ShutterBug', amount: 1550000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { bidder_name: 'FilmFanatic', amount: 1600000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { bidder_name: 'RetroSnap', amount: 1850000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { bidder_name: 'LensLover', amount: 2000000, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { bidder_name: 'CameraCollector99', amount: 2100000, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

async function seedData() {
    console.log('🌱 Seeding dummy data...');

    // Insert Auction
    const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .insert(DUMMY_AUCTION)
        .select()
        .single();

    if (auctionError) {
        console.error('Error inserting auction:', auctionError);
        return;
    }

    console.log(`✅ Auction created: ${auction.title} (${auction.id})`);

    // Insert Bids sequentially to satisfy triggers
    console.log('Inserting bids...');
    for (const bid of DUMMY_BIDS) {
        const { error: bidError } = await supabase
            .from('bids')
            .insert({
                ...bid,
                auction_id: auction.id,
            });

        if (bidError) {
            console.error(`Error inserting bid for ${bid.amount}:`, bidError.message);
            // Continue with other bids or stop? Let's stop to avoid cascading errors
            return;
        }
        console.log(`  -> Bid placed: ${bid.amount} by ${bid.bidder_name}`);

        // Small delay to ensure DB processes trigger (optional but safe)
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ ${DUMMY_BIDS.length} bids created.`);
    console.log('✨ Seeding complete!');
    console.log(`\nTo view this auction, navigate to /auction/${auction.id}`);
}

seedData();
